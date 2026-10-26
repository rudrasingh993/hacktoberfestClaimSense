import io
from PIL import Image
from app.exceptions import ValidationError
from app.config import settings

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def validate_image_file(file_bytes: bytes, filename: str | None = None, content_type: str | None = None) -> Image.Image:
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise ValidationError(
            f"Image file exceeds maximum permitted size of {settings.max_upload_size_mb} MB.",
            details={"file_size_bytes": len(file_bytes), "max_allowed_bytes": max_bytes}
        )
    if len(file_bytes) < 16:
        raise ValidationError("Image file is too small or empty.")
        
    # Check Magic Bytes
    is_jpeg = file_bytes.startswith(b"\xff\xd8\xff")
    is_png = file_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = file_bytes[:4] == b"RIFF" and file_bytes[8:12] == b"WEBP"
    
    if not (is_jpeg or is_png or is_webp):
        raise ValidationError(
            "Unsupported or invalid image file signature. Only authentic JPEG, PNG, and WebP images are permitted."
        )

    # Decode and verify with Pillow
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()  # Verifies file integrity
    except Exception as e:
        raise ValidationError(f"Image integrity check failed: file is corrupted or malformed ({e}).")
        
    # Re-open for dimension inspection (verify closes the file)
    try:
        image = Image.open(io.BytesIO(file_bytes))
        width, height = image.size
    except Exception as e:
        raise ValidationError(f"Unable to read image dimensions: {e}")
        
    if width > settings.max_image_width or height > settings.max_image_height:
        raise ValidationError(
            f"Image dimensions ({width}x{height}) exceed maximum allowed limit of "
            f"{settings.max_image_width}x{settings.max_image_height}."
        )
        
    return image

def optimize_image_for_vision(file_bytes: bytes, max_dimension: int = 1280) -> bytes:
    """Downscales large images to prevent local LLM vision encoder timeouts while preserving text clarity."""
    try:
        img = Image.open(io.BytesIO(file_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        width, height = img.size
        if width > max_dimension or height > max_dimension:
            scale = max_dimension / max(width, height)
            new_size = (int(width * scale), int(height * scale))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            
        out_buf = io.BytesIO()
        img.save(out_buf, format="JPEG", quality=88, optimize=True)
        return out_buf.getvalue()
    except Exception:
        # Fallback to original bytes if optimization fails
        return file_bytes
