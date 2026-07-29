"""Medicine tracking endpoints."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from infantia.database import get_db
from infantia.models import Child, MedicineRecord, User
from infantia.security import get_current_user

router = APIRouter(prefix="/api/children/{child_id}/medicines", tags=["medicines"])

# ── Schemas ──────────────────────────────────────────────────────────────────────

class MedicineCreate(BaseModel):
    medicine_name: str
    dosage: str = ""  # e.g. "5ml", "1 tablet"
    frequency: str = ""  # e.g. "twice daily", "as needed"
    date_started: datetime
    date_ended: datetime | None = None
    prescribed_by: str = ""  # doctor name
    reason: str = ""  # why it was prescribed
    notes: str = ""

class MedicineUpdate(BaseModel):
    medicine_name: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    date_started: datetime | None = None
    date_ended: datetime | None = None
    prescribed_by: str | None = None
    reason: str | None = None
    notes: str | None = None

class MedicineOut(BaseModel):
    id: int
    child_id: int
    medicine_name: str
    dosage: str
    frequency: str
    date_started: datetime
    date_ended: datetime | None
    prescribed_by: str
    reason: str
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}

def _verify_child_owner(child_id: int, user: User, db: Session) -> Child:
    child = db.query(Child).filter(Child.id == child_id, Child.owner_id == user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child

# ── Endpoints ────────────────────────────────────────────────────────────────────

@router.post("", response_model=MedicineOut, status_code=status.HTTP_201_CREATED)
def create_medicine(
    child_id: int,
    body: MedicineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = MedicineRecord(child_id=child_id, **body.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[MedicineOut])
def list_medicines(
    child_id: int,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    return (
        db.query(MedicineRecord)
        .filter(MedicineRecord.child_id == child_id)
        .order_by(MedicineRecord.date_started.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{record_id}", response_model=MedicineOut)
def get_medicine(
    child_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(MedicineRecord).filter(
        MedicineRecord.id == record_id, MedicineRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medicine record not found")
    return record


@router.patch("/{record_id}", response_model=MedicineOut)
def update_medicine(
    child_id: int,
    record_id: int,
    body: MedicineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(MedicineRecord).filter(
        MedicineRecord.id == record_id, MedicineRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medicine record not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(
    child_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(MedicineRecord).filter(
        MedicineRecord.id == record_id, MedicineRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medicine record not found")
    db.delete(record)
    db.commit()