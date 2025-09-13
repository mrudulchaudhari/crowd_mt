# backend/predictor/utils.py
from datetime import datetime, timedelta
from django.utils import timezone
import numpy as np

from .model_loader import get_model

# If you have a HeadcountSnapshot model, import it:
try:
    from core.models import HeadcountSnapshot, Event  # adjust app/model names
except Exception:
    HeadcountSnapshot = None
    Event = None

def _make_features(current_headcount: int, when: timezone.datetime):
    """
    Build a feature vector the model expects.
    Strategy:
    - If model exposes feature_names_in_ use them (best-effort).
    - Else: return [headcount, hour, day_of_week]
    """
    model = get_model()
    hour = when.hour
    dow = when.weekday()  # 0=Mon
    base = [current_headcount, hour, dow]

    # try to detect feature name ordering
    if hasattr(model, "feature_names_in_"):
        names = list(model.feature_names_in_)
        feat = []
        for n in names:
            n_low = n.lower()
            if "head" in n_low or "count" in n_low:
                feat.append(current_headcount)
            elif "hour" in n_low or "time" in n_low:
                feat.append(hour)
            elif "day" in n_low or "weekday" in n_low or "dow" in n_low:
                feat.append(dow)
            else:
                # fallback: append 0
                feat.append(0)
        return np.array(feat, dtype=float).reshape(1, -1)

    # fallback ordering: headcount, hour, dow
    return np.array(base, dtype=float).reshape(1, -1)

def predict_next_hours(current_headcount: int, when=None, n_hours: int = 1):
    """
    Predict headcount for next n_hours.
    Returns list of tuples: [(timestamp, predicted_value), ...]
    """
    if when is None:
        when = timezone.now()
    preds = []
    model = get_model()

    last_headcount = float(current_headcount)
    for h in range(1, n_hours + 1):
        target_time = when + timedelta(hours=h)
        features = _make_features(int(last_headcount), target_time)
        pred = model.predict(features)
        # if predict returns array
        if hasattr(pred, "__len__"):
            pred_value = float(pred[0])
        else:
            pred_value = float(pred)
        preds.append((target_time, pred_value))
        # Option: feed prediction into next step (autoregressive)
        last_headcount = pred_value
    return preds

def save_predictions(event_id: int, predictions):
    """
    Save predictions to HeadcountSnapshot (or similar).
    predictions: list of (timestamp, predicted_value)
    """
    if HeadcountSnapshot is None or Event is None:
        return None

    event = Event.objects.filter(pk=event_id).first()
    if not event:
        return None

    saved = []
    for ts, val in predictions:
        snap = HeadcountSnapshot.objects.create(
            event=event,
            headcount=int(round(val)),
            recorded_at=ts,    # adjust field name if different
            predicted=True     # if your model has such flag; else remove
        )
        saved.append(snap)
    return saved
