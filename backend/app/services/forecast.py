"""
Spending Forecast Service.
Uses Weighted Moving Average + Linear Regression for next-month predictions.
"""
import numpy as np
from collections import defaultdict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import extract

from ..models.transaction import Transaction

try:
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import r2_score

    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def get_monthly_spending(db: Session) -> dict[str, dict[str, float]]:
    """
    Extract monthly spending per category from database.
    Returns: { 'YYYY-MM': { 'Food': 5000.0, 'Transport': 2000.0, ... }, ... }
    """
    transactions = (
        db.query(Transaction)
        .filter(Transaction.type == "debit")
        .order_by(Transaction.date)
        .all()
    )

    monthly = defaultdict(lambda: defaultdict(float))
    for txn in transactions:
        month_key = txn.date.strftime("%Y-%m")
        category = txn.category or "Other"
        monthly[month_key][category] += txn.amount

    return dict(monthly)


def weighted_moving_average(values: list[float]) -> float:
    """
    Weighted Moving Average giving more weight to recent months.
    Weights: 50% most recent, 30% previous, 20% older.
    """
    if not values:
        return 0.0
    if len(values) == 1:
        return values[0]
    if len(values) == 2:
        return values[-1] * 0.6 + values[-2] * 0.4

    # Use last 3 values with weights
    recent = values[-3:]
    weights = [0.2, 0.3, 0.5]
    if len(recent) < 3:
        weights = weights[-len(recent):]
        # Normalize weights
        total_w = sum(weights)
        weights = [w / total_w for w in weights]

    return sum(v * w for v, w in zip(recent, weights))


def linear_regression_forecast(values: list[float]) -> tuple[float, float]:
    """
    Simple Linear Regression forecast for next period.
    Returns (forecasted_value, r2_confidence_score).
    """
    if not HAS_SKLEARN or len(values) < 2:
        return weighted_moving_average(values), 0.5

    X = np.arange(len(values)).reshape(-1, 1)
    y = np.array(values)

    model = LinearRegression()
    model.fit(X, y)

    # Predict next month
    next_X = np.array([[len(values)]])
    prediction = float(model.predict(next_X)[0])

    # R² score as confidence
    y_pred = model.predict(X)
    try:
        confidence = max(0.0, float(r2_score(y, y_pred)))
    except Exception:
        confidence = 0.5

    # Ensure prediction is non-negative for expenses
    prediction = max(0.0, prediction)

    return prediction, confidence


def generate_forecast(db: Session) -> dict:
    """
    Generate next-month spending forecast per category.
    Combines Weighted Moving Average with Linear Regression.
    """
    monthly = get_monthly_spending(db)
    sorted_months = sorted(monthly.keys())

    if not sorted_months:
        return {"total_forecasted": 0.0, "breakdown": []}

    # Get all categories across all months
    all_categories = set()
    for month_data in monthly.values():
        all_categories.update(month_data.keys())

    # Current month spending for comparison
    current_month = sorted_months[-1]
    current_spending = monthly.get(current_month, {})

    breakdown = []
    total_forecasted = 0.0

    for category in sorted(all_categories):
        # Build time series for this category
        series = [monthly[m].get(category, 0.0) for m in sorted_months]

        # Skip if all zeros
        if all(v == 0 for v in series):
            continue

        # Get WMA forecast
        wma_forecast = weighted_moving_average(series)

        # Get Linear Regression forecast
        lr_forecast, confidence = linear_regression_forecast(series)

        # Blend: 60% LR + 40% WMA (use LR more when confidence is high)
        blend_weight = 0.4 + (0.2 * confidence)  # 0.4 to 0.6 based on confidence
        forecasted = (lr_forecast * blend_weight) + (wma_forecast * (1 - blend_weight))
        forecasted = round(max(0.0, forecasted), 2)

        # Change percentage vs current month
        current_val = current_spending.get(category, 0.0)
        if current_val > 0:
            change_pct = round(((forecasted - current_val) / current_val) * 100, 1)
        else:
            change_pct = 0.0

        total_forecasted += forecasted
        breakdown.append(
            {
                "category": category,
                "current_month": round(current_val, 2),
                "forecasted": forecasted,
                "change_pct": change_pct,
                "confidence": round(confidence, 2),
            }
        )

    # Sort by forecasted amount descending
    breakdown.sort(key=lambda x: x["forecasted"], reverse=True)

    return {
        "total_forecasted": round(total_forecasted, 2),
        "breakdown": breakdown,
    }
