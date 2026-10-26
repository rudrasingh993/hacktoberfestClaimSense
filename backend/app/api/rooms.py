import json
from fastapi import APIRouter
from app.config import settings
from app.exceptions import ValidationError

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("")
def get_room_categories():
    path = settings.room_config_path
    if not path.exists():
        raise ValidationError(f"Room categories configuration not found at {path}")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise ValidationError(f"Error reading room categories: {e}")
