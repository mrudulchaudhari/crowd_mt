# backend/predictor/model_loader.py
import os
from pathlib import Path
import joblib
from django.conf import settings

_MODEL = None

def get_model():
    global _MODEL
    if _MODEL is None:
        model_path = Path(settings.BASE_DIR) / "backend" / "ml_models" / "crowd_predictor.joblibs"
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
        _MODEL = joblib.load(model_path)
    return _MODEL
