"""seed_demo.py: Generates sample hospital estimate images and verifies demo datasets.
"""
from pathlib import Path
from PIL import Image, ImageDraw

BASE_DIR = Path(__file__).resolve().parent.parent

def generate_sample_bill_image(output_path: Path):
    width, height = 900, 1100
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Header banner
    draw.rectangle([(0, 0), (width, 120)], fill=(30, 58, 138)) # Navy blue
    draw.text((40, 30), "SANJEEVANI MULTISPECIALITY HOSPITAL", fill=(255, 255, 255))
    draw.text((40, 65), "Pre-Admission Cost Estimate & TPA Breakdown", fill=(219, 234, 254))
    draw.text((40, 90), "Plot 42, Senapati Bapat Road, Pune - 411016 | Phone: +91 20 2567 8900", fill=(191, 219, 254))

    # Patient details box
    draw.rectangle([(40, 150), (width - 40, 260)], outline=(203, 213, 225), width=2)
    draw.text((60, 170), "Patient Name: Rajesh Sharma", fill=(15, 23, 42))
    draw.text((60, 200), "Admission Category: Planned Inpatient Surgery", fill=(15, 23, 42))
    draw.text((60, 230), "Department: General & Laparoscopic Surgery", fill=(15, 23, 42))

    draw.text((500, 170), "Estimate No: EST-2026-9842", fill=(15, 23, 42))
    draw.text((500, 200), "Date: 26-Oct-2026", fill=(15, 23, 42))
    draw.text((500, 230), "Estimated Stay: 3 Days", fill=(15, 23, 42))

    # Room selection box
    draw.rectangle([(40, 280), (width - 40, 360)], fill=(241, 245, 249), outline=(148, 163, 184), width=1)
    draw.text((60, 300), "SELECTED ROOM CATEGORY: Single Private AC Room", fill=(30, 58, 138))
    draw.text((60, 330), "Daily Tariff Rate: Rs. 8,000 / day", fill=(71, 85, 105))

    # Items table header
    draw.rectangle([(40, 380), (width - 40, 420)], fill=(226, 232, 240))
    draw.text((60, 392), "Sl.", fill=(51, 65, 85))
    draw.text((120, 392), "Description of Hospital Service", fill=(51, 65, 85))
    draw.text((520, 392), "Units / Days", fill=(51, 65, 85))
    draw.text((680, 392), "Estimated Amount (INR)", fill=(51, 65, 85))

    # Rows
    y = 440
    items = [
        ("1", "Room Rent (Single Private Room)", "3 Days @ Rs. 8,000", "Rs. 24,000"),
        ("2", "Operation Theatre & Anaesthesia Charges", "1 Procedure", "Rs. 45,000"),
        ("3", "Surgeon & Assistant Surgeon Consultation Fees", "Laparoscopic", "Rs. 50,000"),
        ("4", "Nursing Care & Inpatient Monitoring", "3 Days", "Rs. 15,000"),
        ("5", "Pre-operative Diagnostic Tests & Imaging", "Packaged", "Rs. 10,000"),
    ]

    for sl, desc, units, amt in items:
        draw.line([(40, y - 10), (width - 40, y - 10)], fill=(241, 245, 249), width=1)
        draw.text((60, y), sl, fill=(71, 85, 105))
        draw.text((120, y), desc, fill=(15, 23, 42))
        draw.text((520, y), units, fill=(71, 85, 105))
        draw.text((680, y), amt, fill=(15, 23, 42))
        y += 50

    # Summary box
    draw.rectangle([(40, 720), (width - 40, 900)], fill=(248, 250, 252), outline=(203, 213, 225), width=2)
    draw.text((60, 740), "Room Subtotal:", fill=(71, 85, 105))
    draw.text((680, 740), "Rs. 24,000", fill=(15, 23, 42))

    draw.text((60, 775), "Other Hospital Charges (OT, Surgeon, Nursing):", fill=(71, 85, 105))
    draw.text((680, 775), "Rs. 1,20,000", fill=(15, 23, 42))

    draw.line([(60, 815), (width - 60, 815)], fill=(148, 163, 184), width=1)

    draw.text((60, 830), "TOTAL ESTIMATED HOSPITAL BILL:", fill=(30, 58, 138))
    draw.text((680, 830), "Rs. 1,44,000", fill=(30, 58, 138))

    draw.text((60, 865), "Mandatory Pre-Admission Security Deposit:", fill=(100, 116, 139))
    draw.text((680, 865), "Rs. 20,000", fill=(100, 116, 139))

    # Footer note
    draw.text((60, 930), "Note: This is a pre-admission cost estimate. Actual hospital bills may vary based on clinical complications.", fill=(148, 163, 184))
    draw.text((60, 955), "TPA Desk Signature: ________________________      Patient / Attendant Signature: ________________________", fill=(100, 116, 139))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Generated sample hospital estimate image: {output_path}")

if __name__ == "__main__":
    out = BASE_DIR / "data" / "sample_hospital_bill.png"
    generate_sample_bill_image(out)
