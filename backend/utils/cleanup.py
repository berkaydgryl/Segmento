import os
import time
import shutil

def cleanup_old_files(upload_dir: str, output_dir: str, max_age_seconds: int = 3600):
    """
    Deletes files and directories older than max_age_seconds.
    """
    now = time.time()
    
    for folder in [upload_dir, output_dir]:
        for item in os.listdir(folder):
            item_path = os.path.join(folder, item)
            
            # Check modification time
            if os.path.getmtime(item_path) < (now - max_age_seconds):
                try:
                    if os.path.isfile(item_path):
                        os.remove(item_path)
                    elif os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                    print(f"Cleaned up: {item_path}")
                except Exception as e:
                    print(f"Error cleaning up {item_path}: {e}")

if __name__ == "__main__":
    # Can be run as a cron job or background task
    cleanup_old_files("uploads", "outputs")
