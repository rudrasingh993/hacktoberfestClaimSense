# ClaimSense — The Offline AI Health Insurance Claim Estimator

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026-blue.svg)](https://hacktoberfest.com/)
[![Local AI](https://img.shields.io/badge/AI-Ollama%20%7C%20ClaimSense%20(Gemma%202)-purple.svg)](https://ollama.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B%20%7C%20FastAPI-green.svg)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/React%2019-TypeScript%20%7C%20Tailwind-blue.svg)](https://react.dev/)
[![Production](https://img.shields.io/badge/Vercel-Live%20Deployment-success.svg)](https://hacktopefestsubmit.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Event:** Hacktoberfest 2026 Hack Day  
> **Organizers:** Pune × NIAT-ADYPU  
> **Date:** October 26, 2026  
> **Project Category:** Local AI, Open Source, Healthcare Technology, Financial Transparency  
> **Live Production URL:** [https://hacktopefestsubmit.vercel.app](https://hacktopefestsubmit.vercel.app)  

---

## 💡 Overview

**ClaimSense** is a local-first healthcare-fintech application that protects Indian families from surprise out-of-pocket hospital bills caused by hidden insurance clauses: **room-rent limits, proportionate deductions, and co-payment penalties**.

In India, choosing a hospital room just ₹3,000 above your policy's daily limit can penalize your entire medical bill by **37.5%**, resulting in tens of thousands of rupees in out-of-pocket costs. ClaimSense answers five critical questions before hospital admission:

1. **How much of the hospital bill will the insurer likely pay?**
2. **How much will our family have to pay out of pocket?**
3. **How does choosing an upgraded room category penalize surgeon and OT charges?**
4. **Which room category eliminates financial penalties?**
5. **How can our family generate an authoritative TPA unbundling dispute letter before discharge?**

---

## 🛡️ Core Architectural Principles

- **Language Models are for Language**: Locally running open-weight **Gemma 2 (via Ollama)** handles document extraction, unstructured policy interpretation, TPA unbundling dispute letter generation, and multilingual plain-language explanations (English, Hindi, Marathi).
- **Python is for Financial Arithmetic**: The AI model **never performs mathematical calculations**. All currency arithmetic, eligibility ratios, proportionate penalties, and co-payments are derived deterministically in Python using integer paise and `Decimal` with `ROUND_HALF_UP`.
- **Zero Cloud Data Leakage**: 100% offline-ready. No medical data is sent to external cloud LLM providers.
- **Three Mandatory Security Gates**:
  1. *Gate 1: Static Tool Allowlist* — Restricts model tool calls to registered functions; blocks arbitrary reflection or execution.
  2. *Gate 2: Argument Schema & Type Guards* — Pydantic validation rejects booleans as integers (`True` as paise) and enforces strict ranges.
  3. *Gate 3: Safe Execution & Workflow State Machine* — Sequential order enforcement (`validate → calculate → compare`) with a 5-step loop circuit breaker.

---

## 🚀 Quickstart Guide (Step-by-Step From The Beginning)

### 1. Prerequisites
- **Python 3.10+** (Python 3.11/3.12 recommended)
- **Node.js 18+ & npm**
- **Ollama** installed ([https://ollama.com](https://ollama.com))

---

### 2. Model Setup with Ollama

Start the Ollama daemon and build the dedicated `claimsense` model with our custom `Modelfile` (trained on the ClaimSense SKILL system prompt):

```powershell
# 1. Start Ollama service (if not already running)
ollama serve

# 2. Pull the base Gemma 2 model
ollama pull gemma2:2b

# 3. Create the custom claimsense model bundled with SKILL.md rules
ollama create claimsense -f Modelfile
```

---

### 3. Backend Setup (FastAPI)

```powershell
# In the project root:
# 1. Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI backend server
uvicorn app.main:app --app-dir backend --reload --port 8000
```
- **Backend API**: `http://127.0.0.1:8000`
- **Swagger Interactive API Docs**: `http://127.0.0.1:8000/api/docs`
- **API Health Check**: `http://127.0.0.1:8000/api/health`

---

### 4. Frontend Setup (React 19 + Vite)

In a new terminal window:

```powershell
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## 💬 Terminal CLI Interface

ClaimSense provides two terminal CLI experiences:

### Option A: Direct Ollama CLI (`ollama run claimsense`)
Chat directly with the trained ClaimSense model in your terminal:
```powershell
ollama run claimsense
```
*Ask questions like:*
- *"How does proportionate deduction work for a ₹5,000 room rent cap?"*
- *"Can a hospital tie surgeon charges to room category under IRDAI guidelines?"*
- *"Draft a dispute letter for unbundling ICU nursing fees."*

### Option B: Interactive Python CLI Agent (`scripts/cli_agent.py`)
Combines local Ollama natural language understanding with the **authoritative Python financial calculation engine**:
```powershell
python scripts/cli_agent.py
```
**Interactive Commands:**
- `/estimate` — Run interactive pre-admission financial calculation using integer paise math.
- `/policies` — Browse 14 real-world and demo Indian health insurance policies.
- `/skill` — Print the authoritative ClaimSense reasoning rules (`SKILL.md`).
- `/help` — Show available commands.
- `exit` or `quit` — Exit the terminal agent.

---

## 🧪 Testing AI Capabilities

1. **Pre-Admission TPA Dispute Letter Generator**:
   - Go to `Results Page` or click **"Generate Dispute Letter"**.
   - Generates a formal legal letter citing IRDAI master circulars, disputing arbitrary surgeon and OT tariff inflation tied to room selection.
2. **Real-World Policy Catalog & Risk Analysis**:
   - Browse 14 authentic Indian health policies (HDFC ERGO Optima Secure, Star Health Comprehensive, Care Supreme, Niva Bupa ReAssure 2.0, New India Assurance, ICICI Lombard, etc.).
   - Access **Policy Risk Analysis** with risk factors, coverage scores, and AI recommendations.
3. **Multilingual Explanation Engine**:
   - Switch between **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** in the header.
   - All calculation results, warnings, and bill item breakdowns adapt dynamically.
4. **Clean PDF Audit Report**:
   - Click **"Print Report (PDF)"** to open the A4 print preview with clean page breaks, official audit banner, and full mathematical trace.

---

## 🔬 Automated Verification Suite

Run the full verification suite confirming deterministic math, type guards, and security gates:

```powershell
python scripts/check_all.py
```

### Verification Output:
```text
============================================================
ClaimSense Verification Suite: 9 / 9 seeded checks passed
============================================================
[PASS] Deterministic Arithmetic: Hacktoberfest 2026 Core Case (₹63,000 OOP)
       Total: ₹144,000, Insurer: ₹81,000, Family: ₹63,000
[PASS] Unconfirmed Input Gate
       Correctly rejected calculation without confirmation.
[PASS] Strict Type Guard: Rejection of Boolean in Integer Field
       Blocked boolean-as-integer coercion.
[PASS] Security Gate 1: Tool Allowlist Enforcement
       Blocked unregistered tool 'fabricated_bypass_tool'.
[PASS] Security Gate 3: Workflow Order Lock
       Blocked premature room comparison before calculation.
[PASS] Adversarial Prompt-Injection Containment
       Passive document handling prevents policy mutation.
[PASS] Image Security: Malformed Signature Rejection
       Rejected corrupt/forged image file signature.
[PASS] Range Guard: Negative Amount Rejection
       Rejected negative currency amount.
[PASS] Policy Configuration: policy.json Validation
       Verified 14 valid profiles.
============================================================
```

Run pytest backend unit tests:
```powershell
cd backend
python -m pytest tests/ -v
# 20 passed in 4.96s
```

---

## 🌐 Cloud Deployment (Vercel)

ClaimSense is configured for full-stack serverless deployment on **Vercel** with:
- **Frontend**: Prebuilt React Vite SPA (`frontend/dist`) served globally via Vercel Edge CDN.
- **Backend**: FastAPI Python ASGI serverless runtime (`api/index.py`) handling all `/api/*` endpoints.

### Deploying to Vercel:
```powershell
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Deploy to Production
vercel --prod --yes
```

### Optional Cloud Environment Variables (Vercel Project Settings):
- `GEMINI_API_KEY`: *(Optional)* Enables hybrid cloud fallback for policy analysis and dispute letter generation if offline Ollama is unavailable.
- `AI_PROVIDER`: `auto` (default), `ollama`, or `gemini`.

---

## 📁 Repository Structure

```
hacktopefestsubmit/
├── .env.example               # Environment variables template
├── .gitignore                 # Safe gitignore (excludes sensitive files, uploads, .env)
├── .vercelignore              # Deployment filter excluding virtualenvs & tests
├── vercel.json                # Vercel SPA rewrites and serverless function config
├── Makefile                   # Make target automation
├── Modelfile                  # Ollama custom model definition with SKILL.md
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Contribution guidelines
├── SECURITY.md                # Security and threat model
├── README.md                  # Complete product documentation
│
├── api/
│   └── index.py               # Vercel ASGI serverless entrypoint with rewrite middleware
│
├── config/
│   ├── policy.json            # 14 real-world and demo Indian health insurance policies
│   └── room_categories.json   # Configurable room categories and default tariffs
│
├── data/
│   ├── demo_hospital_estimate.json # Core illustrative scenario
│   ├── sample_hospital_bill.png    # Pre-generated synthetic hospital bill
│   └── test_cases.json             # Seeded unit and adversarial test scenarios
│
├── scripts/
│   ├── check_all.py           # Comprehensive 9-check verification runner
│   ├── check_ollama.py        # Ollama and Gemma connection checker
│   ├── cli_agent.py           # Interactive CLI agent with LLM + Python arithmetic
│   └── seed_demo.py           # Generates synthetic sample hospital estimates
│
├── docs/
│   ├── ARCHITECTURE.md        # Technical architecture and boundaries
│   ├── CALCULATION_RULES.md   # Exact formulas and calculation order
│   ├── SECURITY_MODEL.md      # The 3 mandatory security gates
│   └── DEMO_SCRIPT.md         # 3-minute hackathon live presentation script
│
├── backend/                   # Authoritative FastAPI application
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py            # FastAPI entry point & CORS
│   │   ├── config.py          # Settings, env validation & find_file helper
│   │   ├── schemas.py         # Pydantic models for all contracts
│   │   ├── exceptions.py      # Structured error handling
│   │   ├── api/               # API routes (health, estimates, policies, documents, etc.)
│   │   ├── agent/             # Local Ollama client, SKILL.md, guards, prompts, tools
│   │   ├── calculation/       # Authoritative calculation engine (room_rent, proportionate, copay)
│   │   ├── services/          # Policy, estimate, extraction, and verification services
│   │   └── validation/        # Type guards, image security, policy validation
│   └── tests/                 # Complete pytest test suite (20 tests)
│
└── frontend/                  # React 19 + TypeScript + Tailwind CSS UI
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx            # Routes configuration
    │   ├── context/           # EstimateContext state provider
    │   ├── services/api.ts    # Typed fetch API client
    │   ├── pages/             # Dashboard, Estimate, Upload, Review, Results, Compare, Policy, Security
    │   └── components/layout/ # TopNavigation, Sidebar, FooterDisclaimer, AppShell
```

---

## ⚖️ Disclaimer

ClaimSense is an educational and informational pre-admission estimation tool designed to provide financial transparency regarding health insurance room-rent limits, proportionate deductions, and co-payment clauses. It does not constitute legal or medical advice and does not guarantee claim approval or settlement amounts. Actual insurance claims are subject to the insurer's terms, conditions, exclusions, network hospital tariff agreements, and final medical adjudication.
