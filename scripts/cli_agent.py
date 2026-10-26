"""
ClaimSense CLI Agent — Interactive Terminal Copilot
Trained and instructed using SKILL.md, guards, and Python calculation tools.

Usage:
  Interactive Chat Mode:
    python scripts/cli_agent.py

  Single Query Mode:
    python scripts/cli_agent.py "What is proportionate deduction?"
"""

import sys
import os
import json
from pathlib import Path

# Add backend to path so we can import app modules directly
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

try:
    from app.agent.ollama_client import ollama_client
    from app.config import settings
    from app.agent.tools import calculate_claim_estimate
    from app.services.policy_service import policy_service
    from app.schemas import EstimateInput
except ImportError as e:
    print(f"Error importing ClaimSense backend modules: {e}")
    sys.exit(1)


SKILL_PATH = BACKEND_DIR / "app" / "agent" / "SKILL.md"


def load_skill_content() -> str:
    if SKILL_PATH.exists():
        return SKILL_PATH.read_text(encoding="utf-8")
    return "You are ClaimSense AI. You explain hospital bills and health insurance clauses deterministically."


def print_banner():
    print("=" * 65)
    print("  ClaimSense AI Terminal Copilot (Grounded on SKILL.md & Python Engine)")
    print("=" * 65)
    print("  Model:    " + settings.ollama_model)
    print("  Ollama:   " + settings.ollama_base_url)
    print("  Commands: /policies, /estimate, /skill, /help, /exit")
    print("=" * 65 + "\n")


def handle_policies_command():
    profiles = policy_service.get_all_profiles()
    print(f"\n--- Available Health Insurance Policies ({len(profiles)}) ---")
    for idx, p in enumerate(profiles, 1):
        limit = (
            "No Sub-limit"
            if p.room_limit_type == "none"
            else f"Fixed ₹{p.room_limit_value // 100:,}/day"
            if p.room_limit_type == "fixed_daily"
            else f"{p.room_limit_value}% of Sum Insured"
        )
        prop = "Applicable" if p.proportionate_deduction_applicable else "Waived"
        print(f"{idx:2d}. [{p.policy_id}] {p.policy_name} ({p.insurer_name})")
        print(f"    Room Limit: {limit} | Prop. Deductions: {prop} | Co-pay: {p.copay_percentage or 0}%\n")


def handle_estimate_command(args: list[str]):
    """
    Calculates deterministic estimate from CLI.
    Format: /estimate [room_rate_rupees] [days] [other_charges_rupees] [policy_id]
    Example: /estimate 8000 3 120000 demo-fixed-room-limit
    """
    try:
        room_rate = int(args[0]) if len(args) > 0 else 8000
        days = int(args[1]) if len(args) > 1 else 3
        other_charges = int(args[2]) if len(args) > 2 else 120000
        policy_id = args[3] if len(args) > 3 else "demo-fixed-room-limit"

        policy = policy_service.get_profile(policy_id)

        input_data = EstimateInput(
            policy_id=policy.policy_id,
            hospital_name="CLI Terminal Hospital",
            room_category="Single Private Room",
            room_rate_per_day_paise=room_rate * 100,
            room_days=days,
            other_charges_paise=other_charges * 100,
            excluded_charges_paise=0,
            inputs_confirmed=True
        )

        res = calculate_claim_estimate(input_data, policy)

        print(f"\n=== DETERMINISTIC PYTHON ENGINE CALCULATION RESULT ===")
        print(f"Policy:           {policy.policy_name} ({policy.insurer_name})")
        print(f"Total Bill:       ₹{res.total_bill_paise / 100:,.2f}")
        print(f"Insurer Payout:   ₹{(res.insurer_payment_paise or 0) / 100:,.2f}")
        print(f"Family Out-Pocket:₹{(res.family_payment_paise or 0) / 100:,.2f}")
        print(f"Room Ratio:       {res.room_limit_ratio or 1.0:.3f}")
        print(f"Prop. Penalty:    -₹{(res.other_charges_paise - res.adjusted_other_charges_paise) / 100:,.2f}")
        print(f"Co-pay Paid:      -₹{res.copay_deduction_paise / 100:,.2f}")
        print("=" * 55 + "\n")

    except Exception as e:
        print(f"\n[Error executing calculation]: {e}")
        print("Usage: /estimate [room_rate] [days] [other_charges] [policy_id]\n")


def stream_llm_reply(prompt: str, skill_system_prompt: str):
    """Streams reply token-by-token from local Ollama grounded on SKILL.md."""
    status = ollama_client.check_status()
    if status["ollama_available"] and status["model_available"]:
        try:
            client = ollama_client.get_client()
            stream = client.chat(
                model=ollama_client.model_name,
                messages=[
                    {"role": "system", "content": skill_system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                options={"temperature": 0.3}
            )
            for chunk in stream:
                token = chunk.get("message", {}).get("content", "")
                sys.stdout.write(token)
                sys.stdout.flush()
            sys.stdout.write("\n")
            return
        except Exception as e:
            print(f"(Local stream notice: {e}. Using deterministic ClaimSense knowledge base:)\n")

    # Fallback to intelligent local knowledge engine
    resp = ollama_client.chat_with_copilot(prompt)
    print(resp.reply)


def main():
    skill_content = load_skill_content()

    # Single-query mode if arguments passed
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:]).strip()
        if query.lower() == "/policies":
            handle_policies_command()
            return
        elif query.lower().startswith("/estimate"):
            handle_estimate_command(sys.argv[2:])
            return
        elif query.lower() == "/skill":
            print(f"\n--- SKILL.md System Instructions ---\n{skill_content}\n")
            return

        print(f"\nClaimSense AI: ", end="", flush=True)
        stream_llm_reply(query, skill_content)
        print()
        return

    # Interactive REPL mode
    print_banner()
    while True:
        try:
            user_input = input("ClaimSense (You) > ").strip()
            if not user_input:
                continue

            cmd_lower = user_input.lower()

            if cmd_lower in ["/exit", "exit", "quit", ":q"]:
                print("\nGoodbye! Stay healthy and informed before hospital admission.")
                break

            elif cmd_lower in ["/help", "help", "?"]:
                print("\nAvailable CLI Commands:")
                print("  /policies               List all 14 configured health insurance policies")
                print("  /estimate <rate> <days> <other> <policy_id> Run exact Python financial calculation")
                print("  /skill                  View the complete SKILL.md system instructions")
                print("  /clear                  Clear terminal screen")
                print("  /exit                   Quit interactive mode\n")

            elif cmd_lower == "/skill":
                print(f"\n--- SKILL.md System Prompt ---\n{skill_content}\n------------------------------\n")

            elif cmd_lower == "/policies":
                handle_policies_command()

            elif cmd_lower.startswith("/estimate"):
                parts = user_input.split()[1:]
                handle_estimate_command(parts)

            elif cmd_lower == "/clear":
                os.system("cls" if os.name == "nt" else "clear")
                print_banner()

            else:
                print("\nClaimSense AI: ", end="", flush=True)
                stream_llm_reply(user_input, skill_content)
                print("\n" + "-" * 65)

        except (KeyboardInterrupt, EOFError):
            print("\nExiting ClaimSense CLI. Stay informed!")
            break


if __name__ == "__main__":
    main()
