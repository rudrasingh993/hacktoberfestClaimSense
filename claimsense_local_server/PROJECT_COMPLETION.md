# ClaimSense Project Completion Summary

Date: 2026-10-26

## 1. Project overview
ClaimSense is a hospital cost-estimation assistant built to estimate how much a family would have to pay for a medical claim based on policy rules, room rent, co-pay, sub-limits, and proportional deductions.

The project currently includes:
- a Python-based policy calculation engine
- a rule-guarded LLM integration path
- a pure-Python fallback path for deterministic calculations
- a web UI for estimation and room-category comparison
- validation checks for prompt injection, bad inputs, and pricing logic

## 2. Completed work

### Core calculation engine
The calculation logic is implemented in `tools.py` and covers the full claim-flow:

1. Room-rent ratio calculation
   - calculates the ratio of the admissible room limit to the actual room rent
   - caps the ratio at 1.0
   - computes the payable room amount for the stay

2. Proportionate deduction
   - scales other eligible charges by the room deduction ratio
   - keeps the total payable amount consistent with policy logic

3. Co-pay and sub-limit handling
   - applies co-pay percentage to the payable amount
   - optionally enforces a sub-limit cap on covered amount

4. Out-of-pocket estimate
   - computes family share as total bill minus insurer payment

The engine validates all numeric inputs and rejects invalid values, booleans, non-finite numbers, and impossible amounts.

### Policy model
`policy.json` defines policy profiles and room categories. It supports:
- fixed room limit per day
- percentage-based room limit derived from sum insured
- co-pay settings
- proportionate deduction flag
- sub-limit entries
- waiting periods and non-payable items

This makes the project flexible enough to support multiple insurers and profile variations without changing the calculator core.

### Safety and rule enforcement
The project includes a guarded host flow in `app.py`:
- input extraction from user text
- validation against the original text to prevent invented values
- rejection of prompt-injection attempts
- missing-field prompts when user input is incomplete
- strict gate checks on tool calls and arguments

The guard logic is intended to ensure that the model can only use approved tools in the correct sequence and with numbers that existed in the user message or the confirmed calculation inputs.

### LLM integration
The app supports a live Ollama-based inference path:
- extracts key values from the hospital estimate text
- calls allowed tools in a fixed order
- checks tool arguments against policy constraints and numeric safety rules
- cross-checks the model’s final result against the deterministic Python result

This makes the system useful both as a tested Python backend and as a model-assisted assistant path.

### Web UI
The web UI in `web/index.html` and `ui/ui-patch.css` provides a broker-style estimator with:
- room rent and stay-day inputs
- room category comparison cards
- insurer/policy summary
- share-of-claim estimate
- output breakdown and recommendation logic

The backend in `server.py` exposes this via a local HTTP service and returns JSON results for estimation requests.

### Validation and verification
The repo already contains checks for:
- prompt injection detection
- empty request handling
- missing input prompts
- invalid tool invocation attempts
- invented-values detection
- wrong calculations and edge-case validation

Files such as `check_all.py` and `demo_tools.py` confirm the current logic behaves as expected for the worked example and common edge cases.

## 3. File and module map

- `app.py` — host logic, extraction, validation, LLM-assisted calculation loop
- `tools.py` — all deterministic formula logic and report generation
- `gates.py` — guard checks for tool order, arguments, and policy-safety enforcement
- `server.py` — local web server and API endpoint for the UI
- `policy.json` — insurer policy data and room-category definitions
- `web/index.html` — front-end estimator UI
- `ui/ui-patch.css` — styling patch for the UI
- `check_all.py` — seed-case validation runner
- `demo_tools.py` — standalone tool tests
- `requirements.txt` — Python dependencies
- `start_ui.ps1` / `apply_ui.ps1` — script-based launcher helpers

## 4. Project status
The project is currently in a working functional state for the core use case:
- hospital estimate input is accepted
- rule-based claim math is computed accurately
- web UI is available locally
- model safety and validation gates are in place
- deterministic logic is tested against worked examples and error cases

## 5. How to run

### CLI
```bash
python app.py
```
Optional no-model mode:
```bash
python app.py --no-llm
```

### Web UI
```bash
python server.py
```
Then open the local URL shown in the terminal, typically:
- http://localhost:8000

### Validation checks
```bash
python demo_tools.py
```

```bash
python check_all.py
```

## 6. Current assumptions and limitations
- Policy data in `policy.json` is sample-based and should be replaced with the actual insurer policy wording before production use.
- The LLM route depends on Ollama and a model such as `gemma4:e4b` being locally available.
- The current project focuses on claim estimation, not document management, policy parsing, or production-grade insurance workflows.
- The app is designed as a local demo/engineering prototype, not a full commercial claims platform.

## 7. Next possible improvements
- replace sample profile data with real insurer policy inputs
- add multi-policy comparison for multiple insurers
- add PDF or policy-document parsing support
- improve the web UI with more user-friendly policy explanations
- add persistent storage and audit logs for claim scenarios
- expand validation for edge-case medical billing rules

## 8. Conclusion
The project has already moved beyond a basic proof-of-concept and now includes a complete claim-estimation workflow with a rule-validated backend, a local web UI, safety checks, and a reproducible verification setup. The core functionality is present and working for the modeled hospital-claim use case.
