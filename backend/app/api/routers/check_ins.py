"""
Mood check-in routes — JWT required on every handler.

`get_current_user` ensures we always have a real `User` row before touching the database.
The session (`db`) is scoped to the request and closed automatically after the response.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_mood_check_in
from app.models.user import User
from app.schemas.mood_check_in import MoodCheckInCreate, MoodCheckInRead

router = APIRouter(prefix="/check-ins", tags=["mood check-ins"])

CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "",
    response_model=MoodCheckInRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit today’s mood check-in (one per UTC day)",
)
def submit_check_in(
    current_user: CurrentUser,
    payload: MoodCheckInCreate,
    db: Session = Depends(get_db),
) -> MoodCheckInRead:
    today = crud_mood_check_in.utc_today()
    if crud_mood_check_in.get_check_in_for_user_on_utc_date(
        db, user_id=current_user.id, utc_date=today
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted a check-in for today (UTC).",
        )
    row = crud_mood_check_in.create_check_in(
        db,
        user_id=current_user.id,
        mood_evaluation=payload.mood_evaluation,
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
