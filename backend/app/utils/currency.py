"""Indian currency utilities for parsing and formatting."""
import re


def parse_indian_number(value: str) -> float:
    """
    Parse Indian-formatted currency strings to float.
    Handles formats like: ₹1,23,456.50, 1,23,456.50, Rs. 1,23,456, etc.
    """
    if isinstance(value, (int, float)):
        return float(value)

    s = str(value).strip()

    # Remove currency symbols and common prefixes
    s = re.sub(r"[₹$]", "", s)
    s = re.sub(r"(?i)^rs\.?\s*", "", s)
    s = re.sub(r"(?i)^inr\s*", "", s)

    # Remove whitespace
    s = s.strip()

    # Handle parentheses indicating negative (accounting format)
    negative = False
    if s.startswith("(") and s.endswith(")"):
        negative = True
        s = s[1:-1]

    # Handle explicit negative sign
    if s.startswith("-"):
        negative = True
        s = s[1:]

    # Handle Dr/Cr suffixes
    if s.upper().endswith("DR"):
        s = s[:-2].strip()
    elif s.upper().endswith("CR"):
        s = s[:-2].strip()

    # Remove all commas (works for both Indian and Western formatting)
    s = s.replace(",", "")

    # Remove any remaining whitespace
    s = s.strip()

    if not s:
        return 0.0

    try:
        result = float(s)
        return -result if negative else result
    except ValueError:
        return 0.0


def format_inr(amount: float) -> str:
    """Format a number as Indian currency string: ₹1,23,456.78"""
    if amount < 0:
        return f"-₹{format_inr_positive(abs(amount))}"
    return f"₹{format_inr_positive(amount)}"


def format_inr_positive(amount: float) -> str:
    """Format a positive number in Indian grouping: 1,23,456.78"""
    integer_part = int(amount)
    decimal_part = round(amount - integer_part, 2)

    s = str(integer_part)

    if len(s) <= 3:
        formatted = s
    else:
        # Last 3 digits
        last_three = s[-3:]
        remaining = s[:-3]
        # Group remaining in pairs from right
        groups = []
        while remaining:
            groups.append(remaining[-2:])
            remaining = remaining[:-2]
        groups.reverse()
        formatted = ",".join(groups) + "," + last_three

    if decimal_part > 0:
        decimal_str = f"{decimal_part:.2f}"[1:]  # Remove leading 0
        return formatted + decimal_str
    return formatted + ".00"
