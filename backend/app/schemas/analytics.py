from pydantic import BaseModel
from typing import Optional


class SummaryResponse(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    savings_rate: float  # percentage


class ChartDataPoint(BaseModel):
    label: str
    income: Optional[float] = 0.0
    expense: Optional[float] = 0.0
    value: Optional[float] = 0.0


class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    color: Optional[str] = None


class TopMerchant(BaseModel):
    merchant: str
    total: float
    count: int


class ChartsResponse(BaseModel):
    monthly_trend: list[ChartDataPoint]
    category_breakdown: list[CategoryBreakdown]
    top_merchants: list[TopMerchant]


class RecurringItem(BaseModel):
    merchant: str
    category: str
    avg_amount: float
    frequency: str  # 'Monthly', 'Weekly'
    last_date: str
    next_expected: str
    count: int


class AnomalyItem(BaseModel):
    id: int
    date: str
    description: str
    amount: float
    category: str
    reason: str


class ForecastItem(BaseModel):
    category: str
    current_month: float
    forecasted: float
    change_pct: float
    confidence: float


class ForecastResponse(BaseModel):
    total_forecasted: float
    breakdown: list[ForecastItem]


class InsightCard(BaseModel):
    title: str
    message: str
    type: str  # 'info', 'warning', 'success', 'danger'
    icon: Optional[str] = None
