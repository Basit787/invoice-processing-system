import re
from datetime import UTC, datetime
from pathlib import Path

import pytesseract
from dateutil import parser as date_parser
from pdf2image import convert_from_path
from PIL import Image

from core.config import settings

pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".pdf"}


def is_allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def extract_text_from_image(image_path: str) -> str:
    with Image.open(image_path) as img:
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        return pytesseract.image_to_string(img)


def extract_text_from_pdf(pdf_path: str) -> str:
    pages = convert_from_path(pdf_path, dpi=300)
    texts = [pytesseract.image_to_string(page) for page in pages]
    return "\n\n".join(texts)


def extract_text(file_path: str, mime_type: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf" or mime_type == "application/pdf":
        return extract_text_from_pdf(file_path)
    return extract_text_from_image(file_path)


def _find_invoice_number(text: str) -> str | None:
    patterns = [
        r"(?:invoice\s*(?:#|no\.?|number)?[:\s]*)([A-Z0-9][\w\-/]{2,20})",
        r"(?:inv\s*#?\s*)([A-Z0-9][\w\-/]{2,20})",
        r"(?:bill\s*(?:#|no\.?)?[:\s]*)([A-Z0-9][\w\-/]{2,20})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def _find_total_amount(text: str) -> tuple[float | None, str | None]:
    currency_patterns = [
        (r"(?:total|amount\s+due|grand\s+total|balance\s+due)[:\s]*\$?\s*([\d,]+\.?\d*)", "USD"),
        (r"(?:total|amount\s+due|grand\s+total)[:\s]*€\s*([\d,]+\.?\d*)", "EUR"),
        (r"(?:total|amount\s+due|grand\s+total)[:\s]*£\s*([\d,]+\.?\d*)", "GBP"),
        (r"(?:total|amount\s+due|grand\s+total)[:\s]*([\d,]+\.\d{2})", None),
    ]
    for pattern, currency in currency_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(",", "")
            try:
                return float(amount_str), currency
            except ValueError:
                continue
    return None, None


def _find_date(text: str) -> str | None:
    date_patterns = [
        r"(?:invoice\s*date|date\s*of\s*invoice|dated?)[:\s]*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})",
        r"(?:invoice\s*date|date)[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
        r"(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{4})",
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                parsed = date_parser.parse(match.group(1), fuzzy=False)
                return parsed.strftime("%Y-%m-%d")
            except (ValueError, OverflowError):
                continue
    return None


def _find_vendor_name(text: str) -> str | None:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return None

    for line in lines[:5]:
        if len(line) > 3 and not re.match(r"^(invoice|bill|receipt|tax)", line, re.IGNORECASE):
            if not re.match(r"^\d", line):
                return line[:255]
    return lines[0][:255] if lines else None


def parse_invoice_fields(text: str) -> dict:
    total, currency = _find_total_amount(text)
    return {
        "vendor_name": _find_vendor_name(text),
        "invoice_number": _find_invoice_number(text),
        "invoice_date": _find_date(text),
        "total_amount": total,
        "currency": currency,
        "raw_text": text,
    }


def process_invoice_file(file_path: str, mime_type: str) -> dict:
    text = extract_text(file_path, mime_type)
    fields = parse_invoice_fields(text)
    fields["processed_at"] = datetime.now(UTC)
    return fields
