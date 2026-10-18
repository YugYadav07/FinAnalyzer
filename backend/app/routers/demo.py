"""
Demo Router - Seed demo data endpoint.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..utils.seed_data import generate_seed_data
from ..services.anomaly import detect_anomalies
from ..services.recurring import detect_recurring

router = APIRouter(prefix="/api/demo", tags=["Demo"])


@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """
    Clear existing transactions and seed 6 months of realistic
    Indian transaction data.
    """
    result = generate_seed_data(db)

    # Run analytics on seeded data
    detect_anomalies(db)
    detect_recurring(db)

    return {
        "message": "Demo data seeded successfully!",
        **result,
    }
