#!/usr/bin/env bash
set -euo pipefail

echo "=== Invoice Processing System - Ubuntu Setup ==="

if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker "$USER"
  echo "Docker installed. Log out and back in (or run: newgrp docker) so your user can run docker without sudo."
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose plugin not found. Install docker-compose-plugin."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

# shellcheck disable=SC1091
set -a && source .env && set +a

echo "Building and starting containers..."
docker compose up --build -d

echo ""
echo "Waiting for services to become healthy..."
for i in $(seq 1 60); do
  if curl -sf "http://localhost:${API_PORT:-8000}/api/health" >/dev/null 2>&1; then
    echo ""
    echo "=== Ready ==="
    echo "Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    echo "API:      http://localhost:${API_PORT:-8000}/api/health"
    echo "Logs: docker compose logs -f"
    exit 0
  fi
  sleep 2
done

echo "Services started but health check timed out. Check logs:"
echo "  docker compose ps"
echo "  docker compose logs api"
exit 1
