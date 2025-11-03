from typing import List

from fastapi import APIRouter, HTTPException

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.income import Income

incomes_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@incomes_router.get("/all", response_model=List[Income])
async def get_all_incomes():
    return await mongo_client.get_many_records(collection="incomes")


@incomes_router.get("/{source}", response_model=List[Income])
async def get_incomes_by_source(source: str):
    incomes = await mongo_client.get_many_records(
        collection="incomes",
        find_obj={"source": {"$regex": f"^{source}$", "$options": "i"}}
    )
    if not incomes:
        raise HTTPException(status_code=404, detail=f"No incomes found for source: {source}")
    return incomes


@incomes_router.post("/add", response_model=Income, status_code=201)
async def add_new_income(income: Income):
    try:
        income_data = income.model_dump()
        response = await mongo_client.insert_one(collection="incomes", data=income_data)
        return Income(**income_data, id=str(response.inserted_id))
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to add income: {error}")
