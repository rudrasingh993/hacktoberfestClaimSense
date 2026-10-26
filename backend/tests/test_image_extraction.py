import io
from PIL import Image
import pytest
from app.validation.image_validation import validate_image_file
from app.exceptions import ValidationError

def create_test_image(format="PNG", size=(200, 200), color=(255, 0, 0)) -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def test_validate_valid_png():
    img_bytes = create_test_image("PNG")
    img = validate_image_file(img_bytes, filename="test.png")
    assert img.size == (200, 200)

def test_validate_valid_jpeg():
    img_bytes = create_test_image("JPEG")
    img = validate_image_file(img_bytes, filename="test.jpg")
    assert img.size == (200, 200)

def test_reject_fake_extension_corrupt_data():
    fake_bytes = b"This is not a real image header."
    with pytest.raises(ValidationError, match="signature"):
        validate_image_file(fake_bytes, filename="fake.png")
