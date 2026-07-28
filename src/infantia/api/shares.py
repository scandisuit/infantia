"""Share link endpoints — time-limited access for doctors/family."""

from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from infantia.database import get_db
from infantia.models import Child, ShareLink, ShareRole, User
from infantia.security import get_current_user

router = APIRouter(prefix="/api/children/{child_id}/shares", tags=["shares"])


# ── Schemas ──────────────────────────────────────────────────────────────────────


class ShareCreate(BaseModel):
    role: ShareRole = ShareRole.viewer
    expires_hours: int | None = 168  # default 7 days
    max_uses: int | None = None  # None = unlimited


class ShareOut(BaseModel):
    id: int
    child_id: int
    token: str
    role: ShareRole
    expires_at: datetime | None
    max_uses: int | None
    use_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SharedChildView(BaseModel):
    """What a share recipient sees — limited child info + health records."""
    child: dict
    vaccines: list[dict]
    diseases: list[dict]
    injuries: list[dict]


def _verify_child_owner(child_id: int, user: User, db: Session) -> Child:
    child = db.query(Child).filter(Child.id == child_id, Child.owner_id == user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child


# ── Owner endpoints ─────────────────────────────────────────────────────────────


@router.post("", response_model=ShareOut, status_code=status.HTTP_201_CREATED)
def create_share(
    child_id: int,
    body: ShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a share link for a child's health record."""
    _verify_child_owner(child_id, current_user, db)
    expires_at = None
    if body.expires_hours:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=body.expires_hours)
    share = ShareLink(
        child_id=child_id,
        role=body.role,
        expires_at=expires_at,
        max_uses=body.max_uses,
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


@router.get("", response_model=list[ShareOut])
def list_shares(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    return db.query(ShareLink).filter(ShareLink.child_id == child_id).order_by(ShareLink.created_at.desc()).all()


@router.delete("/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_share(
    child_id: int,
    share_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_child_owner(child_id, current_user, db)
    share = db.query(ShareLink).filter(ShareLink.id == share_id, ShareLink.child_id == child_id).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    db.delete(share)
    db.commit()


# ── Public access endpoint ──────────────────────────────────────────────────────


@router.get("/view/{token}", response_model=SharedChildView)
def view_shared(token: str, db: Session = Depends(get_db)):
    """Access shared child data via token. No auth required."""
    share = db.query(ShareLink).filter(ShareLink.token == token).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")

    # Check expiry
    if share.expires_at and datetime.now(timezone.utc) > share.expires_at.replace(tzinfo=timezone.utc):
        db.delete(share)
        db.commit()
        raise HTTPException(status_code=410, detail="Share link has expired")

    # Check use limit
    if share.max_uses and share.use_count >= share.max_uses:
        raise HTTPException(status_code=410, detail="Share link has reached its use limit")

    # Increment use count
    share.use_count += 1
    db.commit()

    child = db.query(Child).filter(Child.id == share.child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Return child + health records
    from infantia.models import VaccineRecord, DiseaseRecord, InjuryRecord

    return SharedChildView(
        child={
            "id": child.id,
            "first_name": child.first_name,
            "last_name": child.last_name,
            "gender": child.gender.value if child.gender else None,
            "date_of_birth": child.date_of_birth.isoformat(),
            "birth_weight_g": child.birth_weight_g,
            "birth_length_cm": child.birth_length_cm,
            "birth_head_circumference_cm": child.birth_head_circumference_cm,
        },
        vaccines=[
            {
                "id": v.id,
                "vaccine_name": v.vaccine_name,
                "dose_number": v.dose_number,
                "date_administered": v.date_administered.isoformat(),
                "administered_by": v.administered_by,
                "lot_number": v.lot_number,
            }
            for v in db.query(VaccineRecord).filter(VaccineRecord.child_id == child.id).all()
        ],
        diseases=[
            {
                "id": d.id,
                "disease_name": d.disease_name,
                "date_onset": d.date_onset.isoformat(),
                "date_resolved": d.date_resolved.isoformat() if d.date_resolved else None,
                "severity": d.severity,
            }
            for d in db.query(DiseaseRecord).filter(DiseaseRecord.child_id == child.id).all()
        ],
        injuries=[
            {
                "id": i.id,
                "description": i.description,
                "location": i.location.value,
                "date_of_incident": i.date_of_incident.isoformat(),
                "severity": i.severity,
            }
            for i in db.query(InjuryRecord).filter(InjuryRecord.child_id == child.id).all()
        ],
    )