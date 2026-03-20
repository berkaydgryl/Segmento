import os
import subprocess
import uuid
from typing import List
from rq import get_current_job

import shutil

# Try to find ffmpeg in system path, otherwise use a default or env var
FFMPEG_PATH = os.getenv("FFMPEG_PATH", shutil.which("ffmpeg") or "ffmpeg")

def split_video_task(file_path: str, ranges: List[dict], output_dir: str):
    """
    Splits video into multiple segments using FFmpeg.
    ranges: [{'start': '00:00:10', 'end': '00:00:20'}, ...]
    """
    job = get_current_job()
    task_id = str(uuid.uuid4())
    task_output_dir = os.path.join(output_dir, task_id)
    os.makedirs(task_output_dir, exist_ok=True)
    
    results = []
    total_segments = len(ranges)
    
    # Initialize progress
    if job:
        job.meta['progress'] = 0
        job.save_meta()

    for i, r in enumerate(ranges):
        start = r.get('start')
        end = r.get('end')
        output_filename = f"segment_{i+1}.mp4"
        output_path = os.path.join(task_output_dir, output_filename)
        
        # -ss before -i for fast seeking, -to for duration/end
        # -c copy for instant splitting without re-encoding
        cmd = [
            FFMPEG_PATH,
            '-ss', start,
            '-to', end,
            '-i', file_path,
            '-c', 'copy',
            '-avoid_negative_ts', '1',
            output_path,
            '-y' # Overwrite if exists
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            results.append(output_path)
        except subprocess.CalledProcessError as e:
            print(f"Error splitting segment {i}: {e.stderr.decode()}")
            
        # Update progress after each segment
        if job:
            progress = int(((i + 1) / total_segments) * 100)
            job.meta['progress'] = progress
            job.save_meta()
    
    # Create ZIP of the segments
    zip_path = os.path.join(task_output_dir, "segments.zip")
    import zipfile
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for f in results:
            zipf.write(f, os.path.basename(f))
            
    return {
        "task_id": task_id, 
        "full_zip": zip_path,
        "files_count": len(results),
        "status": "completed"
    }
