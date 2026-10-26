# Contributing to ClaimSense

Thank you for your interest in contributing to **ClaimSense** for Hacktoberfest 2026!

## Core Engineering Principles

1. **Deterministic Calculation Integrity**:
   - The AI language model is strictly prohibited from computing final mathematical or financial figures.
   - All financial logic must reside in Python modules under `backend/app/calculation/`.
   - Never use floating point math for currency; use integer paise and `Decimal` with `ROUND_HALF_UP`.

2. **The Three Security Gates**:
   - Gate 1: Tool Allowlist (`guards.py`).
   - Gate 2: Strict Argument Validation & Type Guards (rejecting boolean-as-int coercion).
   - Gate 3: Safe Execution & Workflow Order Lock (`validate → calculate → compare`).

3. **Local AI Only**:
   - Do not add remote cloud AI integrations (OpenAI, Gemini, Anthropic).
   - Inference runs locally on loopback via Ollama.

4. **Testing Requirements**:
   - Every new policy rule or calculation adjustment must include unit tests in `backend/tests/`.
   - Run the complete verification suite before submitting PRs:
     ```powershell
     .\venv\Scripts\python scripts/check_all.py
     ```

## Development Workflow

1. Clone repository and install backend virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\pip install -r backend/requirements.txt
   ```
2. Install frontend dependencies:
   ```powershell
   cd frontend
   npm install --legacy-peer-deps
   ```
3. Run backend:
   ```powershell
   .\venv\Scripts\uvicorn app.main:app --app-dir backend --reload --port 8000
   ```
4. Run frontend:
   ```powershell
   cd frontend
   npm run dev
   ```
