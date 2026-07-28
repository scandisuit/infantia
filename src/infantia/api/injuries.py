"""Injury/incident tracking endpoints — daycare, preschool, school."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from infantia.database import get_db
from infantia.models import Child, InjuryLocation, InjuryRecord, User
from infantia.security import get_current_user

router = APIRouter(prefix="/api/children/{child_id}/injuries", tags=["injuries"])


# ── Schemas ──────────────────────────────────────────────────────────────────────


class InjuryCreate(BaseModel):
    description: str
    location: InjuryLocation
    date_of_incident: datetime
    severity: str = "minor"  # minor / moderate / serious
    treated_by: str | None = None
    follow_up: str = ""
    notes: str = ""


class InjuryUpdate(BaseModel):
    description: str | None = None
    location: InjuryLocation | None = None
    date_of_incident: datetime | None = None
    severity: str | None = None
    treated_by: str | None = None
    follow_up: str | None = None
    notes: str | None = None


class InjuryOut(BaseModel):
    id: int
    child_id: int
    description: str
    location: InjuryLocation
    date_of_incident: datetime
    severity: str
    treated_by: str | None
    follow_up: str
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


def _verify_child_owner(child_id: int, user: User, db: Session) -> Child:
    child = db.query(Child).filter(Child.id == child_id, Child.owner_id == user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child


# ── Endpoints ────────────────────────────────────────────────────────────────────


@router.post("", response_model=InjuryOut, status_code=status.HTTP_201_CREATED)
def create_injury(
    child_id: int,
    body: InjuryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = InjuryRecord(child_id=child_id, **body.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[InjuryOut])
def list_injuries(
    child_id: int,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    location: InjuryLocation | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    query = db.query(InjuryRecord).filter(InjuryRecord.child_id == child_id)
    if location:
        query = query.filter(InjuryRecord.location == location)
    return query.order_by(InjuryRecord.date_of_incident.desc()).offset(offset).limit(limit).all()


@router.get("/{record_id}", response_model=InjuryOut)
def get_injury(
    child_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(InjuryRecord).filter(
        InjuryRecord.id == record_id, InjuryRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Injury record not found")
    return record


@router.patch("/{record_id}", response_model=InjuryOut)
def update_injury(
    child_id: int,
    record_id: int,
    body: InjuryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(InjuryRecord).filter(
        InjuryRecord.id == record_id, InjuryRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Injury record not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_injury(
    child_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    record = db.query(InjuryRecord).filter(
        InjuryRecord.id == record_id, InjuryRecord.child_id == child_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Injury record not found")
    db.delete(record)
    db.commit()