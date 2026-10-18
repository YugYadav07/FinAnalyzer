from sqlalchemy import Column, Integer, String, Boolean
from ..database import Base


class CategoryRule(Base):
    __tablename__ = "category_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    keyword = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    priority = Column(Integer, default=1)
    is_custom = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "keyword": self.keyword,
            "category": self.category,
            "priority": self.priority,
            "is_custom": self.is_custom,
        }
