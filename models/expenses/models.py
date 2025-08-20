from datetime import date

from pydantic import BaseModel

from models.categories.models import Category


class Expense(BaseModel):
    date: date
    amount: float
    comment: str | None = None
    category: Category
