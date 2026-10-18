"""
Insights Router - Recurring payments, anomalies, forecasts, and summary cards.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict

from ..database import get_db
from ..models.transaction import Transaction
from ..services.recurring import detect_recurring
from ..services.anomaly import detect_anomalies
from ..services.forecast import generate_forecast
from ..utils.currency import format_inr

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("/recurring")
def get_recurring(db: Session = Depends(get_db)):
    """Detect and return recurring transactions."""
    return detect_recurring(db)


@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    """Return anomaly-flagged transactions with reasons."""
    return detect_anomalies(db)


@router.get("/forecast")
def get_forecast(db: Session = Depends(get_db)):
    """Calculate next month spending forecast per category."""
    return generate_forecast(db)


@router.get("/cards")
def get_insight_cards(db: Session = Depends(get_db)):
    """Generate plain-English insight summary cards."""
    cards = []

    # Get current and previous month data
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.desc())
        .all()
    )

    if not transactions:
        cards.append({
            "title": "No Data",
            "message": "Upload a bank statement CSV or load demo data to see insights.",
            "type": "info",
            "icon": "upload",
        })
        return cards

    # Group spending by month and category
    monthly_cat = defaultdict(lambda: defaultdict(float))
    monthly_total = defaultdict(float)

    for txn in transactions:
        if txn.type == "debit":
            month_key = txn.date.strftime("%Y-%m")
            monthly_cat[month_key][txn.category or "Other"] += txn.amount
            monthly_total[month_key] += txn.amount

    sorted_months = sorted(monthly_total.keys(), reverse=True)

    if len(sorted_months) >= 2:
        current = sorted_months[0]
        previous = sorted_months[1]

        # Total spending comparison
        curr_total = monthly_total[current]
        prev_total = monthly_total[previous]
        if prev_total > 0:
            change_pct = ((curr_total - prev_total) / prev_total) * 100
            if change_pct > 0:
                cards.append({
                    "title": "Spending Alert",
                    "message": f"Total spending increased by {abs(change_pct):.0f}% compared to last month ({format_inr(curr_total)} vs {format_inr(prev_total)})",
                    "type": "warning",
                    "icon": "trending-up",
                })
            else:
                cards.append({
                    "title": "Great Savings!",
                    "message": f"Total spending decreased by {abs(change_pct):.0f}% compared to last month ({format_inr(curr_total)} vs {format_inr(prev_total)})",
                    "type": "success",
                    "icon": "trending-down",
                })

        # Category-level insights
        for cat in monthly_cat[current]:
            curr_amt = monthly_cat[current][cat]
            prev_amt = monthly_cat[previous].get(cat, 0)

            if prev_amt > 0:
                cat_change = ((curr_amt - prev_amt) / prev_amt) * 100
                if cat_change > 15:
                    cards.append({
                        "title": f"{cat} Spending Up",
                        "message": f"{cat} spending increased by {cat_change:.0f}% compared to last month ({format_inr(curr_amt)} vs {format_inr(prev_amt)})",
                        "type": "warning" if cat_change > 30 else "info",
                        "icon": "alert-triangle" if cat_change > 30 else "info",
                    })
                elif cat_change < -15:
                    cards.append({
                        "title": f"{cat} Savings",
                        "message": f"{cat} spending reduced by {abs(cat_change):.0f}% compared to last month. Keep it up!",
                        "type": "success",
                        "icon": "check-circle",
                    })

    # Top spending category this month
    if sorted_months:
        current = sorted_months[0]
        cat_amounts = monthly_cat[current]
        if cat_amounts:
            top_cat = max(cat_amounts, key=cat_amounts.get)
            cards.append({
                "title": "Top Category",
                "message": f"Your highest spending category this month is {top_cat} at {format_inr(cat_amounts[top_cat])}",
                "type": "info",
                "icon": "bar-chart",
            })

    # Recurring count
    recurring_count = db.query(Transaction).filter(Transaction.is_recurring == True).count()
    if recurring_count > 0:
        cards.append({
            "title": "Recurring Payments",
            "message": f"You have {recurring_count} recurring payment transactions detected across your history.",
            "type": "info",
            "icon": "repeat",
        })

    # Anomaly count
    anomaly_count = db.query(Transaction).filter(Transaction.is_anomaly == True).count()
    if anomaly_count > 0:
        cards.append({
            "title": "Unusual Transactions",
            "message": f"{anomaly_count} transaction(s) flagged as unusual spending. Review them in the anomalies section.",
            "type": "danger",
            "icon": "alert-circle",
        })

    return cards[:8]  # Limit to 8 cards
