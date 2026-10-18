"""
Recurring Payment Detection Service.
Groups transactions by merchant and identifies periodic payments.
"""
from datetime import timedelta
from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import func
import statistics

from ..models.transaction import Transaction


def detect_recurring(db: Session) -> list[dict]:
    """
    Detect recurring transactions by analyzing payment intervals.

    Algorithm:
    1. Group transactions by clean_description (merchant)
    2. For each group with >= 3 transactions, compute intervals
    3. If interval variance is low (< 5 days) and aligns with
       monthly (~30d) or weekly (~7d), flag as recurring
    4. Predict next expected payment date
    """
    # Get all debit transactions grouped by merchant
    transactions = (
        db.query(Transaction)
        .filter(Transaction.type == "debit")
        .order_by(Transaction.clean_description, Transaction.date)
        .all()
    )

    # Group by clean_description
    groups = defaultdict(list)
    for txn in transactions:
        key = (txn.clean_description or txn.description).strip().lower()
        groups[key].append(txn)

    recurring_items = []

    for merchant_key, txns in groups.items():
        if len(txns) < 3:
            continue

        # Sort by date
        txns.sort(key=lambda t: t.date)

        # Calculate intervals between consecutive payments
        intervals = []
        for i in range(1, len(txns)):
            delta = (txns[i].date - txns[i - 1].date).days
            if delta > 0:
                intervals.append(delta)

        if len(intervals) < 2:
            continue

        avg_interval = statistics.mean(intervals)
        try:
            interval_stdev = statistics.stdev(intervals)
        except statistics.StatisticsError:
            interval_stdev = 0

        # Determine if recurring based on variance
        if interval_stdev > 10:
            continue  # Too much variance, not recurring

        # Classify frequency
        if 25 <= avg_interval <= 35:
            frequency = "Monthly"
        elif 5 <= avg_interval <= 10:
            frequency = "Weekly"
        elif 13 <= avg_interval <= 16:
            frequency = "Bi-weekly"
        elif 85 <= avg_interval <= 95:
            frequency = "Quarterly"
        else:
            continue

        # Calculate average amount
        amounts = [t.amount for t in txns]
        avg_amount = statistics.mean(amounts)

        # Next expected date
        last_date = txns[-1].date
        next_expected = last_date + timedelta(days=round(avg_interval))

        # Mark transactions as recurring in DB
        for t in txns:
            t.is_recurring = True
        db.commit()

        recurring_items.append(
            {
                "merchant": txns[0].clean_description or txns[0].description,
                "category": txns[0].category or "Other",
                "avg_amount": round(avg_amount, 2),
                "frequency": frequency,
                "last_date": last_date.isoformat(),
                "next_expected": next_expected.isoformat(),
                "count": len(txns),
            }
        )

    # Sort by amount descending
    recurring_items.sort(key=lambda x: x["avg_amount"], reverse=True)
    return recurring_items
