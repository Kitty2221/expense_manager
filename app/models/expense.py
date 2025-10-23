from datetime import datetime

from pydantic import BaseModel

from app.models.category import Category


class ExpenseCreate(BaseModel):
    date: datetime
    amount: float
    comment: str
    category_name: str


class Expense(BaseModel):
    date: datetime
    amount: float
    comment: str
    category: Category
