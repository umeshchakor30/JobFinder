import asyncio
import logging
import os
import time
from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from quiz_data import QUIZ_DATA
except ImportError:
    from backend.quiz_data import QUIZ_DATA

app = FastAPI(title="JobFinder API")


# --- CORS Configuration ---
# 1. Base local development origins for Vite React frontend
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

# 2. Configurable production frontend origin via environment variable
# Avoids hardcoding or inventing a production domain and forbids wildcard '*'
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url.strip():
    for origin in frontend_url.split(","):
        clean_origin = origin.strip().rstrip("/")
        if clean_origin and clean_origin not in allowed_origins:
            allowed_origins.append(clean_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


logger = logging.getLogger("uvicorn")


# --- Request Logging Middleware ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Request logging middleware:
    Logs HTTP method, URL path, and response status code.
    Strictly safe: never logs request bodies, authorization headers, or credentials.
    """
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    msg = f"[REQUEST LOG] {request.method} {request.url.path} -> Status: {response.status_code} ({duration_ms:.2f}ms)"
    print(msg, flush=True)
    logger.info(msg)
    return response


# --- In-Memory Database (Temporary Storage) ---
applications = [
    {
        "id": 1,
        "company": "Google",
        "position": "Frontend Developer",
        "status": "Interviewing"
    },
    {
        "id": 2,
        "company": "Amazon",
        "position": "Backend Developer",
        "status": "Applied"
    },
    {
        "id": 3,
        "company": "Microsoft",
        "position": "Cloud Engineer",
        "status": "Applied"
    },
    {
        "id": 4,
        "company": "Meta",
        "position": "DevOps Engineer",
        "status": "Rejected"
    }
]


# --- Pydantic Models ---
class ApplicationCreate(BaseModel):
    company: str = Field(..., min_length=2, description="Company name (min 2 characters)")
    position: str = Field(..., min_length=2, description="Job position (min 2 characters)")
    status: str = Field(default="Applied", description="Application status (defaults to 'Applied')")


class ApplicationReplace(BaseModel):
    company: str = Field(..., min_length=2, description="Company name (min 2 characters)")
    position: str = Field(..., min_length=2, description="Job position (min 2 characters)")
    status: str = Field(default="Applied", description="Application status")


class ApplicationUpdate(BaseModel):
    company: Optional[str] = Field(default=None, min_length=2, description="Updated company name")
    position: Optional[str] = Field(default=None, min_length=2, description="Updated position title")
    status: Optional[str] = Field(default=None, description="Updated application status")


class ApplicationResponse(BaseModel):
    id: int
    company: str
    position: str
    status: str


class QuizQuestion(BaseModel):
    id: str = Field(..., description="Unique question identifier")
    type: str = Field(..., description="Question type: 'single' or 'multiple'")
    question: str = Field(..., description="Question text prompt")
    options: list[str] = Field(..., description="List of four possible answer choices")
    correct: list[int] = Field(..., description="0-based indices of the correct option(s)")
    explanation: str = Field(..., description="Explanation for why the answer is correct")


class QuizTrack(BaseModel):
    title: str = Field(..., description="Track title")
    icon: str = Field(..., description="Track icon emoji")
    description: str = Field(..., description="Track description")


class QuizResponse(QuizTrack):
    questions: list[QuizQuestion] = Field(..., description="List of questions for this track")


# --- Reusable Dependency Function (Dependency Injection) ---
def pagination_params(
    page: int = Query(1, ge=1, description="Page number (starting from 1)"),
    limit: int = Query(10, ge=1, description="Number of items per page")
) -> dict:
    """
    Reusable Dependency:
    Extracts, validates, and packages standard pagination query parameters.
    FastAPI will automatically resolve this function when passed to Depends().
    """
    return {"page": page, "limit": limit}


# --- Helper Functions for Clean Exception Handling ---
def get_application_or_404(application_id: int) -> dict:
    """
    Find an application record by its integer ID.
    Raises HTTP 404 with a clear message if not found.
    """
    for item in applications:
        if item["id"] == application_id:
            return item
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Application with ID {application_id} not found."
    )


def get_application_index_or_404(application_id: int) -> int:
    """
    Find the list index of an application by ID.
    Raises HTTP 404 with a clear message if not found.
    """
    for index, item in enumerate(applications):
        if item["id"] == application_id:
            return index
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Application with ID {application_id} not found."
    )


# --- Health Check Endpoint ---
@app.get("/health", status_code=status.HTTP_200_OK) # API Endpoint - Route
def health_check(): # Endpoint Handler Function
    return {
        "status": "success",
        "message": "JobFinder API is running"
    }


# --- Async/Await Demo Endpoint ---
@app.get("/stats", status_code=status.HTTP_200_OK)
async def get_application_stats():
    """
    Asynchronous Endpoint Example:
    Demonstrates async/await for non-blocking operations.
    Simulates a non-blocking asynchronous metric calculation.
    """
    await asyncio.sleep(0.01)

    total = len(applications)
    breakdown = {}
    for item in applications:
        s = item["status"]
        breakdown[s] = breakdown.get(s, 0) + 1

    return {
        "status": "success",
        "mode": "async",
        "total_applications": total,
        "status_breakdown": breakdown
    }


# --- 1. GET /applications (Uses Depends() for Pagination Dependency) ---
@app.get("/applications", response_model=list[ApplicationResponse], status_code=status.HTTP_200_OK)
def get_all_applications(
    status: Optional[str] = None,
    pagination: dict = Depends(pagination_params)
):
    """
    Retrieve job application records.
    Demonstrates FastAPI Dependency Injection via Depends(pagination_params).
    """
    results = applications
    if status:
        results = [
            item for item in results
            if item["status"].lower() == status.lower()
        ]

    page = pagination["page"]
    limit = pagination["limit"]
    start = (page - 1) * limit
    end = start + limit
    return results[start:end]


# --- 2. GET /applications/{application_id} (Retrieve Single by ID) ---
@app.get("/applications/{application_id}", response_model=ApplicationResponse, status_code=status.HTTP_200_OK)
def get_application_by_id(application_id: int):
    """Retrieve a single job application by its integer ID."""
    return get_application_or_404(application_id)


# --- 3. POST /applications (Create with Validation) ---
@app.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(payload: ApplicationCreate):
    """Create a new job application with duplicate check and safe ID generation."""
    for item in applications:
        if (
            item["company"].strip().lower() == payload.company.strip().lower()
            and item["position"].strip().lower() == payload.position.strip().lower()
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An application for '{payload.position}' at '{payload.company}' already exists."
            )

    try:
        new_id = max(item["id"] for item in applications) + 1
    except ValueError:
        new_id = 1

    new_record = {
        "id": new_id,
        "company": payload.company,
        "position": payload.position,
        "status": payload.status
    }
    applications.append(new_record)
    return new_record


# --- 4. PUT /applications/{application_id} (Full Replacement) ---
@app.put("/applications/{application_id}", response_model=ApplicationResponse, status_code=status.HTTP_200_OK)
def replace_application(application_id: int, payload: ApplicationReplace):
    """Replace an entire application record."""
    index = get_application_index_or_404(application_id)
    updated_record = {
        "id": application_id,
        "company": payload.company,
        "position": payload.position,
        "status": payload.status
    }
    applications[index] = updated_record
    return updated_record


# --- 5. PATCH /applications/{application_id} (Partial Update) ---
@app.patch("/applications/{application_id}", response_model=ApplicationResponse, status_code=status.HTTP_200_OK)
def partial_update_application(application_id: int, payload: ApplicationUpdate):
    """Update only the fields supplied in the request body."""
    item = get_application_or_404(application_id)

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided to update the application."
        )

    item.update(update_data)
    return item


# --- 6. DELETE /applications/{application_id} (Delete record) ---
@app.delete("/applications/{application_id}", status_code=status.HTTP_200_OK)
def delete_application(application_id: int):
    """Delete an application record by its ID."""
    index = get_application_index_or_404(application_id)
    try:
        deleted_record = applications.pop(index)
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found."
        )
    return {
        "status": "success",
        "message": f"Application with ID {application_id} deleted successfully.",
        "deleted": deleted_record
    }


# --- Quiz Endpoints ---
@app.get("/quizzes/{topic_key}", response_model=QuizResponse, status_code=status.HTTP_200_OK)
def get_quiz_by_topic(topic_key: str):
    """
    Retrieve practice quiz questions and track metadata for a given topic track.
    Returns HTTP 404 with a helpful message if the topic_key does not exist.
    """
    topic_data = QUIZ_DATA.get(topic_key.lower().strip())
    if not topic_data:
        valid_topics = ", ".join(QUIZ_DATA.keys())
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz topic '{topic_key}' not found. Available topics: {valid_topics}"
        )
    return topic_data
