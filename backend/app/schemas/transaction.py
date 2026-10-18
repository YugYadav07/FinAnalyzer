from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class TransactionBase(BaseModel):
    date: date
    description: str
    amount: float
    type: str = Field(..., pattern="^(credit|debit)$")
    category: Optional[str] = "Other"


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    clean_description: Optional[str] = None
    is_recurring: bool = False
    is_anomaly: bool = False
    anomaly_reason: Optional[str] = None
    file_hash: Optional[str] = None
    row_hash: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    transactions: list[TransactionResponse]
