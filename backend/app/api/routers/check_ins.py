"""
Mood check-in routes — JWT required on every handler.

`get_current_user` ensures we always have a real `User` row before touching the database.
The session (`db`) is scoped to the request and closed automatically after the response.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.constants.mood_scores import MOOD_SCORES
from app.crud import crud_mood_check_in
from app.models.user import User
from app.schemas.mood_check_in import MoodCheckInCreate, MoodCheckInRead

router = APIRouter(prefix="/check-ins", tags=["mood check-ins"])

CurrentUser = Annotated[User, Depends(get_current_user)]
SIGNED_MOOD_WEIGHTS = {
    "overwhelmed": -3.0,
    "low": -2.0,
    "okay": -1.0,
    "calm": 1.0,
    "grateful": 2.0,
    "joyful": 3.0,
}


@router.post(
    "",
    response_model=MoodCheckInRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a mood check-in",
)
def submit_check_in(
    current_user: CurrentUser,
    payload: MoodCheckInCreate,
    db: Session = Depends(get_db),
) -> MoodCheckInRead:
    if payload.moods:
        # New preferred path: intensity-based weighted average on signed mood weights.
        has_intensity = any(m.intensity is not None for m in payload.moods)
        if has_intensity:
            total_intensity = sum(float(m.intensity or 0.0) for m in payload.moods)
            if total_intensity <= 0:
                total_intensity = float(len(payload.moods))
                intensities = {m.mood: 1.0 for m in payload.moods}
            else:
                intensities = {m.mood: float(m.intensity or 0.0) for m in payload.moods}

            signed_avg = sum(
                SIGNED_MOOD_WEIGHTS[mood] * intensity
                for mood, intensity in intensities.items()
            ) / total_intensity
            # Map signed [-3, 3] to display score [1, 6].
            mood_score = round(((signed_avg + 3.0) / 6.0) * 5.0 + 1.0, 2)
            dominant = max(payload.moods, key=lambda m: float(m.intensity or 0.0))
            mood_mix = [
                {"mood": m.mood, "intensity": float(m.intensity or 0.0)}
                for m in payload.moods
            ]
        else:
            # Backward compatibility for percentage payloads.
            dominant = max(payload.moods, key=lambda m: float(m.percentage or 0.0))
            mood_mix = [
                {"mood": m.mood, "percentage": float(m.percentage or 0.0)}
                for m in payload.moods
            ]
            mood_score = round(
                sum(((m.percentage or 0.0) / 100.0) * MOOD_SCORES[m.mood] for m in payload.moods),
                2,
            )
        mood_evaluation = dominant.mood
    else:
        single = payload.mood_evaluation or "okay"
        mood_mix = [{"mood": single, "percentage": 100.0}]
        mood_score = float(MOOD_SCORES.get(single, 3.0))
        mood_evaluation = single

    row = crud_mood_check_in.create_check_in(
        db,
        user_id=current_user.id,
        mood_evaluation=mood_evaluation,
        mood_mix=mood_mix,
        mood_score=mood_score,
        reflection_text=payload.reflection_text,
    )
    return MoodCheckInRead.model_validate(row)


@router.get(
    "/me",
    response_model=list[MoodCheckInRead],
    summary="List your mood check-in history (newest first)",
)
def list_my_check_ins(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> list[MoodCheckInRead]:
    rows = crud_mood_check_in.list_check_ins_for_user(
        db, user_id=current_user.id, limit=min(limit, 200)
    )
    return [MoodCheckInRead.model_validate(r) for r in rows]
