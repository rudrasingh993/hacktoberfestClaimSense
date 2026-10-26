from fastapi import APIRouter
from app.services.verification_service import verification_service
from app.schemas import SecurityDemoRequest, SecurityDemoResponse

router = APIRouter(tags=["Security & Verification"])

@router.post("/security/demo", response_model=SecurityDemoResponse)
def run_security_demo(request: SecurityDemoRequest):
    return verification_service.execute_security_demo(request.demo_id)

@router.post("/tests/run")
def run_tests():
    return verification_service.run_automated_tests()
