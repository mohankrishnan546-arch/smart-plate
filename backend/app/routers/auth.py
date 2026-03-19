"""Authentication router — register, login, profile."""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, Token, UserProfile, HealthProfileUpdate, GuestOnboarding, AccountUpdate, EmailVerify
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from app.config import settings

# Initialize Firebase (optional — required only for Google/Phone login)
_firebase_available = False
try:
    firebase_admin.get_app()
    _firebase_available = True
except ValueError:
    try:
        firebase_admin.initialize_app()
        _firebase_available = True
    except Exception as fb_err:
        import sys
        print(f"[WARNING] Firebase Admin SDK not initialised: {fb_err}", file=sys.stderr)
        print("[INFO] Google/Phone login will be unavailable. Guest login still works.", file=sys.stderr)

router = APIRouter()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    return salt + ":" + hashlib.sha256((salt + password).encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    salt, digest = hashed.split(":")
    return hashlib.sha256((salt + password).encode()).hexdigest() == digest


def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def send_mock_email(email: str, code: str):
    print("\n" + "="*50)
    print(f"📧 MOCK EMAIL SENT TO: {email}")
    print(f"🔑 YOUR VERIFICATION CODE IS: {code}")
    print("="*50 + "\n")


def get_current_user(db: Session = Depends(get_db), authorization: str = Header(None)):
    """Simple token extraction from Header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token format")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception as e:
        print(f"Token error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        verification_code=None,
        is_verified=1 # verified by default
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return Token(access_token=create_token(user.id))


@router.post("/verify-email")
def verify_email(data: EmailVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.verification_code == data.code:
        user.is_verified = 1
        user.verification_code = None
        db.commit()
        return {"status": "success", "message": "Email verified successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid verification code")


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    # Try finding by username OR email
    user = db.query(User).filter(
        (User.username == data.username) | (User.email == data.username)
    ).first()
    
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.is_verified == 0:
        # For demo purposes, we still let them in, but frontend should show verification required
        # Or we can block them: raise HTTPException(status_code=403, detail="Email not verified")
        pass

    return Token(access_token=create_token(user.id))


class FirebaseLogin(BaseModel):
    id_token: str


@router.post("/firebase", response_model=Token)
def firebase_login(data: FirebaseLogin, db: Session = Depends(get_db)):
    """Verify Firebase ID token and login/register user."""
    # Development/Demo Bypass
    if data.id_token.startswith("demo-token"):
        # Simulated decoded token for testing
        is_phone = "phone" in data.id_token
        uid = f"demo_{secrets.token_hex(4)}"
        email = f"demo_{uid}@example.com" if not is_phone else None
        phone = "+12345678900" if is_phone else None
        name = "Demo User"
        
        user = db.query(User).filter(User.username == f"demo_{uid[:8]}").first()
        if not user:
            user = User(
                username=f"demo_{uid[:8]}",
                email=email or f"{uid}@demo.com",
                hashed_password="DEMO_AUTH",
                full_name=name,
                firebase_uid=uid,
                phone_number=phone
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return Token(access_token=create_token(user.id))

    try:
        decoded_token = firebase_auth.verify_id_token(data.id_token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")
        phone = decoded_token.get("phone_number")
        name = decoded_token.get("name", "Firebase User")

        # 1. Try finding by UID
        user = db.query(User).filter(User.firebase_uid == uid).first()
        
        # 2. If not found, try finding by email or phone and link
        if not user:
            if email:
                user = db.query(User).filter(User.email == email).first()
            elif phone:
                user = db.query(User).filter(User.phone_number == phone).first()
            
            if user:
                user.firebase_uid = uid
                db.commit()

        # 3. If still not found, create new user
        if not user:
            # Generate a random username if not available
            username = email.split("@")[0] if email else f"user_{uid[:8]}"
            user = User(
                username=username,
                email=email or f"{uid}@firebase.com",
                hashed_password="EXTERNAL_AUTH", # No local password
                full_name=name,
                firebase_uid=uid,
                phone_number=phone
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return Token(access_token=create_token(user.id))
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Firebase auth failed: {str(e)}")


@router.post("/guest", response_model=Token)
def guest_login(db: Session = Depends(get_db)):
    """Instant guest login — no credentials required."""
    user = db.query(User).filter(User.username == "guest_user").first()
    if not user:
        user = User(
            username="guest_user",
            email="guest@smartplate.ai",
            hashed_password="GUEST_AUTH",
            full_name="Guest User",
            health_conditions=["General Health"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return Token(access_token=create_token(user.id))


@router.get("/profile", response_model=UserProfile)
def get_profile(user: User = Depends(get_current_user)):
    return user


@router.put("/profile/health")
def update_health_profile(data: HealthProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if data.age is not None:
        user.age = data.age
    if data.weight_kg is not None:
        user.weight_kg = data.weight_kg
    if data.height_cm is not None:
        user.height_cm = data.height_cm
    if data.activity_level is not None:
        user.activity_level = data.activity_level
    if data.goal is not None:
        user.goal = data.goal
    if data.health_conditions is not None:
        user.health_conditions = data.health_conditions
    db.commit()
    return {"message": "Health profile updated"}


@router.put("/profile/account")
def update_account_profile(data: AccountUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.email is not None:
        # Check if email is already taken
        existing = db.query(User).filter(User.email == data.email).first()
        if existing and existing.id != user.id:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
    db.commit()
    return {"message": "Account profile updated"}
