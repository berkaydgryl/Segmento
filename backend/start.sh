#!/bin/bash

# Start the worker in the background
echo "Starting RQ Worker..."
python worker.py &

# Start the FastAPI server in the foreground
echo "Starting FastAPI Server..."
exec uvicorn main:app --host 0.0.0.0 --port 10000
