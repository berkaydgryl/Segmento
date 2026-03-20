FROM python:3.11-slim

# Install FFmpeg and other dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV UPLOAD_DIR=/app/uploads
ENV FFMPEG_PATH=ffmpeg

# Ensure upload directory exists
RUN mkdir -p /app/uploads

# Default command (Web API)
# For Worker, override with: python worker.py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
