"""Vaccine tracking endpoints."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from infantia.database import get_db
from infantia.models import Child, VaccineRecord, User
from infantia.security import get_current_user

router = APIRouter(prefix="/api/children/{child_id}/vaccines", tags=["vaccines"])


# ── Schemas ──────────────────────────────────────────────────────────────────────


class VaccineCreate(BaseModel):
    vaccine_name: str
    dose_number: int = 1
    date_administered: datetime
    administered_by: str | None = None
    lot_number: str | None = None
    notes: str = ""


class VaccineUpdate(BaseModel):
    vaccine_name: str | None = None
    dose_number: int | None = None
    date_administered: datetime | None = None
    administered_by: str | None = None
    lot_number: str | None = None
    notes: str | None = None


class VaccineOut(BaseModel):
    id: int
    child_id: int
    vaccine_name: str
    dose_number: int
    date_administered: datetime
    administered_by: str | None
    lot_number: str | None
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


def _verify_child_owner(child_id: int, user: User, db: Session) -> Child:
    child = db.query(Child).filter(Child.id == child_id, Child.owner_id == user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child


# ── Endpoints ────────────────────────────────────────────────────────────────────


@router.post("", response_model=VaccineOut, status_code=status.HTTP_201_CREATED)
def create_vaccine(
    child_id: int,
    body: VaccineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = VaccineRecord(child_id=child_id, **body.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[VaccineOut])
def list_vaccines(
    child_id: int,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    return (
        db.query(VaccineRecord)
        .filter(VaccineRecord.child_id == child_id)
        .order_by(VaccineRecord.date_administered)
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{record_id}", response_model=VaccineOut)
def get_vaccine(
    child_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(VaccineRecord).filter(VaccineRecord.id == record_id, VaccineRecord.child_id == child_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccine record not found")
    return record


@router.patch("/{record_id}", response_model=VaccineOut)
def update_vaccine(
    child_id: int,
    record_id: int,
    body: VaccineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(VaccineRecord).filter(VaccineRecord.id == record_id, VaccineRecord.child_id == child_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccine record not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vaccine(
    child_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(VaccineRecord).filter(VaccineRecord.id == record_id, VaccineRecord.child_id == child_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccine record not found")
    db.delete(record)
    db.commit()