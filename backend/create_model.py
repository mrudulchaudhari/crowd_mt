import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from django.conf import settings

# Create a simple model for testing
X = np.random.rand(100, 5)  # 5 features
y = 10 * X[:, 0] + 5 * X[:, 1] + 2 * X[:, 2] + np.random.randn(100)  # Target with some noise

# Train a random forest model
model = RandomForestRegressor(n_estimators=10, random_state=42)
model.fit(X, y)

# Create the ml_models directory if it doesn't exist
os.makedirs('ml_models', exist_ok=True)

# Save the model
joblib.dump(model, 'ml_models/crowd_predictor.joblib')

print("Model created and saved to ml_models/crowd_predictor.joblib")