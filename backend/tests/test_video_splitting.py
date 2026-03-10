import pytest
from unittest.mock import MagicMock, patch
from tasks.video_tasks import split_video_task

def test_split_video_task_logic():
    # Arrange
    file_path = "uploads/dummy.mp4"
    output_dir = "outputs"
    ranges = [
        {'start': '00:00:10', 'end': '00:00:20'},
        {'start': '00:01:00', 'end': '00:01:10'}
    ]
    
    mock_job = MagicMock()
    mock_job.meta = {}
    
    # Act
    with patch('tasks.video_tasks.get_current_job', return_value=mock_job), \
         patch('subprocess.run') as mock_run, \
         patch('os.makedirs'), \
         patch('zipfile.ZipFile') as mock_zip:
        
        result = split_video_task(file_path, ranges, output_dir)
        
        # Assert
        assert mock_run.call_count == 2
        assert mock_job.save_meta.call_count == 3 # 1 init + 2 updates
        assert mock_job.meta['progress'] == 100
        assert result['status'] == "completed"
        assert result['files_count'] == 2
        assert "segments.zip" in result['full_zip']

def test_split_video_task_ffmpeg_command():
    # Arrange
    file_path = "uploads/test.mp4"
    ranges = [{'start': '00:00:05', 'end': '00:00:15'}]
    
    with patch('tasks.video_tasks.get_current_job', return_value=None), \
         patch('subprocess.run') as mock_run, \
         patch('os.makedirs'), \
         patch('zipfile.ZipFile'):
        
        split_video_task(file_path, ranges, "tmp")
        
        # Assert ffmpeg args
        args = mock_run.call_args[0][0]
        assert 'ffmpeg' in args
        assert '-ss' in args
        assert '00:00:05' in args
        assert '-to' in args
        assert '00:00:15' in args
        assert '-c' in args
        assert 'copy' in args
