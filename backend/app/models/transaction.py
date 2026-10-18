from sqlalchemy import Column, Integer, String, Float, Date, Boolean, DateTime, Index
from sqlalchemy.sql import func
from ..database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    description = Column(String, nullable=False)
    clean_description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # 'credit' or 'debit'
    category = Column(String, nullable=True, default="Other")
    is_recurring = Column(Boolean, default=False)
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(String, nullable=True)
    file_hash = Column(String, nullable=True)
    row_hash = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_transactions_category", "category"),
        Index("ix_transactions_type", "type"),
        Index("ix_transactions_row_hash", "row_hash"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.isoformat() if self.date else None,
            "description": self.description,
            "clean_description": self.clean_description,
            "amount": self.amount,
            "type": self.type,
            "category": self.category,
            "is_recurring": self.is_recurring,
            "is_anomaly": self.is_anomaly,
            "anomaly_reason": self.anomaly_reason,
            "file_hash": self.file_hash,
            "row_hash": self.row_hash,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
