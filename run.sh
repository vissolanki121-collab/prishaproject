#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================="
echo " Starting Embedding Explorer (FastAPI + React)"
echo " Pretrained Model: all-MiniLM-L6-v2 (384-D)"
echo "=================================================="

# Check virtual environment
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Creating .venv..."
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
fi

echo "Launching Embedding Explorer on http://localhost:8000..."
exec .venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
