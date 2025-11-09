from typing import List

from fastapi import APIRouter, HTTPException, status

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.income_source import IncomeSource, IncomeSourceCreate

from bson import ObjectId

incomes_sources_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@incomes_sources_router.get("/all", response_model=List[IncomeSource])
async def get_all_income_source():
    return await mongo_client.get_many_records(collection="income_source")


@incomes_sources_router.post("/add", status_code=status.HTTP_201_CREATED, response_model=IncomeSource)
async def add_new_income_source(category: IncomeSourceCreate):
    try:
        response = await mongo_client.insert_one(collection="income_source", data=category.dict())
        return IncomeSource(**category.model_dump(), _id=response.inserted_id)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to add income source: {error}")


@incomes_sources_router.delete("/{income_source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income_source(income_source_id: str):
    if not ObjectId.is_valid(income_source_id):
        raise HTTPException(status_code=400, detail="Invalid source income id")

    response = await mongo_client.delete_one("income_source", {"_id": ObjectId(income_source_id)})
    if response.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income source not found")

    return {"message": "Income source deleted successfully", "id": income_source_id}
