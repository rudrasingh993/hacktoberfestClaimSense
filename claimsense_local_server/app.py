"""ClaimSense host. Owns the loop, the rules, the gates and the Ollama calls.
Run:  python app.py            (uses the local Gemma model via Ollama)
      python app.py --no-llm   (pure Python path, no model, handy for testing)
"""
import json
import re
import sys
import time
from pathlib import Path

import gates
import tools

BASE = Path(__file__).parent
MODEL = "gemma4:e4b"          # change if `ollama list` shows a different tag
MAX_STEPS = 4
LOGFILE = BASE / "claimsense.log"
KEYS = ("room_rent_per_day", "days", "other_charges", "copay_percent")
LABELS = {"room_rent_per_day": "room rent per day (e.g. 'room 8000 per day')",
          "days": "number of days (e.g. '3 days')",
          "other_charges": "other charges besides room (e.g. 'other charges 120000')"}


class AgentStop(Exception):
    pass


def log(kind, **data):
    with open(LOGFILE, "a", encoding="utf-8") as f:
        f.write(json.dumps({"t": time.strftime("%Y-%m-%d %H:%M:%S"), "kind": kind, **data},
                           ensure_ascii=False) + "\n")


def load_policy(name=None):
    p = json.loads((BASE / "policy.json").read_text(encoding="utf-8"))
    name = name or p["default_profile"]
    return p["profiles"][name], p["room_categories"], name


# ---------------- step 3 and 4: input check and extraction ----------------

EXTRACT_PROMPT = (
    "Extract values from the user's text about a hospital estimate. Reply with JSON only, keys: "
    "room_rent_per_day, days, other_charges, copay_percent. Use null for anything not stated. "
    "Never guess or calculate. Convert Indian numbers like 1,20,000 to 120000."
)


def _grab(pattern, text):
    m = re.search(pattern, text, re.I)
    if m:
        for g in m.groups():
            if g:
                return float(g.replace(",", ""))
    return None


def extract_plain(text):
    return {
        "room_rent_per_day": _grab(r"(?:room|rent)[^\d]{0,30}(\d[\d,]*(?:\.\d+)?)", text),
        "days": _grab(r"(\d+)\s*(?:days?|nights?)", text),
        "other_charges": _grab(r"(?:other|medicine|treatment|doctor)[^\d]{0,30}(\d[\d,]*(?:\.\d+)?)", text),
        "copay_percent": _grab(r"co-?pay[^\d]{0,15}(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*%\s*co-?pay", text),
    }


def extract_llm(text):
    import ollama
    resp = ollama.chat(model=MODEL, format="json", options={"temperature": 0},
                       messages=[{"role": "system", "content": EXTRACT_PROMPT},
                                 {"role": "user", "content": text}])
    try:
        return json.loads(resp.message.content)
    except (json.JSONDecodeError, TypeError):
        return {}


def validate_values(values, text):
    """Every number must really appear in the user's text, otherwise it is treated as missing."""
    nums = gates.numbers_in(text)
    clean, invented = {}, []
    for k in KEYS:
        v = values.get(k) if isinstance(values, dict) else None
        if type(v) in (int, float) and gates.in_set(v, nums):
            clean[k] = float(v)
        else:
            clean[k] = None
            if v is not None:
                invented.append(k)
    return clean, invented


def understand(text, use_llm=True):
    text = (text or "").strip()
    if not text:
        log("rejected", reason="empty")
        return {"status": "rejected", "message": "Empty request. Please describe the room rent, days and other charges."}
    if gates.is_injection(text):
        log("rejected", reason="prompt injection", text=text)
        return {"status": "rejected", "message": "Rejected: this looks like an attempt to change the result. "
                                                   "ClaimSense only calculates from your numbers."}
    raw = extract_llm(text) if use_llm else extract_plain(text)
    values, invented = validate_values(raw, text)
    if invented:
        log("invented_values_dropped", keys=invented)
    missing = gates.find_missing(values)
    if missing:
        log("need_input", missing=missing)
        return {"status": "need_input", "values": values, "missing": missing,
                "message": "I still need: " + "; ".join(LABELS[m] for m in missing) + "."}
    return {"status": "ok", "values": values}


# ---------------- steps 5 to 11: the tool loop with three gates ----------------

def run_tools_with_llm(inputs, user_text, skill):
    import ollama
    allowed = gates.numbers_in(user_text) | {1.0}
    allowed |= {float(v) for v in inputs.values() if type(v) in (int, float)}
    results = []
    for step in range(MAX_STEPS):
        expected = tools.ORDER[step]
        note = "" if inputs["proportionate"] else " The policy has no proportionate deduction: use ratio 1.0."
        prompt = (f"Confirmed values: {json.dumps(inputs)}\nPrevious tool results: {json.dumps(results)}\n"
                  f"Call the tool '{expected}' now using only these numbers.{note}")
        resp = ollama.chat(model=MODEL, options={"temperature": 0}, tools=[tools.TOOLS[expected]],
                           messages=[{"role": "system", "content": skill}, {"role": "user", "content": prompt}])
        calls = resp.message.tool_calls or []
        if not calls:
            raise AgentStop(f"model did not call '{expected}'")
        call = calls[0]                                   # one tool per turn
        name, args = call.function.name, call.function.arguments
        args = dict(args) if args is not None else args
        for ok, why in (gates.gate1(name, expected), gates.gate2(name, args, allowed)):
            if not ok:
                log("blocked", step=step, tool=name, args=str(args), why=why)
                raise AgentStop(why)
        out = gates.gate3(name, args)
        if not out["ok"]:
            log("tool_error", tool=name, error=out["error"])
            raise AgentStop(out["error"])
        results.append(out["result"])
        allowed |= gates.numbers_in(json.dumps(out["result"]))
        log("tool_ok", tool=name, args=args, result=out["result"])
    return results


def calculate(values, text, profile, categories, sublimit=None, use_llm=True):
    rent, days, other = values["room_rent_per_day"], int(values["days"]), values["other_charges"]
    copay = values["copay_percent"] if values.get("copay_percent") is not None else profile["copay_percent"]
    limit = tools.resolve_room_limit(profile)
    prop = profile["proportionate_deduction"]
    inp, det = tools.run_pipeline(rent, days, other, limit, copay, sublimit, prop)
    results, warning = det, None
    if use_llm:
        skill = (BASE / "SKILL.md").read_text(encoding="utf-8")
        agent_inputs = {"room_rent_per_day": rent, "days": days, "other_charges": other,
                        "copay_percent": copay, "room_limit_per_day": limit,
                        "total_bill": inp["total_bill"], "sublimit": sublimit, "proportionate": prop}
        results = run_tools_with_llm(agent_inputs, text, skill)
        if gates.cross_check(results[3]["out_of_pocket"], det[3]["out_of_pocket"]):
            warning = "Model path disagreed with the Python recomputation; showing the Python result."
            log("cross_check_mismatch", agent=results[3], python=det[3])
            results = det
    rows = tools.compare_rooms(days, other, limit, copay, sublimit, prop, categories)
    log("result", inputs=inp, results=results)
    return {"inputs": inp, "results": results, "report": tools.build_report(inp, results),
            "comparison": rows, "warning": warning}


def suggestion(out):
    inp, rows = out["inputs"], out["comparison"]
    if inp["rent"] <= inp["limit"]:
        return "Your chosen room is within the policy limit, so no room-rent deduction applies."
    ok = [r for r in rows if r["rent"] <= inp["limit"]]
    if not ok:
        return "No room category in the list is within the limit. Check the policy with the insurer."
    best = ok[-1]
    saved = out["results"][3]["out_of_pocket"] - best["out_of_pocket"]
    return (f"Suggestion: '{best['category']}' ({tools.inr(best['rent'])}/day) stays within your limit. "
            f"Estimated family share would be {tools.inr(best['out_of_pocket'])}, about {tools.inr(saved)} less.")


def print_result(out, profile_name):
    print("\n--- Step by step (calculated by Python tools) ---")
    print("\n".join(out["report"]))
    if out["warning"]:
        print("WARNING:", out["warning"])
    print("\n--- Same bill in every room category ---")
    print(f"{'Room':<16}{'Rent/day':>12}{'Insurer pays':>15}{'Family pays':>15}")
    for r in out["comparison"]:
        print(f"{r['category']:<16}{tools.inr(r['rent']):>12}{tools.inr(r['insurer_payable']):>15}{tools.inr(r['out_of_pocket']):>15}")
    print("\n" + suggestion(out))
    print(f"\nPolicy profile: {profile_name}. This is an estimate, not insurance, medical or legal advice. "
          "The insurer's decision is final. Verify rules against your actual policy.")


def main():
    use_llm = "--no-llm" not in sys.argv
    profile, categories, pname = load_policy()
    text = input("Describe the policy and hospital estimate: ")
    while True:
        r = understand(text, use_llm)
        if r["status"] == "rejected":
            print(r["message"])
            return
        if r["status"] == "need_input":
            print(r["message"])
            text += " " + input("> ")
            continue
        v = r["values"]
        copay = v["copay_percent"] if v["copay_percent"] is not None else profile["copay_percent"]
        print(f"\nI understood: room {tools.inr(v['room_rent_per_day'])} x {int(v['days'])} days, "
              f"other charges {tools.inr(v['other_charges'])}, co-pay {copay:g}%, "
              f"room limit {tools.inr(tools.resolve_room_limit(profile))}/day.")
        if input("Is this correct? (y/n): ").strip().lower() == "y":
            break
        text = input("Please re-enter the details: ")
    sub = None
    if profile.get("sublimits"):
        t = input(f"Treatment with a sub-limit {list(profile['sublimits'])}? (Enter to skip): ").strip().lower()
        sub = profile["sublimits"].get(t)
    try:
        out = calculate(v, text, profile, categories, sub, use_llm)
    except AgentStop as e:
        print(f"Stopped safely: {e}")
        return
    print_result(out, pname)


if __name__ == "__main__":
    main()
