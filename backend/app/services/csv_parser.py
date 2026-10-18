"""
CSV Parser Service - Auto-column detection & Indian currency/date parsing.
"""
import csv
import hashlib
import io
import re
from datetime import datetime
from typing import Optional

from ..utils.currency import parse_indian_number


# Common date formats in Indian bank statements
DATE_FORMATS = [
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%Y-%m-%d",
    "%d/%m/%y",
    "%d-%m-%y",
    "%d-%b-%Y",
    "%d-%b-%y",
    "%d %b %Y",
    "%d %b %y",
    "%m/%d/%Y",
    "%Y/%m/%d",
]

# Keywords for auto-detecting column types
DATE_KEYWORDS = ["date", "txn date", "transaction date", "value date", "posting date"]
DESC_KEYWORDS = [
    "description",
    "narration",
    "particulars",
    "details",
    "remarks",
    "transaction details",
    "merchant",
]
AMOUNT_KEYWORDS = [
    "amount",
    "debit",
    "credit",
    "withdrawal",
    "deposit",
    "dr",
    "cr",
    "debit amount",
    "credit amount",
]
TYPE_KEYWORDS = ["type", "transaction type", "txn type", "dr/cr", "dr./cr."]
DEBIT_KEYWORDS = ["debit", "debit amount", "withdrawal", "dr", "debit amt"]
CREDIT_KEYWORDS = ["credit", "credit amount", "deposit", "cr", "credit amt"]


def parse_date(date_str: str) -> Optional[datetime]:
    """Try multiple date formats to parse a date string."""
    date_str = date_str.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def detect_columns(headers: list[str]) -> dict:
    """
    Auto-detect CSV column mapping based on header names.
    Returns dict with keys: date_col, desc_col, amount_col, type_col,
    debit_col, credit_col (for split amount columns).
    """
    headers_lower = [h.strip().lower() for h in headers]
    mapping = {
        "date_col": None,
        "desc_col": None,
        "amount_col": None,
        "type_col": None,
        "debit_col": None,
        "credit_col": None,
    }

    for i, h in enumerate(headers_lower):
        if mapping["date_col"] is None and any(k in h for k in DATE_KEYWORDS):
            mapping["date_col"] = i
        elif mapping["desc_col"] is None and any(k in h for k in DESC_KEYWORDS):
            mapping["desc_col"] = i
        elif mapping["type_col"] is None and any(k == h for k in TYPE_KEYWORDS):
            mapping["type_col"] = i

    # Check for split debit/credit columns
    for i, h in enumerate(headers_lower):
        if any(k == h for k in DEBIT_KEYWORDS):
            mapping["debit_col"] = i
        if any(k == h for k in CREDIT_KEYWORDS):
            mapping["credit_col"] = i

    # Single amount column
    already_assigned = {mapping["date_col"], mapping["desc_col"], mapping["type_col"]}
    if mapping["debit_col"] is None and mapping["credit_col"] is None:
        for i, h in enumerate(headers_lower):
            if i in already_assigned:
                continue
            # Match exact or substring for multi-char words, exact for cr/dr
            matched = False
            for k in AMOUNT_KEYWORDS:
                if len(k) <= 2:
                    if k == h:
                        matched = True
                        break
                elif k in h:
                    matched = True
                    break
            if matched:
                mapping["amount_col"] = i
                break

    return mapping


def clean_description(desc: str) -> str:
    """
    Clean merchant name from UPI/NEFT/IMPS descriptions.
    E.g., 'UPI-SWIGGY-BUNDL TECHNOLOGIES-123456@okaxis' -> 'SWIGGY'
    """
    desc_upper = desc.upper().strip()

    # Remove UPI prefix and extract merchant
    upi_match = re.match(r"(?:UPI[-/])?([A-Z0-9]+)[-/]", desc_upper)
    if upi_match:
        merchant = upi_match.group(1)
        # Skip common prefixes that aren't merchant names
        skip_words = {"UPI", "NEFT", "IMPS", "RTGS", "ACH", "ATM", "POS", "BIL"}
        if merchant not in skip_words:
            return merchant.title()

    # Remove common prefixes
    for prefix in ["UPI-", "NEFT-", "IMPS-", "POS-", "ATM-", "BIL-", "ACH-"]:
        if desc_upper.startswith(prefix):
            rest = desc[len(prefix):]
            # Get first segment
            parts = re.split(r"[-/]", rest)
            if parts:
                return parts[0].strip().title()

    # Just clean up and titlecase
    cleaned = re.sub(r"\s+", " ", desc).strip()
    # Truncate long descriptions
    if len(cleaned) > 50:
        cleaned = cleaned[:50]
    return cleaned.title() if cleaned else desc


def compute_row_hash(date_str: str, description: str, amount: float, txn_type: str) -> str:
    """Compute SHA256 hash for deduplication."""
    raw = f"{date_str}_{description.strip().lower()}_{amount}_{txn_type}"
    return hashlib.sha256(raw.encode()).hexdigest()


def compute_file_hash(content: bytes) -> str:
    """Compute SHA256 hash of file content."""
    return hashlib.sha256(content).hexdigest()


def preview_csv(file_content: bytes) -> dict:
    """
    Parse CSV and return auto-detected columns + first 5 preview rows.
    """
    text = file_content.decode("utf-8-sig")  # Handle BOM
    reader = csv.reader(io.StringIO(text))

    rows = list(reader)
    if not rows:
        return {"error": "Empty CSV file", "headers": [], "rows": [], "mapping": {}}

    headers = [h.strip() for h in rows[0]]
    mapping = detect_columns(headers)

    preview_rows = []
    for row in rows[1:6]:  # First 5 data rows
        preview_rows.append(row)

    return {
        "headers": headers,
        "rows": preview_rows,
        "mapping": mapping,
        "total_rows": len(rows) - 1,
    }


def parse_csv_rows(
    file_content: bytes,
    date_col: int,
    desc_col: int,
    amount_col: Optional[int],
    type_col: Optional[int],
    debit_col: Optional[int] = None,
    credit_col: Optional[int] = None,
) -> list[dict]:
    """
    Parse all CSV rows into transaction dictionaries.
    Handles both single-amount and split debit/credit column formats.
    """
    text = file_content.decode("utf-8-sig")
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    if len(rows) < 2:
        return []

    file_hash = compute_file_hash(file_content)
    transactions = []

    for row in rows[1:]:
        try:
            if len(row) <= max(
                filter(None, [date_col, desc_col, amount_col, type_col, debit_col, credit_col]),
                default=0,
            ):
                continue

            # Parse date
            date_val = parse_date(row[date_col])
            if date_val is None:
                continue

            # Parse description
            description = row[desc_col].strip()
            if not description:
                continue

            # Determine amount and type
            if debit_col is not None and credit_col is not None:
                # Split columns format
                debit_str = row[debit_col].strip()
                credit_str = row[credit_col].strip()

                debit_amt = parse_indian_number(debit_str) if debit_str else 0
                credit_amt = parse_indian_number(credit_str) if credit_str else 0

                if debit_amt > 0:
                    amount = debit_amt
                    txn_type = "debit"
                elif credit_amt > 0:
                    amount = credit_amt
                    txn_type = "credit"
                else:
                    continue
            else:
                # Single amount column
                amount = parse_indian_number(row[amount_col])
                if amount == 0:
                    continue

                # Determine type
                if type_col is not None:
                    type_str = row[type_col].strip().lower()
                    txn_type = "credit" if type_str in ("cr", "credit", "c") else "debit"
                else:
                    txn_type = "credit" if amount > 0 else "debit"
                    amount = abs(amount)

            cleaned = clean_description(description)
            row_hash = compute_row_hash(
                date_val.isoformat(), description, amount, txn_type
            )

            transactions.append(
                {
                    "date": date_val,
                    "description": description,
                    "clean_description": cleaned,
                    "amount": round(amount, 2),
                    "type": txn_type,
                    "file_hash": file_hash,
                    "row_hash": row_hash,
                }
            )
        except (IndexError, ValueError):
            continue

    return transactions
