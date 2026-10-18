"""Tests for spending forecast service."""
import pytest
from app.services.forecast import weighted_moving_average, linear_regression_forecast


class TestWeightedMovingAverage:
    def test_single_value(self):
        assert weighted_moving_average([1000]) == 1000.0

    def test_two_values(self):
        result = weighted_moving_average([1000, 2000])
        assert result == pytest.approx(1600.0)  # 2000*0.6 + 1000*0.4

    def test_three_values(self):
        result = weighted_moving_average([1000, 2000, 3000])
        # 1000*0.2 + 2000*0.3 + 3000*0.5 = 200 + 600 + 1500 = 2300
        assert result == pytest.approx(2300.0)

    def test_empty_list(self):
        assert weighted_moving_average([]) == 0.0


class TestLinearRegressionForecast:
    def test_increasing_trend(self):
        values = [1000, 2000, 3000, 4000, 5000]
        forecast, confidence = linear_regression_forecast(values)
        assert forecast > 5000  # Should predict higher
        assert confidence > 0.9  # High confidence for linear data

    def test_flat_trend(self):
        values = [5000, 5000, 5000, 5000]
        forecast, confidence = linear_regression_forecast(values)
        assert forecast == pytest.approx(5000, abs=100)

    def test_single_value(self):
        values = [5000]
        forecast, confidence = linear_regression_forecast(values)
        assert forecast == 5000.0

    def test_non_negative_prediction(self):
        values = [5000, 4000, 3000, 2000, 1000]
        forecast, _ = linear_regression_forecast(values)
        assert forecast >= 0  # Clamped to non-negative
