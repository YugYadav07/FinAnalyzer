"""
Authentication utilities: password hashing and JWT token management.
Uses hashlib + secrets for password hashing (no extra deps needed),
and a simple JWT-like token using base64 + hmac.
"""
import hashlib
import secrets
import hmac
import json
import base64
import time
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User

# Secret key for token signing
SECRET_KEY = "finanalyzer-secret-key-change-in-production-2024"
TOKEN_EXPIRY_SECONDS = 86400 * 7  # 7 days

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password with a random salt using SHA-256."""
    salt = secrets.token_hex(16)
    pw_hash = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${pw_hash}"


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    try:
        salt, pw_hash = hashed.split("$", 1)
        check_hash = hashlib.sha256((salt + password).encode()).hexdigest()
        return hmac.compare_digest(check_hash, pw_hash)
    except (ValueError, AttributeError):
        return False


def create_access_token(user_id: int, email: str) -> str:
    """Create a signed access token."""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS,
        "iat": int(time.time()),
    }
    payload_bytes = json.dumps(payload).encode()
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode()

    signature = hmac.new(
        SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256
    ).hexdigest()

    return f"{payload_b64}.{signature}"


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify an access token."""
    try:
        payload_b64, signature = token.rsplit(".", 1)

        expected_sig = hmac.new(
            SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_sig):
            return None

        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes)

        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Dependency to get the current authenticated user.
    Returns None if not authenticated (allows optional auth).
    """
    if credentials is None:
        return None

    token_data = decode_access_token(credentials.credentials)
    if token_data is None:
        return None

    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if user is None or not user.is_active:
        return None

    return user


def require_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency that requires authentication.
    Raises 401 if not authenticated.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token_data = decode_access_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return user
