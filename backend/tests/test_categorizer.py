"""Tests for categorizer service."""
import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from app.services.categorizer import (
    DEFAULT_RULES,
    categorize_transaction,
    categorize_transactions,
)
from app.models.rule import CategoryRule


def _make_mock_db(rules: list[CategoryRule] = None):
    """Create a mock DB session with pre-loaded rules."""
    if rules is None:
        rules = [
            CategoryRule(id=i, keyword=k, category=v, priority=1, is_custom=False)
            for i, (k, v) in enumerate(DEFAULT_RULES.items())
        ]

    mock_db = MagicMock(spec=Session)
    mock_query = MagicMock()
    mock_query.order_by.return_value = mock_query
    mock_query.all.return_value = rules
    mock_db.query.return_value = mock_query
    return mock_db


class TestDefaultRules:
    def test_has_food_rules(self):
        assert "swiggy" in DEFAULT_RULES
        assert "zomato" in DEFAULT_RULES
        assert DEFAULT_RULES["swiggy"] == "Food"

    def test_has_transport_rules(self):
        assert "uber" in DEFAULT_RULES
        assert "ola" in DEFAULT_RULES
        assert DEFAULT_RULES["uber"] == "Transport"

    def test_has_income_rules(self):
        assert "salary" in DEFAULT_RULES
        assert DEFAULT_RULES["salary"] == "Income"


class TestCategorizeTransaction:
    def test_swiggy_is_food(self):
        db = _make_mock_db()
        result = categorize_transaction("UPI-SWIGGY-BUNDL TECHNOLOGIES", db)
        assert result == "Food"

    def test_uber_is_transport(self):
        db = _make_mock_db()
        result = categorize_transaction("UPI-UBER INDIA SYSTEMS", db)
        assert result == "Transport"

    def test_amazon_is_shopping(self):
        db = _make_mock_db()
        result = categorize_transaction("UPI-AMAZON PAY", db)
        assert result == "Shopping"

    def test_unknown_is_other(self):
        db = _make_mock_db()
        result = categorize_transaction("RANDOM UNKNOWN MERCHANT XYZ", db)
        assert result == "Other"

    def test_salary_is_income(self):
        db = _make_mock_db()
        result = categorize_transaction("NEFT-SALARY-EMPLOYER CORP", db)
        assert result == "Income"


class TestCategorizeTransactions:
    def test_batch_categorization(self):
        db = _make_mock_db()
        txns = [
            {"description": "UPI-SWIGGY", "clean_description": "Swiggy"},
            {"description": "UPI-UBER", "clean_description": "Uber"},
            {"description": "UNKNOWN", "clean_description": "Unknown"},
        ]
        result = categorize_transactions(txns, db)
        assert result[0]["category"] == "Food"
        assert result[1]["category"] == "Transport"
        assert result[2]["category"] == "Other"
