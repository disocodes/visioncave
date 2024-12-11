import pytest
import numpy as np
from app.services.model_processor_service import ModelProcessorService

@pytest.fixture
def model_processor():
    return ModelProcessorService()

@pytest.mark.asyncio
async def test_yolov5_initialization(model_processor):
    config = {
        'model_size': 'yolov5s',
        'confidence_threshold': 0.25
    }
    await model_processor.initialize_model('yolov5', config)
    assert 'yolov5' in model_processor.models

@pytest.mark.asyncio
async def test_yolov5_processing(model_processor):
    # Create a dummy image (3 channels, RGB)
    frame = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
    
    config = {
        'model_size': 'yolov5s',
        'confidence_threshold': 0.25
    }
    
    result = await model_processor.process_frame('yolov5', frame, config)
    assert 'detections' in result
    assert 'count' in result
    assert isinstance(result['count'], int)

@pytest.mark.asyncio
async def test_model_config_update(model_processor):
    initial_config = {
        'model_size': 'yolov5s',
        'confidence_threshold': 0.25
    }
    
    new_config = {
        'model_size': 'yolov5s',
        'confidence_threshold': 0.5
    }
    
    await model_processor.initialize_model('yolov5', initial_config)
    await model_processor.update_model_config('yolov5', new_config)
    assert 'yolov5' in model_processor.models
