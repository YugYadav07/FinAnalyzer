"""
Analytics Router - Summary and charts data for the dashboard.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict
from datetime import date, datetime
from typing import Optional

from ..database import get_db
from ..models.transaction import Transaction

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

# Color mapping for categories
CATEGORY_COLORS = {
    "Food": "#f97316",
    "Transport": "#3b82f6",
    "Shopping": "#8b5cf6",
    "Bills": "#06b6d4",
    "Rent": "#ec4899",
    "Entertainment": "#f59e0b",
    "Health": "#10b981",
    "Education": "#6366f1",
    "Income": "#22c55e",
    "Transfers": "#64748b",
    "Other": "#94a3b8",
}


@router.get("/summary")
def get_summary(
    month: Optional[str] = Query(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Returns Total Income, Total Expenses, Net Savings, Savings Rate.
    """
    query = db.query(Transaction)

    if month:
        query = query.filter(func.strftime("%Y-%m", Transaction.date) == month)
    elif start_date and end_date:
        try:
            sd = datetime.strptime(start_date, "%Y-%m-%d").date()
            ed = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= sd, Transaction.date <= ed)
        except ValueError:
            pass

    transactions = query.all()

    total_income = sum(t.amount for t in transactions if t.type == "credit")
    total_expenses = sum(t.amount for t in transactions if t.type == "debit")
    net_savings = total_income - total_expenses
    savings_rate = round((net_savings / total_income) * 100, 1) if total_income > 0 else 0

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate": savings_rate,
        "transaction_count": len(transactions),
    }


@router.get("/charts")
def get_charts(
    months: int = Query(6, ge=1, le=12),
    db: Session = Depends(get_db),
):
    """
    Returns data for:
    - Income vs Expense monthly bar chart
    - Category donut chart
    - Top 5 Merchants
    """
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date)
        .all()
    )

    if not transactions:
        return {
            "monthly_trend": [],
            "category_breakdown": [],
            "top_merchants": [],
        }

    # Monthly trend (Income vs Expense)
    monthly_income = defaultdict(float)
    monthly_expense = defaultdict(float)

    for txn in transactions:
        month_key = txn.date.strftime("%Y-%m")
        if txn.type == "credit":
            monthly_income[month_key] += txn.amount
        else:
            monthly_expense[month_key] += txn.amount

    all_months = sorted(set(list(monthly_income.keys()) + list(monthly_expense.keys())))
    # Take last N months
    recent_months = all_months[-months:]

    monthly_trend = []
    for m in recent_months:
        # Format month label like "Oct 2026"
        try:
            label = datetime.strptime(m, "%Y-%m").strftime("%b %Y")
        except ValueError:
            label = m

        monthly_trend.append({
            "label": label,
            "month": m,
            "income": round(monthly_income.get(m, 0), 2),
            "expense": round(monthly_expense.get(m, 0), 2),
        })

    # Category breakdown (debit only for expenses)
    category_totals = defaultdict(float)
    for txn in transactions:
        if txn.type == "debit":
            category_totals[txn.category or "Other"] += txn.amount

    total_expense = sum(category_totals.values())
    category_breakdown = []
    for cat, amount in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        pct = round((amount / total_expense) * 100, 1) if total_expense > 0 else 0
        category_breakdown.append({
            "category": cat,
            "amount": round(amount, 2),
            "percentage": pct,
            "color": CATEGORY_COLORS.get(cat, "#94a3b8"),
        })

    # Top 5 Merchants
    merchant_totals = defaultdict(lambda: {"total": 0.0, "count": 0})
    for txn in transactions:
        if txn.type == "debit":
            merchant = txn.clean_description or txn.description
            merchant_totals[merchant]["total"] += txn.amount
            merchant_totals[merchant]["count"] += 1

    top_merchants = sorted(
        [
            {"merchant": k, "total": round(v["total"], 2), "count": v["count"]}
            for k, v in merchant_totals.items()
        ],
        key=lambda x: x["total"],
        reverse=True,
    )[:5]

    return {
        "monthly_trend": monthly_trend,
        "category_breakdown": category_breakdown,
        "top_merchants": top_merchants,
    }
