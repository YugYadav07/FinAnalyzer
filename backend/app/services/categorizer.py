"""
Categorizer Service - Rule-based categorization engine with feedback learning.
Tuned for Indian merchants and payment descriptors.
"""
from sqlalchemy.orm import Session
from ..models.rule import CategoryRule
from ..models.transaction import Transaction


# Default categorization rules for Indian merchants & payment patterns
DEFAULT_RULES = {
    # Food & Dining
    "swiggy": "Food",
    "zomato": "Food",
    "dominos": "Food",
    "pizza hut": "Food",
    "mcdonalds": "Food",
    "kfc": "Food",
    "burger king": "Food",
    "starbucks": "Food",
    "cafe coffee day": "Food",
    "ccd": "Food",
    "haldiram": "Food",
    "barbeque nation": "Food",
    "restaurant": "Food",
    "food": "Food",
    "dining": "Food",
    "eat": "Food",
    "kitchen": "Food",
    "biryani": "Food",
    "chai": "Food",
    "bakery": "Food",

    # Transport
    "uber": "Transport",
    "ola": "Transport",
    "rapido": "Transport",
    "irctc": "Transport",
    "railways": "Transport",
    "metro": "Transport",
    "petrol": "Transport",
    "fuel": "Transport",
    "indian oil": "Transport",
    "hp petrol": "Transport",
    "bharat petroleum": "Transport",
    "bpcl": "Transport",
    "iocl": "Transport",
    "fastag": "Transport",
    "toll": "Transport",
    "parking": "Transport",

    # Shopping
    "amazon": "Shopping",
    "flipkart": "Shopping",
    "myntra": "Shopping",
    "ajio": "Shopping",
    "meesho": "Shopping",
    "nykaa": "Shopping",
    "dmart": "Shopping",
    "d-mart": "Shopping",
    "bigbasket": "Shopping",
    "big basket": "Shopping",
    "grofers": "Shopping",
    "blinkit": "Shopping",
    "zepto": "Shopping",
    "reliance": "Shopping",
    "croma": "Shopping",
    "decathlon": "Shopping",
    "lifestyle": "Shopping",
    "shoppers stop": "Shopping",
    "mall": "Shopping",

    # Bills & Utilities
    "electricity": "Bills",
    "bescom": "Bills",
    "tata power": "Bills",
    "adani": "Bills",
    "water bill": "Bills",
    "gas bill": "Bills",
    "indane": "Bills",
    "airtel": "Bills",
    "jio": "Bills",
    "vodafone": "Bills",
    "vi ": "Bills",
    "bsnl": "Bills",
    "broadband": "Bills",
    "internet": "Bills",
    "wifi": "Bills",
    "postpaid": "Bills",
    "recharge": "Bills",
    "dth": "Bills",
    "tata sky": "Bills",

    # Rent
    "rent": "Rent",
    "house rent": "Rent",
    "pg rent": "Rent",

    # Entertainment
    "netflix": "Entertainment",
    "hotstar": "Entertainment",
    "disney": "Entertainment",
    "prime video": "Entertainment",
    "spotify": "Entertainment",
    "youtube": "Entertainment",
    "bookmyshow": "Entertainment",
    "pvr": "Entertainment",
    "inox": "Entertainment",
    "cinema": "Entertainment",
    "movie": "Entertainment",
    "gaming": "Entertainment",
    "playstation": "Entertainment",
    "xbox": "Entertainment",
    "steam": "Entertainment",

    # Health
    "hospital": "Health",
    "pharmacy": "Health",
    "medical": "Health",
    "apollo": "Health",
    "medplus": "Health",
    "netmeds": "Health",
    "pharmeasy": "Health",
    "doctor": "Health",
    "clinic": "Health",
    "dental": "Health",
    "gym": "Health",
    "fitness": "Health",
    "cult.fit": "Health",
    "insurance": "Health",
    "lic": "Health",

    # Education
    "school": "Education",
    "college": "Education",
    "university": "Education",
    "tuition": "Education",
    "udemy": "Education",
    "coursera": "Education",
    "books": "Education",
    "stationery": "Education",

    # Income
    "salary": "Income",
    "payroll": "Income",
    "stipend": "Income",
    "interest": "Income",
    "dividend": "Income",
    "refund": "Income",
    "cashback": "Income",

    # Transfers
    "transfer": "Transfers",
    "neft": "Transfers",
    "imps": "Transfers",
    "rtgs": "Transfers",
    "upi": "Transfers",
    "fund transfer": "Transfers",
    "self transfer": "Transfers",
}


def seed_default_rules(db: Session):
    """Seed the default categorization rules if not already present."""
    existing = db.query(CategoryRule).count()
    if existing > 0:
        return

    for keyword, category in DEFAULT_RULES.items():
        rule = CategoryRule(
            keyword=keyword,
            category=category,
            priority=1,
            is_custom=False,
        )
        db.add(rule)
    db.commit()


def categorize_transaction(description: str, db: Session) -> str:
    """
    Categorize a transaction based on its description using DB rules.
    Higher priority rules take precedence.
    """
    desc_lower = description.lower()

    # Get all rules ordered by priority (highest first), then custom first
    rules = (
        db.query(CategoryRule)
        .order_by(CategoryRule.priority.desc(), CategoryRule.is_custom.desc())
        .all()
    )

    for rule in rules:
        if rule.keyword.lower() in desc_lower:
            return rule.category

    return "Other"


def categorize_transactions(transactions: list[dict], db: Session) -> list[dict]:
    """Categorize a batch of transaction dicts."""
    for txn in transactions:
        desc = txn.get("description", "") + " " + txn.get("clean_description", "")
        txn["category"] = categorize_transaction(desc, db)
    return transactions


def learn_from_feedback(
    transaction_id: int, new_category: str, db: Session
) -> int:
    """
    Feedback learning: when user re-categorizes a transaction,
    extract keyword and create/update a custom rule.
    Returns count of other transactions that were auto-updated.
    """
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        return 0

    # Extract keyword from clean_description
    keyword = (txn.clean_description or txn.description).strip().lower()

    # Simplify keyword: take first meaningful word
    words = keyword.split()
    if words:
        keyword = words[0]

    # Update or create rule
    existing_rule = (
        db.query(CategoryRule).filter(CategoryRule.keyword == keyword).first()
    )
    if existing_rule:
        existing_rule.category = new_category
        existing_rule.priority = max(existing_rule.priority, 2)
        existing_rule.is_custom = True
    else:
        new_rule = CategoryRule(
            keyword=keyword,
            category=new_category,
            priority=2,
            is_custom=True,
        )
        db.add(new_rule)

    # Update the original transaction
    txn.category = new_category

    # Auto-update other transactions matching this keyword
    similar = (
        db.query(Transaction)
        .filter(
            Transaction.id != transaction_id,
            Transaction.clean_description.ilike(f"%{keyword}%"),
        )
        .all()
    )
    updated_count = 0
    for t in similar:
        t.category = new_category
        updated_count += 1

    db.commit()
    return updated_count
