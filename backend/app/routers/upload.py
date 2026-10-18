"""
Upload Router - CSV preview and processing endpoints.
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.transaction import Transaction
from ..services.csv_parser import preview_csv, parse_csv_rows
from ..services.categorizer import categorize_transactions
from ..services.anomaly import detect_anomalies

router = APIRouter(prefix="/api/upload", tags=["Upload"])


@router.post("/preview")
async def upload_preview(file: UploadFile = File(...)):
    """
    Accept CSV file, return auto-detected columns and first 5 preview rows.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    result = preview_csv(content)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.post("/process")
async def upload_process(
    file: UploadFile = File(...),
    date_col: int = Form(...),
    desc_col: int = Form(...),
    amount_col: Optional[int] = Form(None),
    type_col: Optional[int] = Form(None),
    debit_col: Optional[int] = Form(None),
    credit_col: Optional[int] = Form(None),
    clear_existing: Optional[bool] = Form(False),
    db: Session = Depends(get_db),
):
    """
    Process CSV with column mappings, parse, deduplicate, categorize, and save.
    """
    content = await file.read()

    # Parse CSV rows
    transactions = parse_csv_rows(
        content, date_col, desc_col, amount_col, type_col, debit_col, credit_col
    )

    if not transactions:
        raise HTTPException(
            status_code=400, detail="No valid transactions found in CSV"
        )

    # If requested to clear existing transactions, wipe before importing this CSV
    if clear_existing:
        db.query(Transaction).delete()
        db.commit()

    # Categorize
    transactions = categorize_transactions(transactions, db)

    # Deduplicate against existing DB records
    new_count = 0
    duplicate_count = 0
    for txn_data in transactions:
        existing = (
            db.query(Transaction)
            .filter(Transaction.row_hash == txn_data["row_hash"])
            .first()
        )
        if existing:
            duplicate_count += 1
            continue

        txn = Transaction(**txn_data)
        db.add(txn)
        new_count += 1

    db.commit()

    # Run anomaly detection on all data
    detect_anomalies(db)

    # Detect months present in the uploaded transactions
    uploaded_months = sorted(list(set(t["date"].strftime("%Y-%m") for t in transactions)))
    latest_month = uploaded_months[-1] if uploaded_months else None

    return {
        "message": f"Successfully imported {new_count} transactions",
        "new_transactions": new_count,
        "duplicates_skipped": duplicate_count,
        "total_parsed": len(transactions),
        "uploaded_months": uploaded_months,
        "latest_month": latest_month,
    }
