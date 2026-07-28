"""ORM models for Infantia — Child health tracker.

Core entities:
- User: Account holder (parent/guardian)
- Child: A child being tracked
- VaccineRecord: Vaccine administrations
- DiseaseRecord: Childhood disease/illness entries
- InjuryRecord: Injuries at daycare/preschool/school
- ShareLink: Time-limited access links for sharing with doctors/family
"""

import secrets
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from infantia.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


# ── Enums ──────────────────────────────────────────────────────────────────────


class Gender(str, PyEnum):
    male = "male"
    female = "female"
    other = "other"


class InjuryLocation(str, PyEnum):
    daycare = "daycare"
    preschool = "preschool"
    school = "school"
    home = "home"
    other = "other"


class ShareRole(str, PyEnum):
    viewer = "viewer"
    editor = "editor"


# ── User ────────────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(320), unique=True, index=True, nullable=False)
    display_name = Column(String(128), nullable=False)
    hashed_password = Column(String(256), nullable=False)
    is_active = Column(Boolean, default=True, server_default="1")
    is_admin = Column(Boolean, default=False, server_default="0")
    api_key = Column(
        String(64), unique=True, index=True, default=lambda: secrets.token_hex(32)
    )
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    children = relationship("Child", back_populates="owner", cascade="all, delete-orphan")


# ── Child ───────────────────────────────────────────────────────────────────────


class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(128), nullable=False)
    last_name = Column(String(128), nullable=False, server_default="")
    gender = Column(Enum(Gender), nullable=True)
    date_of_birth = Column(DateTime, nullable=False)
    # Birth metrics (in grams and cm)
    birth_weight_g = Column(Float, nullable=True)  # grams
    birth_length_cm = Column(Float, nullable=True)  # cm
    birth_head_circumference_cm = Column(Float, nullable=True)  # cm
    notes = Column(Text, nullable=True, server_default="")
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    owner = relationship("User", back_populates="children")
    vaccines = relationship("VaccineRecord", back_populates="child", cascade="all, delete-orphan")
    diseases = relationship("DiseaseRecord", back_populates="child", cascade="all, delete-orphan")
    injuries = relationship("InjuryRecord", back_populates="child", cascade="all, delete-orphan")
    shares = relationship("ShareLink", back_populates="child", cascade="all, delete-orphan")


# ── Vaccine Record ──────────────────────────────────────────────────────────────


class VaccineRecord(Base):
    __tablename__ = "vaccine_records"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    vaccine_name = Column(String(256), nullable=False)  # e.g. "MMR", "DTaP", "Polio"
    dose_number = Column(Integer, nullable=True, server_default="1")
    date_administered = Column(DateTime, nullable=False)
    administered_by = Column(String(256), nullable=True)  # doctor/nurse name
    lot_number = Column(String(128), nullable=True)
    notes = Column(Text, nullable=True, server_default="")
    created_at = Column(DateTime, default=_utcnow)

    child = relationship("Child", back_populates="vaccines")


# ── Disease Record ──────────────────────────────────────────────────────────────


class DiseaseRecord(Base):
    __tablename__ = "disease_records"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    disease_name = Column(String(256), nullable=False)  # e.g. "Measles", "Chickenpox"
    date_onset = Column(DateTime, nullable=False)
    date_resolved = Column(DateTime, nullable=True)
    severity = Column(String(32), nullable=True, server_default="mild")  # mild/moderate/severe
    treatment = Column(Text, nullable=True, server_default="")
    notes = Column(Text, nullable=True, server_default="")
    created_at = Column(DateTime, default=_utcnow)

    child = relationship("Child", back_populates="diseases")


# ── Injury Record ────────────────────────────────────────────────────────────────


class InjuryRecord(Base):
    __tablename__ = "injury_records"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(Enum(InjuryLocation), nullable=False)
    date_of_incident = Column(DateTime, nullable=False)
    severity = Column(String(32), nullable=True, server_default="minor")  # minor/moderate/serious
    treated_by = Column(String(256), nullable=True)  # who treated it
    follow_up = Column(Text, nullable=True, server_default="")  # follow-up actions
    notes = Column(Text, nullable=True, server_default="")
    created_at = Column(DateTime, default=_utcnow)

    child = relationship("Child", back_populates="injuries")


# ── Share Link ──────────────────────────────────────────────────────────────────


class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(64), unique=True, index=True, default=lambda: secrets.token_urlsafe(32))
    role = Column(Enum(ShareRole), default=ShareRole.viewer, server_default="viewer")
    expires_at = Column(DateTime, nullable=True)
    max_uses = Column(Integer, nullable=True)  # None = unlimited
    use_count = Column(Integer, default=0, server_default="0")
    created_at = Column(DateTime, default=_utcnow)

    child = relationship("Child", back_populates="shares")