"""ClaimSense web UI. Run: python server.py  ->  opens http://localhost:8000
Uses the same tools.py as the CLI, so every number is calculated by Python."""
import json
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import app
import tools

WEB = Path(__file__).parent / "web"
PROFILE, CATS, PNAME = app.load_policy()
LIMIT = tools.resolve_room_limit(PROFILE)


def config():
    return {"profile": PNAME, "insurer": PROFILE["insurer"], "limit": LIMIT,
            "copay": PROFILE["copay_percent"], "sum_insured": PROFILE.get("sum_insured"),
            "proportionate": PROFILE["proportionate_deduction"], "categories": CATS}


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
    values["copay_percent"] = body.get("copay")
    out = app.calculate(values, "", PROFILE, CATS, None, use_llm=False)
    inp, rows = out["inputs"], out["comparison"]
    best = None
    if inp["rent"] > inp["limit"]:
        ok = [r for r in rows if r["rent"] <= inp["limit"]]
        if ok:
            best = dict(ok[-1], saving=out["results"][3]["out_of_pocket"] - ok[-1]["out_of_pocket"])
    return {"inputs": inp, "results": out["results"], "report": out["report"],
            "comparison": rows, "best": best}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self._send(200, (WEB / "index.html").read_bytes(), "text/html")
        elif self.path == "/api/config":
            self._send(200, config())
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/api/estimate":
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
    print(f"ClaimSense UI running at {url}  (keep this window open, Ctrl+C to stop)")
    webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
