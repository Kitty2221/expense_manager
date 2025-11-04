from datetime import datetime
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from app.models.category import Category


class ExpenseCreate(BaseModel):
    date: datetime
    amount: float
    comment: str
    category_name: str


class Expense(BaseModel):
    id: Optional[str] = Field(alias="_id", default_factory=lambda: str(ObjectId()))
    date: datetime
    amount: float
    comment: str
    category: Category

    def __init__(self, *args, **kwargs):
        kwargs["_id"] = str(kwargs["_id"])
        super().__init__(*args, **kwargs)

