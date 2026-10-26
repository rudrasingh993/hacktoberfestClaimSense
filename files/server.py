"""ClaimSense web UI. Run: python server.py  ->  opens http://localhost:8000
Uses the same tools.py as the CLI, so every number is calculated by Python."""
import json
import os
import subprocess
import sys
import webbrowser
from urllib.parse import parse_qs, urlparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import app
import tools

BASE = Path(__file__).parent
WEB = BASE / "web"


def policies():
    return json.loads((BASE / "policy.json").read_text(encoding="utf-8"))


def config(name=None):
    profile, cats, pname = app.load_policy(name)
    return {"profile": pname, "insurer": profile["insurer"], "limit": tools.resolve_room_limit(profile),
            "copay": profile["copay_percent"], "sum_insured": profile.get("sum_insured"),
            "proportionate": profile["proportionate_deduction"], "sublimits": profile.get("sublimits", {}),
            "categories": cats}


def estimate(body):
    profile, cats, pname = app.load_policy(body.get("profile"))
    keys = {"rent": "room_rent_per_day", "days": "days", "other": "other_charges"}
    values = {}
    for k, name in keys.items():
        v = body.get(k)
        if v is None:
            raise ValueError(f"Missing input: {name}")
        if type(v) not in (int, float):
            raise ValueError(f"{name} must be a number")
        values[name] = v
    values["copay_percent"] = body.get("copay")
    treat = body.get("treatment")
    sub = profile.get("sublimits", {}).get(treat) if treat else None
    out = app.calculate(values, "", profile, cats, sub, use_llm=False)
    inp, rows = out["inputs"], out["comparison"]
    best = None
    if inp["rent"] > inp["limit"]:
        ok = [r for r in rows if r["rent"] <= inp["limit"]]
        if ok:
            best = dict(ok[-1], saving=out["results"][3]["out_of_pocket"] - ok[-1]["out_of_pocket"])
    return {"inputs": inp, "results": out["results"], "report": out["report"],
            "comparison": rows, "best": best}


def understand(body):
    try:
        return app.understand(str(body.get("text", "")), use_llm=bool(body.get("llm")))
    except Exception as e:
        if body.get("llm"):
            raise ValueError(f"Gemma 4 is not reachable ({type(e).__name__}). Start Ollama or untick the box.")
        raise


def run_check():
    r = subprocess.run([sys.executable, str(BASE / "check_all.py")], cwd=BASE, capture_output=True,
                       text=True, timeout=90, env=dict(os.environ, PYTHONIOENCODING="utf-8"))
    lines = [{"ok": l.startswith("CAUGHT"), "name": l[8:].strip()}
             for l in r.stdout.splitlines() if l.startswith(("CAUGHT", "MISSED"))]
    summ = [l for l in r.stdout.splitlines() if l.startswith("Caught")]
    return {"lines": lines, "summary": summ[0] if summ else (r.stderr[-300:] or "check failed")}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        u = urlparse(self.path)
        try:
            if u.path in ("/", "/index.html"):
                self._send(200, (WEB / "index.html").read_bytes(), "text/html")
            elif u.path == "/api/config":
                self._send(200, config(parse_qs(u.query).get("profile", [None])[0]))
            elif u.path == "/api/policies":
                self._send(200, policies())
            elif u.path == "/api/check":
                self._send(200, run_check())
            else:
                self._send(404, {"error": "not found"})
        except (tools.ToolError, ValueError, KeyError, subprocess.SubprocessError) as e:
            self._send(400, {"error": f"{type(e).__name__}: {e}"})

    def do_POST(self):
        routes = {"/api/estimate": estimate, "/api/understand": understand}
        fn = routes.get(urlparse(self.path).path)
        if not fn:
            return self._send(404, {"error": "not found"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            self._send(200, fn(body))
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
    print(f"ClaimSense UI running at {url}  (keep this window open, Ctrl+C to stop)")
    webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
