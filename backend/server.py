from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
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
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ['SECRET_KEY']
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "author"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class CategoryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    created_by: str
    created_at: str

class TagCreate(BaseModel):
    name: str

class TagResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    created_by: str
    created_at: str

class PromptCreate(BaseModel):
    title: str
    body: str
    category_id: str
    tag_ids: List[str] = []
    published: bool = False

class PromptUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    category_id: Optional[str] = None
    tag_ids: Optional[List[str]] = None
    published: Optional[bool] = None

class PromptResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    body: str
    category_id: str
    category_name: Optional[str] = None
    tag_ids: List[str]
    tag_names: List[str] = []
    author_id: str
    author_name: Optional[str] = None
    published: bool
    average_rating: float = 0.0
    rating_count: int = 0
    created_at: str
    updated_at: str

class RatingCreate(BaseModel):
    prompti_id: str
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = ""
    user_name: Optional[str] = ""
    user_email: Optional[str] = ""

class RatingResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    prompti_id: str
    rating: int
    feedback: str
    user_name: str
    user_email: str
    created_at: str

class SettingsUpdate(BaseModel):
    logo_url: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    contact_email: Optional[str] = None

class SettingsResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    logo_url: str
    company_name: str
    company_website: str
    contact_email: str
    updated_at: str

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Initialize admin user and default settings
@app.on_event("startup")
async def startup_event():
    admin_email = "nihaan.mohammed@dhwaniris.com"
    existing_admin = await db.users.find_one({"email": admin_email}, {"_id": 0})
    
    if not existing_admin:
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password("Nihaan@123!"),
            "name": "Nihaan Mohammed",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logger.info(f"Admin user created: {admin_email}")
    
    # Initialize default settings
    existing_settings = await db.settings.find_one({"id": "app_settings"}, {"_id": 0})
    if not existing_settings:
        default_settings = {
            "id": "app_settings",
            "logo_url": "https://customer-assets.emergentagent.com/job_prompt-forge-125/artifacts/b9zqkf94_Dhwani%20RIS%20Logo.jfif",
            "company_name": "Dhwani RIS",
            "company_website": "https://dhwaniris.com",
            "contact_email": "partnerships@dhwaniris.com",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.settings.insert_one(default_settings)
        logger.info("Default settings created")

# Auth routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    email_lower = user.email.lower()
    existing = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": email_lower,
        "password_hash": hash_password(user.password),
        "name": user.name,
        "role": "author",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    return UserResponse(
        id=user_doc["id"],
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
        created_at=user_doc["created_at"]
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    email_lower = credentials.email.lower()
    user = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

# User management routes (Admin only)
@api_router.get("/users", response_model=List[UserResponse])
async def get_users(admin: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**user) for user in users]

@api_router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, admin: dict = Depends(require_admin)):
    email_lower = user.email.lower()
    existing = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": email_lower,
        "password_hash": hash_password(user.password),
        "name": user.name,
        "role": user.role if user.role in ["admin", "author"] else "author",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    return UserResponse(
        id=user_doc["id"],
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
        created_at=user_doc["created_at"]
    )

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Category routes (Admin only)
@api_router.post("/categories", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, admin: dict = Depends(require_admin)):
    category_doc = {
        "id": str(uuid.uuid4()),
        "name": category.name,
        "description": category.description,
        "created_by": admin["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(category_doc)
    return CategoryResponse(**category_doc)

@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return [CategoryResponse(**cat) for cat in categories]

@api_router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str, category: CategoryCreate, admin: dict = Depends(require_admin)):
    result = await db.categories.find_one_and_update(
        {"id": category_id},
        {"$set": {"name": category.name, "description": category.description}},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse(**result)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, admin: dict = Depends(require_admin)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# Tag routes (Admin only)
@api_router.post("/tags", response_model=TagResponse)
async def create_tag(tag: TagCreate, admin: dict = Depends(require_admin)):
    tag_doc = {
        "id": str(uuid.uuid4()),
        "name": tag.name,
        "created_by": admin["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tags.insert_one(tag_doc)
    return TagResponse(**tag_doc)

@api_router.get("/tags", response_model=List[TagResponse])
async def get_tags():
    tags = await db.tags.find({}, {"_id": 0}).to_list(1000)
    return [TagResponse(**tag) for tag in tags]

@api_router.put("/tags/{tag_id}", response_model=TagResponse)
async def update_tag(tag_id: str, tag: TagCreate, admin: dict = Depends(require_admin)):
    result = await db.tags.find_one_and_update(
        {"id": tag_id},
        {"$set": {"name": tag.name}},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Tag not found")
    return TagResponse(**result)

@api_router.delete("/tags/{tag_id}")
async def delete_tag(tag_id: str, admin: dict = Depends(require_admin)):
    result = await db.tags.delete_one({"id": tag_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"message": "Tag deleted successfully"}

# Prompti routes
@api_router.post("/prompti", response_model=PromptResponse)
async def create_prompti(prompt: PromptCreate, current_user: dict = Depends(get_current_user)):
    prompt_doc = {
        "id": str(uuid.uuid4()),
        "title": prompt.title,
        "body": prompt.body,
        "category_id": prompt.category_id,
        "tag_ids": prompt.tag_ids,
        "author_id": current_user["id"],
        "published": prompt.published,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.prompti.insert_one(prompt_doc)
    
    category = await db.categories.find_one({"id": prompt.category_id}, {"_id": 0})
    tags = await db.tags.find({"id": {"$in": prompt.tag_ids}}, {"_id": 0}).to_list(100)
    
    return PromptResponse(
        **prompt_doc,
        category_name=category["name"] if category else None,
        tag_names=[tag["name"] for tag in tags],
        author_name=current_user["name"]
    )

@api_router.get("/prompti", response_model=List[PromptResponse])
async def get_my_prompti(current_user: dict = Depends(get_current_user)):
    prompti = await db.prompti.find({"author_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    result = []
    for p in prompti:
        category = await db.categories.find_one({"id": p["category_id"]}, {"_id": 0})
        tags = await db.tags.find({"id": {"$in": p["tag_ids"]}}, {"_id": 0}).to_list(100)
        
        ratings = await db.ratings.find({"prompti_id": p["id"]}, {"_id": 0}).to_list(1000)
        avg_rating = sum(r["rating"] for r in ratings) / len(ratings) if ratings else 0.0
        
        result.append(PromptResponse(
            **p,
            category_name=category["name"] if category else None,
            tag_names=[tag["name"] for tag in tags],
            author_name=current_user["name"],
            average_rating=round(avg_rating, 1),
            rating_count=len(ratings)
        ))
    
    return result

@api_router.get("/prompti/{prompti_id}", response_model=PromptResponse)
async def get_prompti(prompti_id: str, current_user: dict = Depends(get_current_user)):
    prompt = await db.prompti.find_one({"id": prompti_id, "author_id": current_user["id"]}, {"_id": 0})
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompti not found")
    
    category = await db.categories.find_one({"id": prompt["category_id"]}, {"_id": 0})
    tags = await db.tags.find({"id": {"$in": prompt["tag_ids"]}}, {"_id": 0}).to_list(100)
    
    ratings = await db.ratings.find({"prompti_id": prompti_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in ratings) / len(ratings) if ratings else 0.0
    
    return PromptResponse(
        **prompt,
        category_name=category["name"] if category else None,
        tag_names=[tag["name"] for tag in tags],
        author_name=current_user["name"],
        average_rating=round(avg_rating, 1),
        rating_count=len(ratings)
    )

@api_router.put("/prompti/{prompti_id}", response_model=PromptResponse)
async def update_prompti(prompti_id: str, prompt_update: PromptUpdate, current_user: dict = Depends(get_current_user)):
    existing = await db.prompti.find_one({"id": prompti_id, "author_id": current_user["id"]}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Prompti not found or unauthorized")
    
    update_data = {k: v for k, v in prompt_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.prompti.find_one_and_update(
        {"id": prompti_id},
        {"$set": update_data},
        return_document=True,
        projection={"_id": 0}
    )
    
    category = await db.categories.find_one({"id": result["category_id"]}, {"_id": 0})
    tags = await db.tags.find({"id": {"$in": result["tag_ids"]}}, {"_id": 0}).to_list(100)
    
    ratings = await db.ratings.find({"prompti_id": prompti_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in ratings) / len(ratings) if ratings else 0.0
    
    return PromptResponse(
        **result,
        category_name=category["name"] if category else None,
        tag_names=[tag["name"] for tag in tags],
        author_name=current_user["name"],
        average_rating=round(avg_rating, 1),
        rating_count=len(ratings)
    )

@api_router.delete("/prompti/{prompti_id}")
async def delete_prompti(prompti_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.prompti.delete_one({"id": prompti_id, "author_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prompti not found or unauthorized")
    return {"message": "Prompti deleted successfully"}

# Public routes
@api_router.get("/public/prompti", response_model=List[PromptResponse])
async def get_public_prompti(category_id: Optional[str] = None, search: Optional[str] = None):
    query = {"published": True}
    if category_id:
        query["category_id"] = category_id
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"body": {"$regex": search, "$options": "i"}}
        ]
    
    prompti = await db.prompti.find(query, {"_id": 0}).to_list(1000)
    
    result = []
    for p in prompti:
        category = await db.categories.find_one({"id": p["category_id"]}, {"_id": 0})
        tags = await db.tags.find({"id": {"$in": p["tag_ids"]}}, {"_id": 0}).to_list(100)
        author = await db.users.find_one({"id": p["author_id"]}, {"_id": 0})
        
        ratings = await db.ratings.find({"prompti_id": p["id"]}, {"_id": 0}).to_list(1000)
        avg_rating = sum(r["rating"] for r in ratings) / len(ratings) if ratings else 0.0
        
        result.append(PromptResponse(
            **p,
            category_name=category["name"] if category else None,
            tag_names=[tag["name"] for tag in tags],
            author_name=author["name"] if author else "Unknown",
            average_rating=round(avg_rating, 1),
            rating_count=len(ratings)
        ))
    
    return result

@api_router.get("/public/prompti/{prompti_id}", response_model=PromptResponse)
async def get_public_prompti_detail(prompti_id: str):
    prompt = await db.prompti.find_one({"id": prompti_id, "published": True}, {"_id": 0})
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompti not found")
    
    category = await db.categories.find_one({"id": prompt["category_id"]}, {"_id": 0})
    tags = await db.tags.find({"id": {"$in": prompt["tag_ids"]}}, {"_id": 0}).to_list(100)
    author = await db.users.find_one({"id": prompt["author_id"]}, {"_id": 0})
    
    ratings = await db.ratings.find({"prompti_id": prompti_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in ratings) / len(ratings) if ratings else 0.0
    
    return PromptResponse(
        **prompt,
        category_name=category["name"] if category else None,
        tag_names=[tag["name"] for tag in tags],
        author_name=author["name"] if author else "Unknown",
        average_rating=round(avg_rating, 1),
        rating_count=len(ratings)
    )

@api_router.post("/public/prompti/{prompti_id}/rate", response_model=RatingResponse)
async def rate_prompti(prompti_id: str, rating: RatingCreate):
    prompt = await db.prompti.find_one({"id": prompti_id, "published": True}, {"_id": 0})
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompti not found")
    
    rating_doc = {
        "id": str(uuid.uuid4()),
        "prompti_id": prompti_id,
        "rating": rating.rating,
        "feedback": rating.feedback,
        "user_name": rating.user_name,
        "user_email": rating.user_email,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.ratings.insert_one(rating_doc)
    return RatingResponse(**rating_doc)

@api_router.get("/public/prompti/{prompti_id}/ratings", response_model=List[RatingResponse])
async def get_prompti_ratings(prompti_id: str):
    ratings = await db.ratings.find({"prompti_id": prompti_id}, {"_id": 0}).to_list(1000)
    return [RatingResponse(**r) for r in ratings]

# Settings routes
@api_router.get("/settings", response_model=SettingsResponse)
async def get_settings():
    settings = await db.settings.find_one({"id": "app_settings"}, {"_id": 0})
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return SettingsResponse(**settings)

@api_router.put("/settings", response_model=SettingsResponse)
async def update_settings(settings_update: SettingsUpdate, admin: dict = Depends(require_admin)):
    update_data = {k: v for k, v in settings_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.settings.find_one_and_update(
        {"id": "app_settings"},
        {"$set": update_data},
        return_document=True,
        projection={"_id": 0}
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    return SettingsResponse(**result)

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