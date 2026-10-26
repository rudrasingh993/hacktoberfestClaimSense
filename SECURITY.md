# Security Policy — ClaimSense

## Threat Model & Privacy Boundary

ClaimSense processes confidential medical estimates and insurance policies. It operates under a strict **local-first privacy model**:

- **No Remote Telemetry**: Medical and financial inputs are never transmitted to external cloud servers.
- **Loopback Binding**: FastAPI and Ollama bind exclusively to localhost (`127.0.0.1`).
- **Transient Memory**: Uploaded document images are validated in-memory with Pillow and discarded immediately after inference.
- **Untrusted Document Defense**: Text within uploaded estimate documents is treated strictly as passive data. Malicious instructions (prompt-injection attacks) attempting to override role constraints, alter insurance math, or reveal system keys are neutralized by the Python orchestration boundary.

## The Three Mandatory Security Gates

1. **Gate 1: Static Tool Allowlist**:
   - The model can only request functions registered in `TOOLS`.
   - Unknown or dynamically resolved tool names are blocked instantly.

2. **Gate 2: Argument Schema & Type Guards**:
   - Strict Pydantic models validate every argument.
   - Booleans like `True`/`False` are rejected in integer fields to prevent truthy evaluation bypasses.

3. **Gate 3: Safe Execution & Workflow State Machine**:
   - Sequential order enforcement: `validate_estimate_inputs` → `calculate_claim_estimate` → `compare_room_categories`.
   - Bounded execution loop with a circuit breaker at 5 steps.

## Reporting Vulnerabilities

To report a vulnerability, open an issue or reach out to the project maintainers during Hacktoberfest 2026.
