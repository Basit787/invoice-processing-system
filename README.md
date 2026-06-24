# Invoice Processing System

A fully Docker-based invoice processing system. Upload images or PDFs, run OCR with Tesseract, and extract structured invoice fields. **No local Python, Node, Tesseract, or PostgreSQL installation required** — everything runs in containers.

## Features

- Drag-and-drop web UI for invoice upload
- OCR via Tesseract (inside the API container)
- PDF support via poppler (`pdftoppm`)
- Extracts vendor name, invoice number, date, and total amount
- PostgreSQL persistence with Docker volumes
- Health checks and service dependency ordering

---

## Run on Ubuntu (recommended)

### 1. Install Docker on Ubuntu

```bash
# Update packages
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow your user to run docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
```

### 2. Copy project to Ubuntu

Copy the `invoice-processing-system` folder to your Ubuntu machine (USB, `scp`, git clone, etc.):

```bash
scp -r invoice-processing-system user@your-ubuntu-host:~/
```

### 3. Configure (optional)

```bash
cd ~/invoice-processing-system
cp .env.example .env
```

Edit `.env` if you want to change the port or database password:

```env
POSTGRES_USER=invoice
POSTGRES_PASSWORD=invoice
POSTGRES_DB=invoices
FRONTEND_PORT=3000
MAX_UPLOAD_SIZE_MB=20
```

### 4. Start everything

**Option A — manual:**

```bash
cd ~/invoice-processing-system
docker compose up --build -d
```

**Option B — automated script:**

```bash
cd ~/invoice-processing-system
chmod +x scripts/setup-ubuntu.sh
./scripts/setup-ubuntu.sh
```

**Option C — Makefile:**

```bash
make up
```

### 5. Open the app

```
http://localhost:3000
```

Or from another machine on the same network:

```
http://<ubuntu-server-ip>:3000
```

If using a remote server, open the firewall port:

```bash
sudo ufw allow 3000/tcp
```

### 6. Verify services

```bash
docker compose ps
curl http://localhost:8000/api/health
```

Expected health response:

```json
{
  "status": "ok",
  "service": "invoice-processing-api",
  "database": "connected"
}
```

---

## Architecture

```
┌──────────────────┐                    ┌──────────────────────────┐     ┌─────────────┐
│    frontend      │   browser calls    │          api               │────▶│  PostgreSQL │
│  serve :3000     │ ─────────────────▶ │  FastAPI + Tesseract OCR   │     │             │
│  host :3000      │   host :8000       │  poppler (PDF → images)    │     │             │
└──────────────────┘                    └──────────────────────────┘     └─────────────┘
                                                    │
                                             uploads_data volume
```

| Service  | Container name    | Host port | Description                |
|----------|-------------------|-----------|----------------------------|
| frontend | `invoice-frontend`| 3000      | React UI (static `serve`)  |
| api      | `invoice-api`     | 8000      | Upload, OCR, extraction    |
| db       | `invoice-db`      | internal  | PostgreSQL 16              |

---

## API Endpoints

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/health`          | Health + DB status       |
| POST   | `/api/invoices/upload` | Upload & process invoice |
| GET    | `/api/invoices`        | List all invoices        |
| GET    | `/api/invoices/{id}`   | Get invoice details      |
| DELETE | `/api/invoices/{id}`   | Delete invoice           |

### Upload via curl

```bash
curl -X POST http://localhost:8000/api/invoices/upload \
  -F "file=@/path/to/invoice.pdf"
```

Supported formats: **PNG, JPG, JPEG, TIFF, BMP, PDF** (max 20 MB).

---

## Backend development (uv + ruff)

The API uses [uv](https://docs.astral.sh/uv/) for dependencies and [ruff](https://docs.astral.sh/ruff/) for lint/format.

```bash
# Install uv on Ubuntu (one-time)
curl -LsSf https://astral.sh/uv/install.sh | sh

cd backend
uv sync              # install deps into .venv
make fix             # auto-fix lint + format
make check           # verify lint + format (CI)
```

Generate `uv.lock` without installing uv locally (uses Docker):

```bash
make lock
```

| Command | Description |
|---------|-------------|
| `make sync` | Install backend deps with uv |
| `make lint` | Run ruff linter |
| `make format` | Run ruff formatter |
| `make fix` | Auto-fix lint issues + format |
| `make check` | Lint + format check (no changes) |
| `make lock` | Generate `uv.lock` via Docker |

See `backend/README.md` for more details.

---

## Useful commands

```bash
# View logs
docker compose logs -f

# View API logs only
docker compose logs -f api

# Stop services
docker compose down

# Stop and delete all data (DB + uploads)
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d

# Check container health
docker compose ps
```

---

## Troubleshooting on Ubuntu

| Problem | Fix |
|---------|-----|
| `permission denied` on docker | Run `sudo usermod -aG docker $USER` then log out/in |
| Port 3000 already in use | Change `FRONTEND_PORT=8080` in `.env`, then `docker compose up -d` |
| API unhealthy on first start | Wait 30–60s; DB init takes time. Check `docker compose logs api` |
| OCR fails on PDF | Ensure poppler is in the image (included). Check `docker compose logs api` |
| Upload times out | Large PDFs can take several minutes; axios timeout is 300s |
| Can't access from another PC | Open firewall: `sudo ufw allow 3000/tcp` |

---

## How OCR works (all inside Docker)

1. File uploaded from the React UI (axios → API on port 8000)
2. Saved to `/app/uploads` (Docker volume `uploads_data`)
3. **Images**: Pillow opens file → Tesseract extracts text
4. **PDFs**: poppler converts pages to images → Tesseract on each page
5. Regex parsers extract vendor, invoice #, date, total
6. Results stored in PostgreSQL

---

## Project structure

```
invoice-processing-system/
├── docker-compose.yml       # Service orchestration
├── .env.example             # Config template (copy to .env)
├── Makefile                 # Shortcut commands
├── scripts/
│   └── setup-ubuntu.sh      # One-shot Ubuntu setup
├── backend/
│   ├── Dockerfile           # Python + uv + Tesseract + poppler
│   ├── pyproject.toml       # Dependencies + ruff config (uv)
│   ├── uv.lock              # Lockfile (run `make lock` to generate)
│   ├── Makefile             # lint, format, fix targets
│   ├── entrypoint.sh        # Container start script
│   └── src/                 # Application source (see backend/README.md)
└── frontend/
    ├── Dockerfile           # Multi-stage: Node build → serve
    ├── package.json
    └── src/
        ├── routes/          # TanStack Router (thin wrappers → pages)
        └── pages/           # One folder per route
            ├── home/        # /
            │   ├── main.tsx
            │   ├── api.ts
            │   ├── hooks.ts
            │   └── components/
            └── auth/        # /auth
                ├── main.tsx
                ├── api.ts
                └── hooks.ts
```
