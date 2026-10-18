"""
Seed Data Generator - Creates 6 months of realistic Indian transaction data.
Covers salary, UPI transfers, Swiggy, Uber, Electricity, Rent, Amazon, etc.
"""
import random
from datetime import date, timedelta
from sqlalchemy.orm import Session

from ..models.transaction import Transaction
from ..models.category import Category, DEFAULT_CATEGORIES
from ..models.rule import CategoryRule
from ..models.budget import Budget
from ..services.categorizer import seed_default_rules
from ..services.csv_parser import compute_row_hash, clean_description


# Realistic Indian transaction templates
DEBIT_TEMPLATES = [
    # Food - frequent
    {"desc": "UPI-SWIGGY-BUNDL TECHNOLOGIES", "amount_range": (150, 800), "category": "Food", "freq": 12},
    {"desc": "UPI-ZOMATO-ZOMATO MEDIA PVT", "amount_range": (200, 900), "category": "Food", "freq": 10},
    {"desc": "POS-DOMINOS PIZZA", "amount_range": (300, 800), "category": "Food", "freq": 3},
    {"desc": "UPI-CAFE COFFEE DAY", "amount_range": (150, 400), "category": "Food", "freq": 5},
    {"desc": "POS-RESTAURANT CHARGES", "amount_range": (500, 2500), "category": "Food", "freq": 4},

    # Transport
    {"desc": "UPI-UBER INDIA SYSTEMS", "amount_range": (100, 600), "category": "Transport", "freq": 8},
    {"desc": "UPI-OLA CABS", "amount_range": (80, 500), "category": "Transport", "freq": 6},
    {"desc": "UPI-INDIAN OIL PETROL", "amount_range": (500, 3000), "category": "Transport", "freq": 3},
    {"desc": "IRCTC-RAILWAY TICKET", "amount_range": (200, 2500), "category": "Transport", "freq": 1},

    # Shopping
    {"desc": "UPI-AMAZON PAY INDIA", "amount_range": (300, 5000), "category": "Shopping", "freq": 4},
    {"desc": "UPI-FLIPKART INTERNET", "amount_range": (500, 8000), "category": "Shopping", "freq": 2},
    {"desc": "POS-DMART READY", "amount_range": (800, 3500), "category": "Shopping", "freq": 4},
    {"desc": "UPI-BLINKIT GROCERY", "amount_range": (200, 1200), "category": "Shopping", "freq": 6},
    {"desc": "UPI-MYNTRA DESIGNS", "amount_range": (500, 4000), "category": "Shopping", "freq": 1},

    # Bills - monthly
    {"desc": "BESCOM ELECTRICITY BILL", "amount_range": (800, 2500), "category": "Bills", "freq": 1},
    {"desc": "UPI-JIO PREPAID RECHARGE", "amount_range": (239, 999), "category": "Bills", "freq": 1},
    {"desc": "NEFT-AIRTEL BROADBAND", "amount_range": (699, 1499), "category": "Bills", "freq": 1},
    {"desc": "UPI-TATA PLAY DTH", "amount_range": (300, 500), "category": "Bills", "freq": 1},

    # Rent - monthly
    {"desc": "UPI-HOUSE RENT TRANSFER", "amount_range": (12000, 25000), "category": "Rent", "freq": 1},

    # Entertainment
    {"desc": "NETFLIX SUBSCRIPTION", "amount_range": (199, 649), "category": "Entertainment", "freq": 1},
    {"desc": "SPOTIFY INDIA PREMIUM", "amount_range": (119, 179), "category": "Entertainment", "freq": 1},
    {"desc": "UPI-BOOKMYSHOW TICKETS", "amount_range": (200, 1500), "category": "Entertainment", "freq": 2},
    {"desc": "POS-PVR CINEMAS", "amount_range": (300, 1200), "category": "Entertainment", "freq": 1},

    # Health
    {"desc": "UPI-APOLLO PHARMACY", "amount_range": (100, 2000), "category": "Health", "freq": 1},
    {"desc": "UPI-CULT FIT MEMBERSHIP", "amount_range": (600, 1200), "category": "Health", "freq": 1},

    # Education
    {"desc": "UPI-UDEMY COURSE PURCHASE", "amount_range": (400, 3000), "category": "Education", "freq": 1},

    # Transfers
    {"desc": "UPI-SELF TRANSFER", "amount_range": (5000, 20000), "category": "Transfers", "freq": 1},
]

CREDIT_TEMPLATES = [
    {"desc": "NEFT-SALARY-EMPLOYER CORP", "amount_range": (45000, 85000), "category": "Income", "freq": 1},
    {"desc": "UPI-INTEREST CREDIT SBI", "amount_range": (50, 500), "category": "Income", "freq": 1},
    {"desc": "CASHBACK-AMAZON PAY", "amount_range": (10, 200), "category": "Income", "freq": 2},
    {"desc": "UPI-REFUND-FLIPKART", "amount_range": (200, 2000), "category": "Income", "freq": 0.3},
]


def generate_seed_data(db: Session) -> dict:
    """
    Clear existing data and seed 6 months of realistic transactions.
    Returns summary stats.
    """
    # Clear existing data
    db.query(Transaction).delete()
    db.query(Budget).delete()
    db.query(CategoryRule).delete()
    db.query(Category).delete()
    db.commit()

    # Seed categories
    for cat_name in DEFAULT_CATEGORIES:
        db.add(Category(name=cat_name))
    db.commit()

    # Seed default categorization rules
    seed_default_rules(db)

    # Generate 6 months of data
    today = date.today()
    start_date = today.replace(day=1) - timedelta(days=180)

    transactions = []
    current = start_date

    while current <= today:
        month_start = current.replace(day=1)
        if current.month == 12:
            month_end = current.replace(year=current.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = current.replace(month=current.month + 1, day=1) - timedelta(days=1)

        if month_end > today:
            month_end = today

        # Generate debit transactions for this month
        for template in DEBIT_TEMPLATES:
            count = max(1, int(template["freq"] * random.uniform(0.7, 1.3)))
            for _ in range(count):
                txn_date = month_start + timedelta(
                    days=random.randint(0, (month_end - month_start).days)
                )
                amount = round(
                    random.uniform(*template["amount_range"]), 2
                )

                desc = template["desc"]
                cleaned = clean_description(desc)
                row_hash = compute_row_hash(
                    txn_date.isoformat(), desc, amount, "debit"
                )

                transactions.append(
                    Transaction(
                        date=txn_date,
                        description=desc,
                        clean_description=cleaned,
                        amount=amount,
                        type="debit",
                        category=template["category"],
                        row_hash=row_hash,
                        file_hash="seed_data",
                    )
                )

        # Generate credit transactions for this month
        for template in CREDIT_TEMPLATES:
            count = max(0, int(template["freq"] * random.uniform(0.8, 1.2)))
            if count == 0 and random.random() < template["freq"]:
                count = 1

            for _ in range(count):
                if template["desc"].startswith("NEFT-SALARY"):
                    txn_date = month_start + timedelta(days=random.randint(0, 3))
                else:
                    txn_date = month_start + timedelta(
                        days=random.randint(0, (month_end - month_start).days)
                    )

                amount = round(
                    random.uniform(*template["amount_range"]), 2
                )

                desc = template["desc"]
                cleaned = clean_description(desc)
                row_hash = compute_row_hash(
                    txn_date.isoformat(), desc, amount, "credit"
                )

                transactions.append(
                    Transaction(
                        date=txn_date,
                        description=desc,
                        clean_description=cleaned,
                        amount=amount,
                        type="credit",
                        category=template["category"],
                        row_hash=row_hash,
                        file_hash="seed_data",
                    )
                )

        # Move to next month
        if current.month == 12:
            current = current.replace(year=current.year + 1, month=1, day=1)
        else:
            current = current.replace(month=current.month + 1, day=1)

    # Add occasional anomaly-inducing transactions
    anomaly_templates = [
        {"desc": "UPI-AMAZON LARGE PURCHASE", "amount": 18500, "category": "Shopping"},
        {"desc": "POS-EMERGENCY MEDICAL BILL", "amount": 15000, "category": "Health"},
        {"desc": "UPI-WEDDING GIFT TRANSFER", "amount": 11000, "category": "Transfers"},
    ]
    for tmpl in anomaly_templates:
        txn_date = today - timedelta(days=random.randint(5, 45))
        row_hash = compute_row_hash(
            txn_date.isoformat(), tmpl["desc"], tmpl["amount"], "debit"
        )
        transactions.append(
            Transaction(
                date=txn_date,
                description=tmpl["desc"],
                clean_description=clean_description(tmpl["desc"]),
                amount=tmpl["amount"],
                type="debit",
                category=tmpl["category"],
                row_hash=row_hash,
                file_hash="seed_data",
            )
        )

    # Deduplicate by row_hash before inserting
    seen_hashes = set()
    unique_transactions = []
    for txn in transactions:
        if txn.row_hash not in seen_hashes:
            seen_hashes.add(txn.row_hash)
            unique_transactions.append(txn)

    db.add_all(unique_transactions)
    db.commit()

    # Create some default budgets for current month
    current_month = today.strftime("%Y-%m")
    default_budgets = [
        {"category": "Food", "monthly_limit": 8000},
        {"category": "Transport", "monthly_limit": 4000},
        {"category": "Shopping", "monthly_limit": 6000},
        {"category": "Bills", "monthly_limit": 5000},
        {"category": "Entertainment", "monthly_limit": 3000},
        {"category": "Rent", "monthly_limit": 25000},
    ]
    for b in default_budgets:
        db.add(
            Budget(
                category=b["category"],
                monthly_limit=b["monthly_limit"],
                month_year=current_month,
            )
        )
    db.commit()

    total_debits = sum(t.amount for t in unique_transactions if t.type == "debit")
    total_credits = sum(t.amount for t in unique_transactions if t.type == "credit")

    return {
        "transactions_created": len(unique_transactions),
        "total_debits": round(total_debits, 2),
        "total_credits": round(total_credits, 2),
        "months_covered": 6,
        "budgets_created": len(default_budgets),
    }
