.PHONY: setup test run-backend run-frontend check-ollama clean

setup:
	python -m venv venv
	.\venv\Scripts\pip install -r backend/requirements.txt
	cd frontend && npm install --legacy-peer-deps

test:
	powershell -Command "$$env:PYTHONPATH='backend'; .\venv\Scripts\python -m pytest backend/tests -v"
	.\venv\Scripts\python scripts/check_all.py

check-ollama:
	.\venv\Scripts\python scripts/check_ollama.py

run-backend:
	.\venv\Scripts\uvicorn app.main:app --app-dir backend --reload --port 8000

run-frontend:
	cd frontend && npm run dev
