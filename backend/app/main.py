"""
Personal Finance Analyzer - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db
from .routers import upload, transactions, categories, budgets, insights, demo
from .routers import analytics
from .routers import auth

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="A personal finance management application with CSV import, "
    "auto-categorization, anomaly detection, and spending forecasts.",
    version="1.0.0",
)

# CORS for React frontend (supports localhost, custom origins, and all *.vercel.app preview/production domains)
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
if settings.CORS_ORIGINS:
    allowed_origins.extend([origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(insights.router)
app.include_router(analytics.router)
app.include_router(demo.router)
app.include_router(auth.router)


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup."""
    init_db()


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
