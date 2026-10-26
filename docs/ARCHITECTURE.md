# ClaimSense System Architecture

ClaimSense is designed as a **hybrid local-AI application** combining:
1. **Local Multimodal Language Model (Gemma 4 via Ollama)** for natural-language document understanding, candidate extraction, and plain-language multilingual explanations.
2. **Authoritative Deterministic Python Calculation Engine** for exact currency math, room-rent eligibility ratios, proportionate deductions, and co-payment adjustments.

## System Topology

```
+---------------------------------------------------------------------------+
|                              USER BROWSER                                 |
|   React 19 + TypeScript + Vite + Tailwind CSS (Responsive Desktop/Mobile) |
|   Routes: / (Dashboard), /estimate, /estimate/upload, /results, /compare  |
+---------------------------------------------------------------------------+
                                   |
                         HTTP (JSON / Loopback)
                                   v
+---------------------------------------------------------------------------+
|                          FASTAPI AUTHORITATIVE SERVER                     |
|                   FastAPI • Pydantic • Loopback: 127.0.0.1:8000           |
|                                                                           |
|   +-------------------+    +-------------------+    +-----------------+   |
|   |   Gate 1: Allow   | -> |  Gate 2: Validate | -> |  Gate 3: State  |   |
|   |  Static Registry  |    |  Strict Schemas   |    |  Workflow Lock  |   |
|   +-------------------+    +-------------------+    +-----------------+   |
|                                   |                                       |
|             +---------------------+---------------------+                 |
|             v                                           v                 |
|   +-----------------------+                   +-----------------------+   |
|   | DETERMINISTIC ENGINE  |                   |     OLLAMA CLIENT     |   |
|   | room_rent.py          |                   | gemma4:e4b (6.6 GB)   |   |
|   | proportionate.py      |                   | Multimodal Vision     |   |
|   | copay.py              |                   | JSON Candidate Parser |   |
|   | sublimits.py          |                   | Plain Language Expl.  |   |
|   | Decimal rounding      |                   +-----------------------+   |
|   +-----------------------+                                               |
+---------------------------------------------------------------------------+
```

## Key Boundaries
- **No Cloud AI Dependency**: The application functions 100% offline. If Ollama is offline or downloading, deterministic manual input and verification suites continue without interruption.
- **Authoritative Separation**: Language models never execute math. Calculation steps and financial figures originate exclusively from validated Python code.
