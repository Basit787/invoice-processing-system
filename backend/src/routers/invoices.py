import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from core.config import settings
from database import Invoice, get_db
from schemas import InvoiceListResponse, InvoiceResponse, UploadResponse
from services.ocr import is_allowed_file, process_invoice_file

router = APIRouter(tags=["invoices"])

UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=UploadResponse)
async def upload_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename or not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Allowed: PNG, JPG, JPEG, TIFF, BMP, PDF",
        )

    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.max_upload_size_mb}MB",
        )

    ext = Path(file.filename).suffix.lower()
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / stored_name

    file_path.write_bytes(content)

    invoice = Invoice(
        filename=stored_name,
        original_filename=file.filename,
        file_path=str(file_path),
        mime_type=file.content_type or "application/octet-stream",
        status="processing",
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    try:
        fields = process_invoice_file(str(file_path), invoice.mime_type)
        invoice.status = "processed"
        invoice.vendor_name = fields.get("vendor_name")
        invoice.invoice_number = fields.get("invoice_number")
        invoice.invoice_date = fields.get("invoice_date")
        invoice.total_amount = fields.get("total_amount")
        invoice.currency = fields.get("currency")
        invoice.raw_text = fields.get("raw_text")
        invoice.processed_at = fields.get("processed_at")
    except Exception as exc:
        invoice.status = "failed"
        invoice.error_message = str(exc)

    db.commit()
    db.refresh(invoice)

    return UploadResponse(
        message="Invoice uploaded and processed",
        invoice=InvoiceResponse.model_validate(invoice),
    )


@router.get("", response_model=InvoiceListResponse)
def list_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).all()
    return InvoiceListResponse(
        invoices=[InvoiceResponse.model_validate(i) for i in invoices],
        total=len(invoices),
    )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return InvoiceResponse.model_validate(invoice)


@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    file_path = Path(invoice.file_path)
    if file_path.exists():
        file_path.unlink()

    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted"}
