"""ClaimSense web UI. Run: python server.py  ->  opens http://localhost:8000
Uses the same tools.py as the CLI, so every number is calculated by Python.
New: /api/profiles (policies from policies_extra.json), profile-aware /api/estimate,
and web/feat.js is injected into the page (Policies tab, confirm dialog, 3-language summary, print)."""
import json
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

import app
import tools

HERE = Path(__file__).parent
WEB = HERE / "web"
PROFILE, CATS, PNAME = app.load_policy()
LIMIT = tools.resolve_room_limit(PROFILE)
BIG_SI = 10_000_000  # stands in for "no room limit": 100% of this per day


def config():
    return {"profile": PNAME, "insurer": PROFILE["insurer"], "limit": LIMIT,
            "copay": PROFILE["copay_percent"], "sum_insured": PROFILE.get("sum_insured"),
            "proportionate": PROFILE["proportionate_deduction"], "categories": CATS}


# ---------- extra policies ----------
def _category_rent(name):
    """Find a room category's rent per day in CATS (list of dicts or a dict)."""
    items = CATS.items() if isinstance(CATS, dict) else enumerate(CATS)
    for key, c in items:
        if isinstance(c, dict):
            label = c.get("category") or c.get("name") or c.get("label")
            rent = c.get("rent") or c.get("rent_per_day")
        else:
            label, rent = key, c
        if str(label).strip().lower() == str(name).strip().lower() and isinstance(rent, (int, float)):
            return rent
    raise ValueError(f"room category '{name}' not found in policy.json")


def _normalise(p):
    """Return (profile dict the calculator can use, limit per day or None, label)."""
    t = p.get("room_limit_type")
    q = dict(p)
    if t == "none":
        q.update(room_limit_type="percent_of_sum_insured", room_limit_value=100, sum_insured=BIG_SI)
        return q, None, "No room limit"
    if t == "category":
        rent = _category_rent(p["room_limit_category"])
        q.update(room_limit_type="percent_of_sum_insured", room_limit_value=1, sum_insured=int(rent * 100))
        return q, rent, f"{p['room_limit_category']} room (Rs {int(rent):,}/day)"
    if t == "percent_of_sum_insured":
        lim = p["sum_insured"] * p["room_limit_value"] / 100
        return q, lim, f"{p['room_limit_value']}% of sum insured (Rs {int(lim):,}/day)"
    raise ValueError(f"unsupported room_limit_type {t!r}")


def load_extra():
    path = HERE / "policies_extra.json"
    if not path.exists():
        print("Note: policies_extra.json not found, only the default policy is available.")
        return {}, []
    data = json.loads(path.read_text(encoding="utf-8")).get("profiles", {})
    usable, cards = {}, []
    for pid, p in data.items():
        try:
            q, lim, label = _normalise(p)
        except Exception as e:  # keep going, tell the user which one failed
            print(f"Skipped policy {pid}: {e}")
            continue
        usable[pid] = q
        cards.append({"id": pid, "insurer": p["insurer"], "plan": p["plan"], "limit_label": label,
                      "limit": lim, "sum_insured": p.get("sum_insured"), "copay": p.get("copay_percent", 0),
                      "proportionate": bool(p.get("proportionate_deduction")),
                      "note": p.get("note", ""), "source": p.get("source", ""),
                      "url": p.get("url", ""), "date": p.get("date", "")})
    return usable, cards


EXTRA, EXTRA_CARDS = load_extra()


def estimate(body):
    keys = {"rent": "room_rent_per_day", "days": "days", "other": "other_charges"}
    values = {}
    for k, name in keys.items():
        v = body.get(k)
        if v is None:
            raise ValueError(f"Missing input: {name}")
        if type(v) not in (int, float):
            raise ValueError(f"{name} must be a number")
        values[name] = v
    pid = body.get("profile") or ""
    if pid and pid not in EXTRA:
        raise ValueError("Unknown policy")
    prof = EXTRA[pid] if pid else PROFILE
    values["copay_percent"] = None if pid else body.get("copay")  # a chosen policy sets its own co-pay
    out = app.calculate(values, "", prof, CATS, None, use_llm=False)
    inp, rows = out["inputs"], out["comparison"]
    best = None
    if inp["rent"] > inp["limit"]:
        ok = [r for r in rows if r["rent"] <= inp["limit"]]
        if ok:
            best = dict(ok[-1], saving=out["results"][3]["out_of_pocket"] - ok[-1]["out_of_pocket"])
    return {"inputs": inp, "results": out["results"], "report": out["report"],
            "comparison": rows, "best": best}


def page():
    html = (WEB / "index.html").read_text(encoding="utf-8")
    tag = '<script src="/feat.js"></script>'
    if "/feat.js" in html:
        return html.encode()
    if "</body>" in html:
        html = html.replace("</body>", tag + "</body>", 1)
    else:
        html += tag
    return html.encode()


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ("/", "/index.html"):
            self._send(200, page(), "text/html")
        elif path == "/feat.js" and (WEB / "feat.js").exists():
            self._send(200, (WEB / "feat.js").read_bytes(), "application/javascript")
        elif path == "/api/config":
            self._send(200, config())
        elif path == "/api/profiles":
            self._send(200, EXTRA_CARDS)
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if urlsplit(self.path).path != "/api/estimate":
            return self._send(404, {"error": "not found"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            self._send(200, estimate(body))
        except (tools.ToolError, ValueError, KeyError, TypeError, json.JSONDecodeError) as e:
            self._send(400, {"error": str(e)})

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    srv = None
    for port in range(8000, 8011):
        try:
            srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
            break
        except OSError:
            print(f"Port {port} is busy, trying the next one...")
    if srv is None:
        raise SystemExit("No free port between 8000 and 8010. Close other programs and try again.")
    url = f"http://localhost:{srv.server_address[1]}"
    print(f"ClaimSense UI running at {url}  ({len(EXTRA_CARDS)} extra policies loaded; Ctrl+C to stop)")
    webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass