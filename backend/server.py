from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'family-tree-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class FamilyMemberCreate(BaseModel):
    name: str
    relationship: str
    birth_date: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    parent_id: Optional[str] = None

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    birth_date: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    parent_id: Optional[str] = None

class FamilyMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    relationship: str
    birth_date: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    parent_id: Optional[str] = None
    photos: List[str] = []
    created_by: str
    created_at: str

class PhotoAdd(BaseModel):
    photo_url: str
    caption: Optional[str] = None

class Photo(BaseModel):
    id: str
    photo_url: str
    caption: Optional[str] = None
    added_at: str

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    location: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    location: Optional[str] = None
    created_by: str
    created_at: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pw,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user = Depends(get_current_user)):
    return UserResponse(id=user["id"], email=user["email"], name=user["name"])

# ==================== FAMILY MEMBERS ROUTES ====================

@api_router.post("/members", response_model=FamilyMember)
async def create_member(member_data: FamilyMemberCreate, user = Depends(get_current_user)):
    member_id = str(uuid.uuid4())
    member_doc = {
        "id": member_id,
        "name": member_data.name,
        "relationship": member_data.relationship,
        "birth_date": member_data.birth_date,
        "bio": member_data.bio,
        "photo_url": member_data.photo_url,
        "parent_id": member_data.parent_id,
        "photos": [],
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.family_members.insert_one(member_doc)
    if "_id" in member_doc:
        del member_doc["_id"]
    return FamilyMember(**member_doc)

@api_router.get("/members", response_model=List[FamilyMember])
async def get_members(user = Depends(get_current_user)):
    members = await db.family_members.find(
        {"created_by": user["id"]}, 
        {"_id": 0}
    ).to_list(1000)
    return [FamilyMember(**m) for m in members]

@api_router.get("/members/{member_id}", response_model=FamilyMember)
async def get_member(member_id: str, user = Depends(get_current_user)):
    member = await db.family_members.find_one(
        {"id": member_id, "created_by": user["id"]},
        {"_id": 0}
    )
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return FamilyMember(**member)

@api_router.put("/members/{member_id}", response_model=FamilyMember)
async def update_member(member_id: str, update_data: FamilyMemberUpdate, user = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.family_members.find_one_and_update(
        {"id": member_id, "created_by": user["id"]},
        {"$set": update_dict},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Member not found")
    return FamilyMember(**result)

@api_router.delete("/members/{member_id}")
async def delete_member(member_id: str, user = Depends(get_current_user)):
    result = await db.family_members.delete_one({"id": member_id, "created_by": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted successfully"}

# ==================== PHOTO ALBUM ROUTES ====================

@api_router.post("/members/{member_id}/photos", response_model=Photo)
async def add_photo(member_id: str, photo_data: PhotoAdd, user = Depends(get_current_user)):
    member = await db.family_members.find_one({"id": member_id, "created_by": user["id"]})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    photo_id = str(uuid.uuid4())
    photo_doc = {
        "id": photo_id,
        "photo_url": photo_data.photo_url,
        "caption": photo_data.caption,
        "added_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.family_members.update_one(
        {"id": member_id},
        {"$push": {"photos": photo_doc}}
    )
    return Photo(**photo_doc)

@api_router.get("/members/{member_id}/photos", response_model=List[Photo])
async def get_photos(member_id: str, user = Depends(get_current_user)):
    member = await db.family_members.find_one(
        {"id": member_id, "created_by": user["id"]},
        {"_id": 0, "photos": 1}
    )
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return [Photo(**p) for p in member.get("photos", [])]

@api_router.delete("/members/{member_id}/photos/{photo_id}")
async def delete_photo(member_id: str, photo_id: str, user = Depends(get_current_user)):
    result = await db.family_members.update_one(
        {"id": member_id, "created_by": user["id"]},
        {"$pull": {"photos": {"id": photo_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"message": "Photo deleted successfully"}

# ==================== EVENTS ROUTES ====================

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, user = Depends(get_current_user)):
    event_id = str(uuid.uuid4())
    event_doc = {
        "id": event_id,
        "title": event_data.title,
        "description": event_data.description,
        "event_date": event_data.event_date,
        "event_time": event_data.event_time,
        "location": event_data.location,
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(event_doc)
    del event_doc["_id"] if "_id" in event_doc else None
    return Event(**event_doc)

@api_router.get("/events", response_model=List[Event])
async def get_events(user = Depends(get_current_user)):
    events = await db.events.find(
        {"created_by": user["id"]},
        {"_id": 0}
    ).to_list(1000)
    return [Event(**e) for e in events]

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str, user = Depends(get_current_user)):
    event = await db.events.find_one(
        {"id": event_id, "created_by": user["id"]},
        {"_id": 0}
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**event)

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, update_data: EventUpdate, user = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.events.find_one_and_update(
        {"id": event_id, "created_by": user["id"]},
        {"$set": update_dict},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**result)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, user = Depends(get_current_user)):
    result = await db.events.delete_one({"id": event_id, "created_by": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Family Tree API is running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
