import sys
from pathlib import Path

# Add project root and backend directory to sys.path for Vercel serverless runtime
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"

for p in [str(BACKEND_DIR), str(PROJECT_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app

# Vercel ASGI serverless handler
handler = app
