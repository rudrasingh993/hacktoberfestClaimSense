import os
from pathlib import Path
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def find_file(relative_path: str) -> Path:
    candidates = [
        BASE_DIR / relative_path,
        Path.cwd() / relative_path,
        Path(__file__).resolve().parent.parent / relative_path,
        Path(__file__).resolve().parent / relative_path,
    ]
    for c in candidates:
        if c.exists():
            return c
    return BASE_DIR / relative_path

class Settings(BaseModel):
    app_name: str = "ClaimSense"
    app_env: str = "development"
    app_host: str = "127.0.0.1"
    app_port: int = 8000
    frontend_origin: str = "http://localhost:5173"
    
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "gemma2:2b"
    ollama_timeout_seconds: int = 60
    
    gemini_api_key: str | None = None
    ai_provider: str = "auto"
    
    max_upload_size_mb: int = 10
    max_image_width: int = 6000
    max_image_height: int = 6000
    
    max_agent_steps: int = 5
    max_tool_calls_per_run: int = 5
    
    policy_config_path: Path = find_file("config/policy.json")
    room_config_path: Path = find_file("config/room_categories.json")
    demo_data_path: Path = find_file("data/demo_hospital_estimate.json")
    enable_local_history: bool = False

def get_settings() -> Settings:
    return Settings(
        app_name=os.getenv("APP_NAME", "ClaimSense"),
        app_env=os.getenv("APP_ENV", "development"),
        app_host=os.getenv("APP_HOST", "127.0.0.1"),
        app_port=int(os.getenv("APP_PORT", "8000")),
        frontend_origin=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        ollama_model=os.getenv("OLLAMA_MODEL", "gemma2:2b"),
        ollama_timeout_seconds=int(os.getenv("OLLAMA_TIMEOUT_SECONDS", "60")),
        gemini_api_key=os.getenv("GEMINI_API_KEY", None),
        ai_provider=os.getenv("AI_PROVIDER", "auto"),
        max_upload_size_mb=int(os.getenv("MAX_UPLOAD_SIZE_MB", "10")),
        max_image_width=int(os.getenv("MAX_IMAGE_WIDTH", "6000")),
        max_image_height=int(os.getenv("MAX_IMAGE_HEIGHT", "6000")),
        max_agent_steps=int(os.getenv("MAX_AGENT_STEPS", "5")),
        policy_config_path=Path(os.getenv("POLICY_CONFIG_PATH", str(find_file("config/policy.json")))),
        room_config_path=Path(os.getenv("ROOM_CONFIG_PATH", str(find_file("config/room_categories.json")))),
        demo_data_path=Path(os.getenv("DEMO_DATA_PATH", str(find_file("data/demo_hospital_estimate.json")))),
        enable_local_history=os.getenv("ENABLE_LOCAL_HISTORY", "false").lower() == "true",
    )

settings = get_settings()
