from typing import List

from fastapi import APIRouter, HTTPException, status

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.income import Income, IncomeCreate
from bson import ObjectId

incomes_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@incomes_router.get("/all", response_model=List[Income])
async def get_all_incomes():
    return await mongo_client.get_many_records(collection="incomes")


@incomes_router.get("/{source}", response_model=List[Income])
async def get_incomes_by_source(source: str):
    income_source = await mongo_client.get_one_record(
        collection="income_source",
        find_obj={"source": {"$regex": f"^{source}$", "$options": "i"}}
    )
    if not income_source:
        raise HTTPException(status_code=404, detail=f"No incomes found for source: {source}")

    return await mongo_client.get_many_records(
        collection="incomes",
        find_obj={"income_source._id": ObjectId(income_source["_id"])},
    )


@incomes_router.post("/add", response_model=Income, status_code=status.HTTP_201_CREATED)
async def add_new_income(income: IncomeCreate):
    income_source = await mongo_client.get_one_record(
        collection="income_source",
        find_obj={"name": {"$regex": f"^{income.source_name}$", "$options": "i"}}
    )
    if not income_source:
        raise HTTPException(status_code=404, detail=f"Income source {income.source} not found")

    income_dict = income.model_dump()
    income_dict["source"] = income_source
    income_dict.pop("source_name")
    try:
        response = await mongo_client.insert_one(
            collection="incomes",
            data=income_dict
        )
        return Income(**income_dict, id=str(response.inserted_id))
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to add income: {error}")


@incomes_router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(income_id: str):
    if not ObjectId.is_valid(income_id):
        raise HTTPException(status_code=400, detail="Invalid income id")

    response = await mongo_client.delete_one("incomes", {"_id": ObjectId(income_id)})
    if response.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income not found")

    return {"message": "Income deleted successfully", "id": income_id}
