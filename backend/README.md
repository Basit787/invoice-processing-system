## Project structure

```
backend/
├── pyproject.toml
├── Dockerfile
├── entrypoint.sh
└── src/
    ├── main.py             # create_app(), includes api_router
    ├── core/
    │   └── config.py       # Settings (env vars)
    ├── database/
    │   ├── base.py         # SQLAlchemy declarative base
    │   ├── session.py      # Engine, get_db, init_database
    │   └── models/
    │       └── invoice.py  # ORM models
    ├── schemas/
    │   └── invoice.py      # Pydantic schemas
    ├── services/
    │   └── ocr.py          # OCR + field extraction
    └── routers/
        ├── api.py          # Aggregates all routers under /api
        ├── health.py       # GET /api/health
        └── invoices.py     # /api/invoices/*
```

Add a new route: create `src/routers/my_feature.py`, then register it in `src/routers/api.py`.