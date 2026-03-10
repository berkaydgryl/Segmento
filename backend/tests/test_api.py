import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import MagicMock, patch

client = TestClient(app)

def test_upload_video():
    # Arrange
    file_content = b"fake video content"
    files = {"file": ("test.mp4", file_content, "video/mp4")}
    
    # Act
    response = client.post("/upload", files=files)
    
    # Assert
    assert response.status_code == 200
    assert "file_id" in response.json()
    assert "file_path" in response.json()

def test_start_split_video():
    # Arrange
    file_id = "test-uuid"
    payload = {
        "ranges": [
            {"start": "00:00:10", "end": "00:00:20"}
        ]
    }
    
    # Mock os.listdir to find the "file"
    # Mock q.enqueue to avoid actual Redis
    with patch('os.listdir', return_value=[f"{file_id}.mp4"]), \
         patch('main.q.enqueue') as mock_enqueue:
        
        mock_job = MagicMock()
        mock_job.get_id.return_value = "job-123"
        mock_enqueue.return_value = mock_job
        
        # Act
        response = client.post(f"/split/{file_id}", json=payload)
        
        # Assert
        assert response.status_code == 200
        assert response.json()["job_id"] == "job-123"
        assert response.json()["status"] == "queued"

def test_get_job_status():
    # Arrange
    job_id = "job-123"
    
    with patch('main.q.fetch_job') as mock_fetch:
        mock_job = MagicMock()
        mock_job.get_id.return_value = job_id
        mock_job.get_status.return_value = "started"
        mock_job.meta = {"progress": 45}
        mock_job.is_finished = False
        mock_fetch.return_value = mock_job
        
        # Act
        response = client.get(f"/status/{job_id}")
        
        # Assert
        assert response.status_code == 200
        assert response.json()["status"] == "started"
        assert response.json()["progress"] == 45
