"""check_ollama.py: Checks status of local Ollama service and configured models.
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.agent.ollama_client import ollama_client

def main():
    print("Checking local Ollama status for ClaimSense...")
    status = ollama_client.check_status()
    print(f"Ollama Reachable: {status.get('ollama_available')}")
    print(f"Configured Model: {status.get('model_name')}")
    print(f"Model Available: {status.get('model_available')}")
    print(f"Installed Models: {status.get('installed_models', [])}")
    print(f"Status: {status.get('status')}")
    if status.get("instructions"):
        print(f"Note: {status.get('instructions')}")

if __name__ == "__main__":
    main()
