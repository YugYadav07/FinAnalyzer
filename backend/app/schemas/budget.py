from pydantic import BaseModel
from typing import Optional


class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float
    month_year: str  # 'YYYY-MM'


class BudgetResponse(BaseModel):
    id: int
    category: str
    monthly_limit: float
    month_year: str
    spent: Optional[float] = 0.0
    percentage: Optional[float] = 0.0
    status: Optional[str] = "green"  # green, yellow, red

    class Config:
        from_attributes = True
