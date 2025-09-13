import joblib
import numpy as np
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

class MLModelService:
    def __init__(self, model_name='crowd_predictor.joblib'):
        self.model = None
        self.model_loaded = False
        self.load_model(model_name)
    
    def load_model(self, model_name):
        try:
            model_path = os.path.join(settings.BASE_DIR, 'ml_models', model_name)
            if not os.path.exists(model_path):
                logger.error(f"Model file not found: {model_path}")
                return
            
            self.model = joblib.load(model_path)
            self.model_loaded = True
            logger.info(f"Model {model_name} loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {str(e)}")
            self.model_loaded = False
    
    def predict(self, features):
        if not self.model_loaded:
            raise ValueError("Model not loaded")
        
        # Ensure features is a numpy array with correct shape
        if not isinstance(features, np.ndarray):
            features = np.array(features)
        
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        return self.model.predict(features)
    
    def predict_proba(self, features):
        if not self.model_loaded:
            raise ValueError("Model not loaded")
        
        if not hasattr(self.model, 'predict_proba'):
            return None
        
        # Ensure features is a numpy array with correct shape
        if not isinstance(features, np.ndarray):
            features = np.array(features)
        
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        return self.model.predict_proba(features)
    
    def get_feature_importance(self):
        """Get feature importance if available"""
        if not self.model_loaded:
            return None
        
        if hasattr(self.model, 'feature_importances_'):
            return self.model.feature_importances_.tolist()
        return None

# Initialize the service
ml_service = MLModelService()

# Make sure to export the ml_service instance
__all__ = ['MLModelService', 'ml_service']