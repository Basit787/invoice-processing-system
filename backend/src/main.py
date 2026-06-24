from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_database
from routers import api_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_database()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Invoice Processing System",
        description="Upload invoices, run OCR, and extract structured data",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    return app


app = create_app()
