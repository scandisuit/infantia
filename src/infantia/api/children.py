"""Children endpoints — CRUD for child profiles."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from infantia.database import get_db
from infantia.models import Child, Gender, User
from infantia.security import get_current_user

router = APIRouter(prefix="/api/children", tags=["children"])


# ── Schemas ──────────────────────────────────────────────────────────────────────


class ChildCreate(BaseModel):
    first_name: str
    last_name: str = ""
    gender: Optional[Gender] = None
    date_of_birth: datetime
    birth_weight_g: Optional[float] = None
    birth_length_cm: Optional[float] = None
    birth_head_circumference_cm: Optional[float] = None
    notes: str = ""


class ChildUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[Gender] = None
    birth_weight_g: Optional[float] = None
    birth_length_cm: Optional[float] = None
    birth_head_circumference_cm: Optional[float] = None
    notes: Optional[str] = None


class ChildOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    gender: Optional[Gender] = None
    date_of_birth: datetime
    birth_weight_g: Optional[float] = None
    birth_length_cm: Optional[float] = None
    birth_head_circumference_cm: Optional[float] = None
    notes: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Endpoints ────────────────────────────────────────────────────────────────────


@router.post("", response_model=ChildOut, status_code=status.HTTP_201_CREATED)
def create_child(body: ChildCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    child = Child(owner_id=current_user.id, **body.model_dump())
    db.add(child)
    db.commit()
    db.refresh(child)
    return child


@router.get("", response_model=list[ChildOut])
def list_children(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Child)
        .filter(Child.owner_id == current_user.id)
        .order_by(Child.date_of_birth)
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{child_id}", response_model=ChildOut)
def get_child(child_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id, Child.owner_id == current_user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child


@router.patch("/{child_id}", response_model=ChildOut)
def update_child(
    child_id: int,
    body: ChildUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    child = db.query(Child).filter(Child.id == child_id, Child.owner_id == current_user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(child, field, value)
    child.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(child)
    return child


@router.delete("/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_child(child_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id, Child.owner_id == current_user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    db.delete(child)
    db.commit()