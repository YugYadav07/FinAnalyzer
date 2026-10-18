"""
Transactions Router - CRUD operations with pagination, search, filters, and CSV export.
"""
import csv
import io
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional

from ..database import get_db
from ..models.transaction import Transaction
from ..schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
)
from ..services.categorizer import learn_from_feedback, categorize_transaction
from ..services.csv_parser import compute_row_hash, clean_description

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("/months")
def list_transaction_months(db: Session = Depends(get_db)):
    """Return all distinct months with transaction counts, sorted newest first."""
    rows = (
        db.query(
            func.strftime("%Y-%m", Transaction.date).label("month"),
            func.count(Transaction.id).label("count"),
        )
        .group_by("month")
        .order_by(func.strftime("%Y-%m", Transaction.date).desc())
        .all()
    )
    return [{"month": r.month, "count": r.count} for r in rows if r.month]


@router.delete("/clear-all")
def clear_all_transactions(db: Session = Depends(get_db)):
    """Delete all transactions from the database."""
    count = db.query(Transaction).delete()
    db.commit()
    return {"message": f"Successfully deleted {count} transactions", "deleted_count": count}


@router.get("", response_model=TransactionListResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    month: Optional[str] = None,
    sort_by: Optional[str] = Query("recent"),
    db: Session = Depends(get_db),
):
    """List transactions with pagination, search, month filter, and sorting."""
    query = db.query(Transaction)

    # Search filter
    if q:
        query = query.filter(
            or_(
                Transaction.description.ilike(f"%{q}%"),
                Transaction.clean_description.ilike(f"%{q}%"),
                Transaction.category.ilike(f"%{q}%"),
            )
        )

    # Category filter
    if category:
        query = query.filter(Transaction.category == category)

    # Type filter
    if type:
        query = query.filter(Transaction.type == type)

    # Date range filter
    if start_date:
        try:
            sd = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= sd)
        except ValueError:
            pass

    if end_date:
        try:
            ed = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= ed)
        except ValueError:
            pass

    # Month filter (YYYY-MM)
    if month:
        try:
            year, mon = month.split("-")
            query = query.filter(
                func.strftime("%Y-%m", Transaction.date) == month
            )
        except ValueError:
            pass

    # Total count before pagination
    total = query.count()
    total_pages = max(1, (total + limit - 1) // limit)

    # Ordering logic
    if sort_by == "recent" or sort_by == "created_desc":
        order_clauses = [Transaction.id.desc()]
    elif sort_by == "date_asc":
        order_clauses = [Transaction.date.asc(), Transaction.id.asc()]
    elif sort_by == "amount_desc":
        order_clauses = [Transaction.amount.desc(), Transaction.id.desc()]
    elif sort_by == "amount_asc":
        order_clauses = [Transaction.amount.asc(), Transaction.id.asc()]
    else:  # date_desc
        order_clauses = [Transaction.date.desc(), Transaction.id.desc()]

    transactions = (
        query.order_by(*order_clauses)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return TransactionListResponse(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        transactions=[TransactionResponse.model_validate(t) for t in transactions],
    )


@router.post("", response_model=TransactionResponse)
def create_transaction(txn: TransactionCreate, db: Session = Depends(get_db)):
    """Create a manual transaction."""
    cleaned = clean_description(txn.description)
    category = categorize_transaction(txn.description + " " + cleaned, db) if txn.category == "Other" else txn.category
    row_hash = compute_row_hash(
        txn.date.isoformat(), txn.description, txn.amount, txn.type
    )

    transaction = Transaction(
        date=txn.date,
        description=txn.description,
        clean_description=cleaned,
        amount=txn.amount,
        type=txn.type,
        category=category,
        row_hash=row_hash,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return TransactionResponse.model_validate(transaction)


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int, updates: TransactionUpdate, db: Session = Depends(get_db)
):
    """
    Update a transaction. If category is changed, triggers feedback learning.
    """
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Check if category is being changed for feedback learning
    category_changed = updates.category and updates.category != txn.category

    # Apply updates
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(txn, key, value)

    if updates.description:
        txn.clean_description = clean_description(updates.description)

    db.commit()

    # Feedback learning
    if category_changed:
        learn_from_feedback(transaction_id, updates.category, db)

    db.refresh(txn)
    return TransactionResponse.model_validate(txn)


@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction."""
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(txn)
    db.commit()
    return {"message": "Transaction deleted successfully"}


@router.get("/export")
def export_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    month: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Export filtered transactions as downloadable CSV."""
    query = db.query(Transaction)

    if category:
        query = query.filter(Transaction.category == category)
    if type:
        query = query.filter(Transaction.type == type)
    if start_date:
        try:
            sd = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= sd)
        except ValueError:
            pass
    if end_date:
        try:
            ed = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= ed)
        except ValueError:
            pass
    if month:
        query = query.filter(func.strftime("%Y-%m", Transaction.date) == month)

    transactions = query.order_by(Transaction.date.desc()).all()

    # Build CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        ["Date", "Description", "Category", "Amount", "Type", "Recurring", "Anomaly"]
    )
    for t in transactions:
        writer.writerow(
            [
                t.date.isoformat(),
                t.description,
                t.category,
                t.amount,
                t.type,
                "Yes" if t.is_recurring else "No",
                "Yes" if t.is_anomaly else "No",
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions_export.csv"},
    )
