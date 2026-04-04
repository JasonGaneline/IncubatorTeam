"""Numeric weights for averaging mood check-ins — keys align with `ALLOWED_MOOD_KEYS`."""

MOOD_SCORES: dict[str, float] = {
    "overwhelmed": 1.0,
    "low": 2.0,
    "okay": 3.0,
    "calm": 4.0,
    "grateful": 5.0,
    "joyful": 6.0,
}
