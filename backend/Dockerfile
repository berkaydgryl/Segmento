FROM python:3.11-slim

# Install FFmpeg and other dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure start script is executable
RUN chmod +x start.sh

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV UPLOAD_DIR=/app/uploads
ENV FFMPEG_PATH=ffmpeg

# Ensure upload directory exists
RUN mkdir -p /app/uploads

# Start both services
CMD ["./start.sh"]
