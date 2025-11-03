from typing import List

from fastapi import APIRouter, HTTPException, status

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.income_source import IncomeSource, IncomeSourceCreate

incomes_sources_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@incomes_sources_router.get("/all", response_model=List[IncomeSource])
async def get_all_categories():
    return await mongo_client.get_many_records(collection="income_source")


@incomes_sources_router.post("/add", status_code=status.HTTP_201_CREATED, response_model=IncomeSource)
async def add_new_category(category: IncomeSourceCreate):
    try:
        response = await mongo_client.insert_one(collection="income_source", data=category.dict())
        return IncomeSource(**category.model_dump(), _id=response.inserted_id)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to add income source: {error}")
