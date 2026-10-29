"""
Authentication and JWT handling for FeedbackIQ.
Uses secure HMAC-SHA256 tokens compatible with any Python environment.
"""
import hmac
import hashlib
import json
import base64
import time
from typing import Dict, Any, Optional
from .config import JWT_SECRET, JWT_EXPIRY_HOURS

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hash password using salt + SHA256."""
    if not salt:
        salt = hashlib.sha256(str(time.time()).encode()).hexdigest()[:16]
    pwd_hash = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored salt$hash."""
    if "$" not in stored_hash:
        return False
    salt, expected_hash = stored_hash.split("$", 1)
    pwd_hash = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return hmac.compare_digest(pwd_hash, expected_hash)

def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def b64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode('utf-8'))

def create_jwt_token(payload: Dict[str, Any]) -> str:
    """Creates an HMAC-SHA256 signed JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload_copy = dict(payload)
    if "exp" not in payload_copy:
        payload_copy["exp"] = int(time.time()) + (JWT_EXPIRY_HOURS * 3600)
    
    header_b64 = b64url_encode(json.dumps(header).encode())
    payload_b64 = b64url_encode(json.dumps(payload_copy).encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
    sig_b64 = b64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verifies and decodes JWT token; raises ValueError if invalid or expired."""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid JWT token format")
    
    header_b64, payload_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected_sig = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
    actual_sig = b64url_decode(sig_b64)
    
    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError("Invalid JWT signature")
    
    payload = json.loads(b64url_decode(payload_b64).decode())
    if "exp" in payload and payload["exp"] < time.time():
        raise ValueError("JWT token has expired")
        
    return payload
