# ClaimSense — The Offline AI Health Insurance Claim Estimator

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026-blue.svg)](https://hacktoberfest.com/)
[![Local AI](https://img.shields.io/badge/AI-Ollama%20%7C%20Gemma%204-purple.svg)](https://ollama.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B%20%7C%20FastAPI-green.svg)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/React%2019-TypeScript%20%7C%20Tailwind-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Event:** Hacktoberfest 2026 Hack Day  
> **Organizers:** Pune × NIAT-ADYPU  
> **Date:** October 26, 2026  
> **Project Category:** Local AI, Open Source, Healthcare Technology, Financial Transparency  

---

## 💡 Overview

**ClaimSense** is a local-first healthcare-fintech application that protects Indian families from surprise out-of-pocket hospital bills caused by hidden insurance clauses: **room-rent limits, proportionate deductions, and co-payment penalties**.

In India, choosing a hospital room just ₹3,000 above your policy's daily limit can penalize your entire medical bill by **37.5%**, resulting in tens of thousands of rupees in out-of-pocket costs. ClaimSense helps families answer five critical questions before admission:

1. **How much of the hospital bill will the insurer likely pay?**
2. **How much will our family have to pay out of pocket?**
3. **How does choosing a more expensive room affect surgeon and OT fees?**
4. **Which available room tier reduces or eliminates our financial exposure?**
5. **Which policy sub-limits, deductibles, or co-payments apply?**

---

## 🛡️ Core Architectural Principles

- **Language Models are for Language**: Locally running open-weight **Gemma 4 (via Ollama)** handles document extraction, unstructured policy interpretation, and multilingual plain-language explanations (English, Hindi, Marathi).
- **Python is for Financial Arithmetic**: The AI model **never calculates financial results**. All currency arithmetic, eligibility ratios, proportionate penalties, and co-payments are derived deterministically in Python using integer paise and `Decimal` with `ROUND_HALF_UP`.
- **Zero Cloud Data Leakage**: 100% offline. No data is ever transmitted to OpenAI, Google Cloud Gemini, or external cloud providers.
- **Three Mandatory Security Gates**:
  1. *Gate 1: Static Tool Allowlist* — Restricts model tool calls to registered functions; blocks arbitrary reflection or execution.
  2. *Gate 2: Argument Schema & Type Guards* — Pydantic validation rejects booleans as integers (`True` as paise) and enforces strict ranges.
  3. *Gate 3: Safe Execution & Workflow State Machine* — Sequential order enforcement (`validate → calculate → compare`) with a 5-step loop circuit breaker.

---

## 🎯 The Primary Illustrative Scenario

A family is planning a hospital admission:
- **Policy Room-Rent Limit:** ₹5,000 / day
- **Co-Payment:** 10%
- **Selected Room:** ₹8,000 / day (Single Private AC Room)
- **Duration:** 3 days (Room total: ₹24,000)
- **Other Hospital Charges:** ₹1,20,000 (Surgeon fees, OT, anaesthesia, nursing)
- **Total Hospital Bill:** ₹1,44,000

### Deterministic Calculation Trace:
1. **Room Eligibility Ratio:** `₹5,000 / ₹8,000 = 0.625` (37.5% penalty)
2. **Eligible Room Charges:** `₹5,000 × 3 = ₹15,000`
3. **Proportionate Adjustment on Other Charges:** `₹1,20,000 × 0.625 = ₹75,000` (₹45,000 lost)
4. **Total Base Eligible Amount:** `₹15,000 + ₹75,000 = ₹90,000`
5. **10% Co-Payment Deduction:** `₹90,000 × 10% = ₹9,000`
6. **Estimated Insurer Payment:** `₹90,000 - ₹9,000 = ₹81,000`
7. **Estimated Family Out-of-Pocket:** `₹1,44,000 - ₹81,000 = ₹63,000`

> **Room Comparison Insight:** Choosing a Twin Sharing room (₹4,500/day) sits within the ₹5,000 limit, eliminates the proportionate deduction, and saves the family **₹49,650** out of pocket!

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Python 3.11+** installed
- **Node.js 18+ & npm** installed
- **Ollama** installed ([https://ollama.com](https://ollama.com))

### 2. Ollama Setup (Local Model)
Start Ollama and pull the Gemma 4 multimodal model:
```bash
# Start Ollama service (if not already running as daemon)
ollama serve

# Pull Gemma 4 model
ollama pull gemma4:e4b
```
*(Note: ClaimSense includes graceful fallbacks. If Ollama is downloading or offline, deterministic calculations, manual entry, and verification suites remain 100% operational).*

### 3. Backend Setup (FastAPI)
```powershell
# In project root
python -m venv venv
.\venv\Scripts\pip install -r backend/requirements.txt

# Run backend server
.\venv\Scripts\uvicorn app.main:app --app-dir backend --reload --port 8000
```
Backend API will be running at `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/api/docs`).

### 4. Frontend Setup (React + Vite)
```powershell
# Open a new terminal in project root
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## 🧪 Automated Verification Suite

Run the full automated check suite verifying deterministic math, type guards, and security gates:

```powershell
.\venv\Scripts\python scripts/check_all.py
```

### Actual Output:
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
       Verified 4 valid profiles.
============================================================
```

Run pytest unit tests:
```powershell
$env:PYTHONPATH="backend"
.\venv\Scripts\python -m pytest backend/tests -v
# 19 passed in 5.03s
```

---

## 📁 Repository Structure

```
claimsense/
├── .env.example               # Environment variables template
├── .gitignore                 # Safe gitignore (excludes sensitive files, uploads, .env)
├── Makefile                   # Make target automation
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Contribution guidelines
├── SECURITY.md                # Security and threat model
├── README.md                  # Complete product documentation
│
├── config/
│   ├── policy.json            # Editable policy profiles with strict schema
│   └── room_categories.json   # Configurable room categories and default tariffs
│
├── data/
│   ├── demo_hospital_estimate.json # Hacktoberfest core illustrative scenario
│   ├── sample_hospital_bill.png    # Realistic pre-generated synthetic hospital estimate
│   └── test_cases.json             # Seeded unit and adversarial test scenarios
│
├── scripts/
│   ├── check_all.py           # Verification runner (reports real passed/failed checks)
│   ├── check_ollama.py        # Ollama and Gemma 4 model connection checker
│   └── seed_demo.py           # Generates synthetic sample hospital cost estimates
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
│   │   ├── config.py          # Settings & environment validation
│   │   ├── schemas.py         # Pydantic models for all contracts
│   │   ├── exceptions.py      # Structured error handling
│   │   ├── api/               # API routes (health, estimates, policies, documents, etc.)
│   │   ├── agent/             # Local Ollama client, SKILL.md, guards, prompts, tools
│   │   ├── calculation/       # Authoritative calculation engine (room_rent, proportionate, copay)
│   │   ├── services/          # Policy, estimate, extraction, and verification services
│   │   └── validation/        # Type guards, image security, policy validation
│   └── tests/                 # Complete pytest test suite (19 tests)
│
└── frontend/                  # React 19 + TypeScript + Tailwind CSS UI
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx            # Routes configuration
    │   ├── context/           # EstimateContext state provider
    │   ├── services/api.ts    # Typed fetch API client
    │   ├── pages/             # Dashboard, Estimate, Upload, Review, Results, Compare, Security
    │   └── components/layout/ # TopNavigation, Sidebar, FooterDisclaimer, AppShell
```

---

## ⚖️ Disclaimer

ClaimSense is an educational and informational pre-admission estimation tool designed to provide financial transparency regarding health insurance room-rent limits, proportionate deductions, and co-payment clauses. It does not constitute legal or medical advice and does not guarantee claim approval or settlement amounts. Actual insurance claims are subject to the insurer's terms, conditions, exclusions, network hospital tariff agreements, and final medical adjudication.
