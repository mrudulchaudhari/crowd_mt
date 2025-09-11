# core/ml.py

from datetime import datetime

def run_ml_predict(event, now):
    """
    A simple heuristic fallback to predict headcount based on time of day.
    - Peak hours (5 PM - 9 PM) have a higher multiplier.
    - All other times are considered off-peak.
    """
    hour = now.hour
    base_headcount = 50

    # Peak hours: 5 PM (17) to just before 9 PM (21)
    if 17 <= hour < 21:
        return base_headcount * 8

    # Lunch hours: 11 AM (11) to just before 2 PM (14)
    if 11 <= hour < 14:
        return base_headcount * 5

    # Off-peak hours
    return base_headcount * 2