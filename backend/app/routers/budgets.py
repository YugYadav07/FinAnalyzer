"""
Budgets Router - CRUD for category budgets with spending status.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from ..database import get_db
from ..models.budget import Budget
from ..models.transaction import Transaction
from ..schemas.budget import BudgetCreate, BudgetResponse

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


@router.get("", response_model=list[BudgetResponse])
def list_budgets(
    month: str = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db),
):
    """Fetch all budgets for a month with current spent amounts and status."""
    if not month:
        month = date.today().strftime("%Y-%m")

    budgets = db.query(Budget).filter(Budget.month_year == month).all()

    # If no budgets defined specifically for this month, carry forward baseline limits
    # from the most recent month with configured budgets, or defaults
    if not budgets:
        latest_month_row = (
            db.query(Budget.month_year)
            .order_by(Budget.month_year.desc())
            .first()
        )
        if latest_month_row:
            budgets = (
                db.query(Budget)
                .filter(Budget.month_year == latest_month_row[0])
                .all()
            )
        else:
            default_limits = {
                "Food": 8000.0,
                "Transport": 4000.0,
                "Shopping": 6000.0,
                "Bills": 5000.0,
                "Rent": 15000.0,
                "Entertainment": 3000.0,
            }
            budgets = []
            for cat, lim in default_limits.items():
                b = Budget(category=cat, monthly_limit=lim, month_year=month)
                db.add(b)
                budgets.append(b)
            db.commit()
            for b in budgets:
                db.refresh(b)

    result = []
    for budget in budgets:
        # Calculate spent amount for this category in this month
        spent = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(
                Transaction.type == "debit",
                Transaction.category == budget.category,
                func.strftime("%Y-%m", Transaction.date) == month,
            )
            .scalar()
        )
        spent = float(spent or 0)

        percentage = round((spent / budget.monthly_limit) * 100, 1) if budget.monthly_limit > 0 else 0

        # Status thresholds
        if percentage >= 100:
            status = "red"
        elif percentage >= 80:
            status = "yellow"
        else:
            status = "green"

        result.append(
            BudgetResponse(
                id=budget.id,
                category=budget.category,
                monthly_limit=budget.monthly_limit,
                month_year=month,
                spent=round(spent, 2),
                percentage=percentage,
                status=status,
            )
        )

    return result


@router.post("", response_model=BudgetResponse)
def create_or_update_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    """Create or update a category budget limit."""
    existing = (
        db.query(Budget)
        .filter(
            Budget.category == budget.category,
            Budget.month_year == budget.month_year,
        )
        .first()
    )

    if existing:
        existing.monthly_limit = budget.monthly_limit
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        new_budget = Budget(
            category=budget.category,
            monthly_limit=budget.monthly_limit,
            month_year=budget.month_year,
        )
        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)
        target = new_budget

    # Calculate spent for response
    spent = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.type == "debit",
            Transaction.category == target.category,
            func.strftime("%Y-%m", Transaction.date) == target.month_year,
        )
        .scalar()
    )
    spent = float(spent or 0)
    percentage = round((spent / target.monthly_limit) * 100, 1) if target.monthly_limit > 0 else 0

    if percentage >= 100:
        status = "red"
    elif percentage >= 80:
        status = "yellow"
    else:
        status = "green"

    return BudgetResponse(
        id=target.id,
        category=target.category,
        monthly_limit=target.monthly_limit,
        month_year=target.month_year,
        spent=round(spent, 2),
        percentage=percentage,
        status=status,
    )


@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    """Remove a budget."""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}
