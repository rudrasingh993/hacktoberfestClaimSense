import sys
import urllib.parse
from pathlib import Path

# Add project root and backend directory to sys.path for Vercel serverless runtime
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"

for p in [str(BACKEND_DIR), str(PROJECT_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app as fastapi_app
from app.config import find_file
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

# If static assets were bundled or routed to Python, serve frontend gracefully
dist_dir = find_file("frontend/dist")
dist_index = dist_dir / "index.html"
dist_assets = dist_dir / "assets"

if dist_assets.exists():
    try:
        fastapi_app.mount("/assets", StaticFiles(directory=str(dist_assets)), name="assets")
    except Exception:
        pass

@fastapi_app.get("/", response_class=HTMLResponse)
@fastapi_app.get("/index.html", response_class=HTMLResponse)
async def serve_root():
    if dist_index.exists():
        with open(dist_index, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse("<html><body><h1>ClaimSense</h1><p>Frontend loading...</p></body></html>")

@fastapi_app.get("/favicon.svg")
async def serve_favicon():
    fav = dist_dir / "favicon.svg"
    if fav.exists():
        return FileResponse(fav)
    return HTMLResponse("", status_code=404)

class VercelPathRewriteMiddleware:
    def __init__(self, inner_app):
        self.inner_app = inner_app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            query_bytes = scope.get("query_string", b"")
            query_str = query_bytes.decode("latin1", errors="replace")
            parsed_query = urllib.parse.parse_qs(query_str, keep_blank_values=True)
            if "__path__" in parsed_query:
                subpath = parsed_query.pop("__path__")[0].lstrip("/")
                scope["path"] = f"/api/{subpath}" if subpath else "/api"
                scope["raw_path"] = scope["path"].encode("latin1")
                new_query = urllib.parse.urlencode(parsed_query, doseq=True)
                scope["query_string"] = new_query.encode("latin1")
        await self.inner_app(scope, receive, send)

# Wrapped ASGI application for Vercel serverless runtime
app = VercelPathRewriteMiddleware(fastapi_app)
handler = app
