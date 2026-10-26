from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.exceptions import ClaimSenseException
from app.validation.policy_schema import load_and_validate_policy_config

from app.api.health import router as health_router
from app.api.policies import router as policies_router
from app.api.documents import router as documents_router
from app.api.estimates import router as estimates_router
from app.api.assistant import router as assistant_router
from app.api.rooms import router as rooms_router
from app.api.security import router as security_router

app = FastAPI(
    title="ClaimSense - The Offline AI Health Insurance Claim Estimator",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configured for loopback development & Vercel production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(ClaimSenseException)
async def handle_claimsense_exception(request: Request, exc: ClaimSenseException):
    status_code = 400
    if exc.code == "SECURITY_GATE_VIOLATION":
        status_code = 403
    elif exc.code == "POLICY_NOT_FOUND":
        status_code = 404
    elif exc.code == "UNCONFIRMED_INPUTS":
        status_code = 422
        
    return JSONResponse(
        status_code=status_code,
        content={
            "error_code": exc.code,
            "message": exc.message,
            "details": exc.details
        }
    )

# Include all API routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(policies_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(estimates_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(rooms_router, prefix="/api")
app.include_router(security_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    try:
        load_and_validate_policy_config(settings.policy_config_path)
    except Exception as e:
        print(f"[ClaimSense Startup Warning] Policy config validation failed: {e}")
