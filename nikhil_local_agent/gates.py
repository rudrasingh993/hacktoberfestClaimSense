"""The three gates, plus input checks. No model involved."""
import inspect
import math
import re

import tools

REQUIRED = ("room_rent_per_day", "days", "other_charges")

INJECTION_PATTERNS = [
    r"fully covered", r"say (that )?the claim", r"\bapprove",
    r"ignore\b.{0,40}\b(rules?|instructions?|polic(y|ies)|limits?)",
    r"disregard", r"override", r"pretend", r"you are now",
    r"(system|developer) prompt", r"no deduction", r"100\s*%\s*(covered|payable)",
]


def numbers_in(text):
    out = set()
    for m in re.findall(r"\d[\d,]*(?:\.\d+)?", str(text)):
        try:
            out.add(float(m.replace(",", "")))
        except ValueError:
            pass
    return out


def in_set(value, allowed):
    return any(math.isclose(value, a, rel_tol=1e-6, abs_tol=0.005) for a in allowed)


def is_injection(text):
    return any(re.search(p, text, re.I | re.S) for p in INJECTION_PATTERNS)


def find_missing(values):
    return [k for k in REQUIRED if values.get(k) is None]


def gate1(tool_name, expected_next):
    """Allowlist + fixed order."""
    if tool_name not in tools.TOOLS:
        return False, f"Blocked: '{tool_name}' is not a registered tool"
    if tool_name != expected_next:
        return False, f"Blocked: expected '{expected_next}' but got '{tool_name}'"
    return True, "ok"


def gate2(tool_name, args, allowed_numbers):
    """Arguments must be a dict matching the signature; numbers must come from the user, policy or earlier results."""
    if not isinstance(args, dict):
        return False, "Blocked: arguments must be a dictionary"
    try:
        inspect.signature(tools.TOOLS[tool_name]).bind(**args)
    except TypeError as e:
        return False, f"Blocked: arguments do not match the tool signature ({e})"
    for k, v in args.items():
        if type(v) in (int, float) and not in_set(v, allowed_numbers):
            return False, f"Blocked: value {v} for '{k}' does not appear in the request (possible invented value)"
    return True, "ok"


def gate3(tool_name, args):
    """Safe execution: errors come back as structured results, never a crash."""
    try:
        return {"ok": True, "result": tools.TOOLS[tool_name](**args)}
    except tools.ToolError as e:
        return {"ok": False, "error": str(e)}
    except Exception as e:
        return {"ok": False, "error": f"unexpected error: {type(e).__name__}: {e}"}


def cross_check(agent_value, python_value):
    """True if the agent's number disagrees with the independent Python recomputation."""
    return abs(agent_value - python_value) > 0.5
