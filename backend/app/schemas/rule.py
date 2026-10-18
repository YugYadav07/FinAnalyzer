from pydantic import BaseModel
from typing import Optional


class RuleCreate(BaseModel):
    keyword: str
    category: str
    priority: Optional[int] = 1


class RuleResponse(BaseModel):
    id: int
    keyword: str
    category: str
    priority: int
    is_custom: bool

    class Config:
        from_attributes = True
