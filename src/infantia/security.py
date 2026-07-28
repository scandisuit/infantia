"""Security dependencies — JWT bearer + API key auth."""

from datetime import datetime, timezone, timedelta

import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from infantia.config import settings
from infantia.database import SessionLocal
from infantia.models import User


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def get_user_by_api_key(db: Session, api_key: str) -> User | None:
    return db.query(User).filter(User.api_key == api_key).first()


# ── FastAPI dependencies ────────────────────────────────────────────────────────

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(lambda: next(get_db_dep())),
) -> User:
    """Extract and validate user from JWT or API key in Authorization header."""
    token = credentials.credentials

    # Try API key first
    user = get_user_by_api_key(db, token)
    if user:
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
        return user

    # Try JWT
    payload = decode_access_token(token)
    if payload and "sub" in payload:
        user_id = int(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_active:
            return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def get_db_dep():
    """Generator-based DB dependency for use in Depends()."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Re-export so Depends(get_db_dep) works
from infantia.database import get_db  # noqa: E402 — used directly elsewhere