from datetime import date

from fastapi import APIRouter

from app.models.category import Category
from app.models.expense import Expense

expenses_router = APIRouter()

test_expenses = [
    Expense(date=date.today(), amount=30.5, comment="Tea",
            category=Category(id="1", name="Food")),
    Expense(date=date.today(), amount=22, comment="Milk",
            category=Category(id="2", name="Food")),
]


@expenses_router.get("/expenses/all")
async def get_all_expenses():
    return test_expenses


@expenses_router.get("/expenses/{category_name}")
async def get_expenses_by_category(category_name):
    return [
        expenses if category_name.lower() == expenses.category.name.lower()
        else None for expenses in test_expenses
    ]
