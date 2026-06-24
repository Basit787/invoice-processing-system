from fastapi import APIRouter, Response

from database import check_database_connection

router = APIRouter(tags=["health"])


@router.get("/health")
def health(response: Response):
    db_status = check_database_connection()
    if db_status != "connected":
        response.status_code = 503

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "service": "invoice-processing-api",
        "database": db_status,
    }
