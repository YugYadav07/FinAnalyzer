from sqlalchemy import Column, Integer, String, Float, UniqueConstraint
from ..database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String, nullable=False)
    monthly_limit = Column(Float, nullable=False)
    month_year = Column(String, nullable=False)  # 'YYYY-MM' format

    __table_args__ = (
        UniqueConstraint("category", "month_year", name="uq_budget_category_month"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "monthly_limit": self.monthly_limit,
            "month_year": self.month_year,
        }
