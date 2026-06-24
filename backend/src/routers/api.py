from fastapi import APIRouter

from routers.health import router as health_router
from routers.invoices import router as invoices_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(invoices_router, prefix="/invoices")
