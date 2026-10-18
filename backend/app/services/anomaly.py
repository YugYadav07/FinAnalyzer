"""
Anomaly Detection Service.
Uses Z-Score and Isolation Forest to flag unusual transactions.
"""
import numpy as np
from collections import defaultdict
from sqlalchemy.orm import Session

from ..models.transaction import Transaction
from ..utils.currency import format_inr

try:
    from sklearn.ensemble import IsolationForest

    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def detect_anomalies(db: Session) -> list[dict]:
    """
    Detect anomalous transactions using:
    1. Z-Score per category (threshold > 2.5)
    2. Isolation Forest for multivariate outlier detection

    Returns list of flagged transactions with human-readable reasons.
    """
    transactions = (
        db.query(Transaction)
        .filter(Transaction.type == "debit")
        .all()
    )

    if not transactions:
        return []

    # Group by category
    category_txns = defaultdict(list)
    for txn in transactions:
        category_txns[txn.category or "Other"].append(txn)

    anomalies = []

    for category, txns in category_txns.items():
        if len(txns) < 3:
            continue

        amounts = np.array([t.amount for t in txns])
        mean_amt = np.mean(amounts)
        std_amt = np.std(amounts)

        if std_amt == 0:
            continue

        # Z-Score detection
        for txn in txns:
            z_score = (txn.amount - mean_amt) / std_amt

            if z_score > 2.5:
                ratio = txn.amount / mean_amt
                reason = (
                    f"Amount {format_inr(txn.amount)} is {ratio:.1f}x higher than "
                    f"your average {category} expense of {format_inr(mean_amt)}"
                )

                txn.is_anomaly = True
                txn.anomaly_reason = reason

                anomalies.append(
                    {
                        "id": txn.id,
                        "date": txn.date.isoformat(),
                        "description": txn.clean_description or txn.description,
                        "amount": txn.amount,
                        "category": category,
                        "reason": reason,
                    }
                )

    # Isolation Forest (if scikit-learn is available and enough data)
    if HAS_SKLEARN and len(transactions) >= 10:
        all_amounts = np.array([[t.amount] for t in transactions])

        iso_forest = IsolationForest(
            contamination=0.05,
            random_state=42,
            n_estimators=100,
        )
        predictions = iso_forest.fit_predict(all_amounts)

        existing_ids = {a["id"] for a in anomalies}

        for txn, pred in zip(transactions, predictions):
            if pred == -1 and txn.id not in existing_ids:
                # Calculate relative comparison
                cat_txns = category_txns.get(txn.category, [])
                if cat_txns:
                    cat_mean = np.mean([t.amount for t in cat_txns])
                    if cat_mean > 0:
                        ratio = txn.amount / cat_mean
                        if ratio > 1.5:  # Only flag if notably higher
                            reason = (
                                f"Unusual transaction: {format_inr(txn.amount)} "
                                f"detected as an outlier in {txn.category} "
                                f"(avg: {format_inr(cat_mean)})"
                            )

                            txn.is_anomaly = True
                            txn.anomaly_reason = reason

                            anomalies.append(
                                {
                                    "id": txn.id,
                                    "date": txn.date.isoformat(),
                                    "description": txn.clean_description or txn.description,
                                    "amount": txn.amount,
                                    "category": txn.category,
                                    "reason": reason,
                                }
                            )

    db.commit()

    # Sort by amount descending
    anomalies.sort(key=lambda x: x["amount"], reverse=True)
    return anomalies
