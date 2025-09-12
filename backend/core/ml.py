import os
import joblib
import numpy as np
import pandas as pd
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from .models import Event, HeadcountSnapshot

# Path to your sophisticated model
MODEL_PATH = os.path.join(settings.BASE_DIR, 'ml_models', 'crowd_predictor.joblib')


def run_ml_predict(event: Event, now: timezone.datetime):
    """
    Predicts crowd count using the sophisticated 'crowd_predictor.joblib' model.

    This function performs the necessary feature engineering by fetching historical
    data to create lags, rolling means, and other time-based features that the
    model was trained on.

    If feature engineering fails (e.g., not enough data), it falls back to a
    simple heuristic.
    """
    try:
        # --- 1. Fetch Historical Data ---
        # Fetch the last 48 hours of data to build all required features.
        start_time = now - timedelta(hours=49)
        snapshots = HeadcountSnapshot.objects.filter(
            event=event,
            timestamp__gte=start_time
        ).order_by('timestamp').values('timestamp', 'count')

        # We need at least a few data points to compute rolling averages.
        if len(snapshots) < 10:
            print("Not enough historical data for ML model. Falling back to heuristic.")
            return _heuristic_prediction(event, now), 'heuristic_insufficient_data'

        df = pd.DataFrame(list(snapshots))
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.set_index('timestamp').resample('1H').mean().interpolate()  # Resample to hourly freq

        latest_count = df['count'].iloc[-1]

        # --- 2. Feature Engineering ---
        # Recreate the features exactly as they were created for model training.

        # Time-based features
        df['hour'] = df.index.hour
        df['day_of_week'] = df.index.dayofweek
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)

        # Cyclical time features (sine/cosine transformations)
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)

        # Lag features (past values of headcount)
        for lag in [1, 2, 3, 6, 12, 24, 48]:
            df[f'headcount_lag_{lag}h'] = df['count'].shift(lag)

        # Rolling window features (mean/std over past hours)
        for window in [3, 6, 12, 24]:
            df[f'headcount_rolling_mean_{window}h'] = df['count'].shift(1).rolling(window=window).mean()
            df[f'headcount_rolling_std_{window}h'] = df['count'].shift(1).rolling(window=window).std()

        # TODO: Add your logic for placeholder features
        # These features are specific to your event's context.
        # You must provide the logic to generate them.
        df['is_special_day'] = 0  # e.g., check if now.date() is a known festival
        df['weather_impact_score'] = 0.5  # e.g., fetch from a weather API
        df['is_mumbai'] = 1  # e.g., based on event location
        df['festival_progress'] = 0.2  # e.g., day 2 of a 10-day festival
        df['days_to_visarjan'] = 8  # e.g., calculate from a known date
        df['mandal_encoded'] = 12  # e.g., a unique ID for the event organizer

        # Interaction features seen in your model file
        df['hour_x_weekend'] = df['hour'] * df['is_weekend']
        df['hour_x_special'] = df['hour'] * df['is_special_day']
        df['weather_x_weekend'] = df['weather_impact_score'] * df['is_weekend']
        df['is_peak_hour'] = ((df['hour'] >= 17) & (df['hour'] < 21)).astype(int)
        df['is_late_night'] = ((df['hour'] >= 23) | (df['hour'] < 5)).astype(int)

        # Drop rows with NaN values created by lags/rolling windows
        df = df.dropna()
        if df.empty:
            print("Not enough data after feature engineering. Falling back.")
            return _heuristic_prediction(event, now), 'heuristic_nan_after_feature_eng'

        # --- 3. Prediction ---
        model = joblib.load(MODEL_PATH)

        # Get the feature names from the model's memory (if available)
        try:
            model_features = model.feature_names_in_
        except AttributeError:
            # Manually list features if not stored in model. MUST MATCH TRAINING ORDER.
            model_features = [
                'is_weekend', 'is_special_day', 'weather_impact_score', 'hour_sin', 'hour_cos',
                'day_sin', 'day_cos', 'hour_x_weekend', 'hour_x_special', 'weather_x_weekend',
                'is_peak_hour', 'is_late_night', 'festival_progress', 'days_to_visarjan',
                'is_mumbai', 'headcount_lag_1h', 'headcount_lag_2h', 'headcount_lag_3h',
                'headcount_lag_6h', 'headcount_lag_12h', 'headcount_lag_24h', 'headcount_lag_48h',
                'headcount_rolling_mean_3h', 'headcount_rolling_std_3h',
                'headcount_rolling_mean_6h', 'headcount_rolling_std_6h',
                'headcount_rolling_mean_12h', 'headcount_rolling_std_12h',
                'headcount_rolling_mean_24h', 'headcount_rolling_std_24h', 'mandal_encoded'
            ]

        # Prepare the final feature vector for prediction (the most recent complete row)
        final_features = df[model_features].tail(1)

        prediction = model.predict(final_features)
        predicted_count = max(0, int(prediction[0]))

        return predicted_count, 'model'

    except Exception as e:
        print(f"ML model prediction failed: {e}. Falling back to heuristic.")
        return _heuristic_prediction(event, now), f'heuristic_error_{e}'


def _heuristic_prediction(event: Event, now: timezone.datetime) -> int:
    """
    A simple time-based heuristic used as a fallback.
    """
    hour = now.hour
    base_headcount = 50  # A safe default

    # Try to get the latest actual count as a better base
    latest = HeadcountSnapshot.objects.filter(event=event).order_by('-timestamp').first()
    if latest:
        base_headcount = latest.count

    if 17 <= hour < 21:  # Peak hours
        return int(base_headcount * 1.2)
    elif 11 <= hour < 14:  # Lunch hours
        return int(base_headcount * 1.1)

    return int(base_headcount * 0.95)  # Off-peak decrease