#!/bin/sh
set -e

mkdir -p /app/uploads

exec uvicorn main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 300 --app-dir /app/src
