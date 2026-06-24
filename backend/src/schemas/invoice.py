from datetime import datetime

from pydantic import BaseModel


class InvoiceBase(BaseModel):
    original_filename: str
    status: str


class InvoiceResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    mime_type: str
    status: str
    vendor_name: str | None = None
    invoice_number: str | None = None
    invoice_date: str | None = None
    total_amount: float | None = None
    currency: str | None = None
    raw_text: str | None = None
    error_message: str | None = None
    created_at: datetime
    processed_at: datetime | None = None

    model_config = {"from_attributes": True}


class InvoiceListResponse(BaseModel):
    invoices: list[InvoiceResponse]
    total: int


class UploadResponse(BaseModel):
    message: str
    invoice: InvoiceResponse
