from sqlalchemy import Column, Integer, String
from ..database import Base

# Default categories for Indian personal finance
DEFAULT_CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Rent",
    "Entertainment",
    "Health",
    "Education",
    "Income",
    "Transfers",
    "Other",
]


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name}
