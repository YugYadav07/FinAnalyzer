"""Tests for CSV parser service."""
import pytest
from datetime import date
from app.services.csv_parser import (
    parse_date,
    detect_columns,
    clean_description,
    compute_row_hash,
    preview_csv,
    parse_csv_rows,
)
from app.utils.currency import parse_indian_number


class TestParseIndianNumber:
    def test_simple_number(self):
        assert parse_indian_number("1000") == 1000.0

    def test_indian_format(self):
        assert parse_indian_number("1,23,456.50") == 123456.50

    def test_with_rupee_symbol(self):
        assert parse_indian_number("₹1,23,456.50") == 123456.50

    def test_with_rs_prefix(self):
        assert parse_indian_number("Rs. 5,000") == 5000.0

    def test_negative_parentheses(self):
        assert parse_indian_number("(500)") == -500.0

    def test_negative_sign(self):
        assert parse_indian_number("-1,500") == -1500.0

    def test_empty_string(self):
        assert parse_indian_number("") == 0.0

    def test_float_passthrough(self):
        assert parse_indian_number(42.5) == 42.5


class TestParseDate:
    def test_dd_mm_yyyy(self):
        assert parse_date("25/12/2025") == date(2025, 12, 25)

    def test_yyyy_mm_dd(self):
        assert parse_date("2025-12-25") == date(2025, 12, 25)

    def test_dd_mmm_yyyy(self):
        assert parse_date("25-Dec-2025") == date(2025, 12, 25)

    def test_invalid_date(self):
        assert parse_date("not-a-date") is None


class TestDetectColumns:
    def test_standard_headers(self):
        headers = ["Date", "Description", "Amount", "Type"]
        result = detect_columns(headers)
        assert result["date_col"] == 0
        assert result["desc_col"] == 1
        assert result["amount_col"] == 2
        assert result["type_col"] == 3

    def test_indian_bank_headers(self):
        headers = ["Txn Date", "Narration", "Debit", "Credit", "Balance"]
        result = detect_columns(headers)
        assert result["date_col"] == 0
        assert result["desc_col"] == 1
        assert result["debit_col"] == 2
        assert result["credit_col"] == 3


class TestCleanDescription:
    def test_upi_merchant(self):
        result = clean_description("UPI-SWIGGY-BUNDL TECHNOLOGIES-123456@okaxis")
        assert result.upper() == "SWIGGY"

    def test_neft_transfer(self):
        result = clean_description("NEFT-SALARY-EMPLOYER CORP")
        assert "Salary" in result or "SALARY" in result.upper()

    def test_simple_description(self):
        result = clean_description("Amazon Purchase")
        assert result == "Amazon Purchase"


class TestComputeRowHash:
    def test_deterministic(self):
        h1 = compute_row_hash("2025-01-01", "test", 100.0, "debit")
        h2 = compute_row_hash("2025-01-01", "test", 100.0, "debit")
        assert h1 == h2

    def test_different_amounts(self):
        h1 = compute_row_hash("2025-01-01", "test", 100.0, "debit")
        h2 = compute_row_hash("2025-01-01", "test", 200.0, "debit")
        assert h1 != h2


class TestPreviewCSV:
    def test_basic_csv(self):
        csv_content = b"Date,Description,Amount,Type\n01/01/2025,Swiggy,500,debit\n02/01/2025,Salary,50000,credit"
        result = preview_csv(csv_content)
        assert len(result["headers"]) == 4
        assert len(result["rows"]) == 2
        assert result["total_rows"] == 2

    def test_empty_csv(self):
        result = preview_csv(b"")
        assert "error" in result


class TestParseCsvRows:
    def test_basic_parsing(self):
        csv_content = b"Date,Description,Amount,Type\n01/01/2025,UPI-SWIGGY,500,debit\n02/01/2025,SALARY,50000,credit"
        rows = parse_csv_rows(csv_content, 0, 1, 2, 3)
        assert len(rows) == 2
        assert rows[0]["amount"] == 500.0
        assert rows[0]["type"] == "debit"
        assert rows[1]["type"] == "credit"

    def test_split_columns(self):
        csv_content = b"Date,Narration,Debit,Credit\n01/01/2025,Swiggy,500,\n02/01/2025,Salary,,50000"
        rows = parse_csv_rows(csv_content, 0, 1, None, None, 2, 3)
        assert len(rows) == 2
        assert rows[0]["type"] == "debit"
        assert rows[1]["type"] == "credit"
