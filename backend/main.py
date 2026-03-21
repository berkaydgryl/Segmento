from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import re
from pydantic import BaseModel
from typing import List
import uuid
import os
import shutil
import sys
import multiprocessing

# Windows compatibility monkey-patch for RQ
if sys.platform == 'win32':
    _get_context = multiprocessing.get_context
    def patched_get_context(method=None):
        if method == 'fork':
            return _get_context('spawn')
        return _get_context(method)
    multiprocessing.get_context = patched_get_context

from redis import Redis
from rq import Queue
from tasks.video_tasks import split_video_task

app = FastAPI(title="Segmento API")

# CORS for React frontend (Vercel or local)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middleware for Security Headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' *; connect-src 'self' *;"
    return response

# Setup Redis & RQ
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_conn = Redis.from_url(REDIS_URL)
q = Queue(connection=redis_conn)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

class TimeRange(BaseModel):
    start: str
    end: str

    @classmethod
    def validate_time(cls, v):
        if not re.match(r'^(\d{1,2}:)?\d{1,2}:\d{1,2}$', v):
            raise ValueError('Geçersiz zaman formatı. (HH:MM:SS veya MM:SS olmalı)')
        return v

class SplitRequest(BaseModel):
    ranges: List[TimeRange]

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    # 500MB limit
    MAX_SIZE = 500 * 1024 * 1024
    size = 0
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    # Simple extension check
    if file_extension not in ['.mp4', '.mov', '.avi', '.mkv']:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dosya formatı.")

    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
    
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024): # 1MB chunks
            size += len(chunk)
            if size > MAX_SIZE:
                os.remove(file_path)
                raise HTTPException(status_code=413, detail="Dosya çok büyük (Max 500MB).")
            buffer.write(chunk)
        
    return {"file_id": file_id, "file_path": file_path}

@app.post("/split/{file_id}")
async def start_split(file_id: str, request: SplitRequest):
    # Find the file
    file_path = None
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(file_id):
            file_path = os.path.join(UPLOAD_DIR, f)
            break
            
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Enqueue the background task
    job = q.enqueue(split_video_task, file_path, [r.dict() for r in request.ranges], OUTPUT_DIR)
    return {"job_id": job.id, "status": "queued"}

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    job = q.fetch_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "job_id": job.id,
        "status": job.get_status(),
        "progress": job.meta.get("progress", 0),
        "result": job.result if job.is_finished else None
    }

@app.get("/video/{file_id}")
async def get_video(file_id: str):
    file_path = None
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(file_id):
            file_path = os.path.join(UPLOAD_DIR, f)
            break
            
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
        
    from fastapi.responses import FileResponse
    return FileResponse(file_path)

@app.get("/download/{job_id}")
async def download_result(job_id: str):
    job = q.fetch_job(job_id)
    if not job or not job.is_finished:
        raise HTTPException(status_code=404, detail="Result not found or not ready")
    
    zip_path = job.result.get("full_zip")
    if not zip_path or not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="ZIP file not found")
        
    from fastapi.responses import FileResponse
    return FileResponse(zip_path, filename="segmento_results.zip")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
