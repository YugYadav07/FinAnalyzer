"""
Categories Router - List categories and manage rules.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.category import Category, DEFAULT_CATEGORIES
from ..models.rule import CategoryRule
from ..schemas.category import CategoryResponse
from ..schemas.rule import RuleCreate, RuleResponse

router = APIRouter(prefix="/api", tags=["Categories & Rules"])


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """List all categories. Seed defaults if empty."""
    categories = db.query(Category).all()
    if not categories:
        for name in DEFAULT_CATEGORIES:
            db.add(Category(name=name))
        db.commit()
        categories = db.query(Category).all()
    return categories


@router.get("/rules", response_model=list[RuleResponse])
def list_rules(db: Session = Depends(get_db)):
    """List all categorization rules."""
    return (
        db.query(CategoryRule)
        .order_by(CategoryRule.is_custom.desc(), CategoryRule.priority.desc())
        .all()
    )


@router.post("/rules", response_model=RuleResponse)
def create_rule(rule: RuleCreate, db: Session = Depends(get_db)):
    """Add a custom keyword categorization rule."""
    existing = (
        db.query(CategoryRule)
        .filter(CategoryRule.keyword == rule.keyword.lower())
        .first()
    )
    if existing:
        existing.category = rule.category
        existing.priority = rule.priority
        existing.is_custom = True
        db.commit()
        db.refresh(existing)
        return existing

    new_rule = CategoryRule(
        keyword=rule.keyword.lower(),
        category=rule.category,
        priority=rule.priority,
        is_custom=True,
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule


@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    """Delete a custom categorization rule."""
    rule = db.query(CategoryRule).filter(CategoryRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    if not rule.is_custom:
        raise HTTPException(status_code=400, detail="Cannot delete default rules")

    db.delete(rule)
    db.commit()
    return {"message": "Rule deleted successfully"}
