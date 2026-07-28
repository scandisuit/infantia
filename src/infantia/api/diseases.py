"""Disease tracking endpoints."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from infantia.database import get_db
from infantia.models import Child, DiseaseRecord, User
from infantia.security import get_current_user

router = APIRouter(prefix="/api/children/{child_id}/diseases", tags=["diseases"])


# ── Schemas ──────────────────────────────────────────────────────────────────────


class DiseaseCreate(BaseModel):
    disease_name: str
    date_onset: datetime
    date_resolved: datetime | None = None
    severity: str = "mild"  # mild / moderate / severe
    treatment: str = ""
    notes: str = ""


class DiseaseUpdate(BaseModel):
    disease_name: str | None = None
    date_onset: datetime | None = None
    date_resolved: datetime | None = None
    severity: str | None = None
    treatment: str | None = None
    notes: str | None = None


class DiseaseOut(BaseModel):
    id: int
    child_id: int
    disease_name: str
    date_onset: datetime
    date_resolved: datetime | None
    severity: str
    treatment: str
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


def _verify_child_owner(child_id: int, user: User, db: Session) -> Child:
    child = db.query(Child).filter(Child.id == child_id, Child.owner_id == user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child


# ── Endpoints ────────────────────────────────────────────────────────────────────


@router.post("", response_model=DiseaseOut, status_code=status.HTTP_201_CREATED)
def create_disease(
    child_id: int,
    body: DiseaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = DiseaseRecord(child_id=child_id, **body.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[DiseaseOut])
def list_diseases(
    child_id: int,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    return (
        db.query(DiseaseRecord)
        .filter(DiseaseRecord.child_id == child_id)
        .order_by(DiseaseRecord.date_onset)
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{record_id}", response_model=DiseaseOut)
def get_disease(
    child_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(DiseaseRecord).filter(
        DiseaseRecord.id == record_id, DiseaseRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Disease record not found")
    return record


@router.patch("/{record_id}", response_model=DiseaseOut)
def update_disease(
    child_id: int,
    record_id: int,
    body: DiseaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(DiseaseRecord).filter(
        DiseaseRecord.id == record_id, DiseaseRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Disease record not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_disease(
    child_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(DiseaseRecord).filter(
        DiseaseRecord.id == record_id, DiseaseRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Disease record not found")
    db.delete(record)
    db.commit()