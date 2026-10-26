from fastapi import APIRouter, UploadFile, File
from app.services.extraction_service import extraction_service
from app.schemas import DocumentExtractResponse

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/extract", response_model=DocumentExtractResponse)
async def extract_document(file: UploadFile = File(...)):
    file_bytes = await file.read()
    return extraction_service.extract_from_hospital_image(
        file_bytes=file_bytes,
        filename=file.filename or "uploaded_estimate.png",
        content_type=file.content_type
    )
