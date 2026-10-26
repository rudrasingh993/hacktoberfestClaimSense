from fastapi import APIRouter
from app.config import settings
from app.agent.ollama_client import ollama_client
from app.validation.policy_schema import load_and_validate_policy_config

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def get_health():
    config_valid = False
    try:
        load_and_validate_policy_config(settings.policy_config_path)
        config_valid = True
    except Exception:
        config_valid = False

    ai_status = ollama_client.check_status()

    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "app_env": settings.app_env,
        "backend_version": "1.0.0",
        "config_valid": config_valid,
        "ollama_available": ai_status["ollama_available"],
        "configured_model": settings.ollama_model,
        "model_available": ai_status["model_available"]
    }

@router.get("/ai/status")
def get_ai_status():
    return ollama_client.check_status()

@router.get("/config/status")
def get_config_status():
    policy_ok = False
    policy_err = None
    try:
        load_and_validate_policy_config(settings.policy_config_path)
        policy_ok = True
    except Exception as e:
        policy_err = str(e)

    rooms_ok = settings.room_config_path.exists()
    demo_ok = settings.demo_data_path.exists()

    return {
        "all_valid": policy_ok and rooms_ok and demo_ok,
        "policy_config": {"valid": policy_ok, "path": str(settings.policy_config_path), "error": policy_err},
        "room_config": {"exists": rooms_ok, "path": str(settings.room_config_path)},
        "demo_data": {"exists": demo_ok, "path": str(settings.demo_data_path)}
    }

@router.get("/disclaimer")
def get_disclaimer():
    return {
        "disclaimer": (
            "ClaimSense is an informational pre-admission estimation tool designed to provide financial transparency "
            "regarding health insurance room-rent limits, proportionate deductions, and co-payment clauses. "
            "It does NOT constitute legal, medical, or guaranteed insurance adjudication advice. "
            "Actual insurance claims are subject to the insurer's terms, conditions, exclusions, network hospital tariff agreements, "
            "and final medical evaluation."
        )
    }
