from datetime import date

from fastapi import APIRouter

from app.models.income import Income

test_incomes = [
    Income(date=date.today(), amount=3000, source="Salary")
]

incomes_router = APIRouter()


@incomes_router.get("/incomes/all")
async def get_all_incomes():
    return test_incomes


@incomes_router.get("/incomes/{source}")
async def get_incomes_by_source(source):
    return [income if source.lower() == income.source.lower() else None for income in test_incomes]
