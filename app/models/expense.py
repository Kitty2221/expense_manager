from datetime import date

from pydantic import BaseModel

from app.models.category import Category


class Expense(BaseModel):
    date: date
    amount: float
    comment: str
    category: Category
