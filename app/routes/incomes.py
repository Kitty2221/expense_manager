from typing import List
from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from loguru import logger

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.income import Income, IncomeCreate

incomes_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@incomes_router.get("/all", response_model=List[Income])
async def get_all_incomes():
    logger.info("Fetching all incomes")
    return await mongo_client.get_many_records(collection="incomes")


@incomes_router.get("/{source}", response_model=List[Income])
async def get_incomes_by_source(source: str):
    logger.info("Fetching incomes by source: {}", source)
    income_source = await mongo_client.get_one_record(
        collection="income_source",
        find_obj={"source": {"$regex": f"^{source}$", "$options": "i"}}
    )
    if not income_source:
        logger.warning("Income source not found: {}", source)
        raise HTTPException(status_code=404, detail=f"No incomes found for source: {source}")

    incomes = await mongo_client.get_many_records(
        collection="incomes",
        find_obj={"income_source._id": ObjectId(income_source["_id"])},
    )
    logger.info("Fetched {} incomes for source {}", len(incomes), source)
    return incomes


@incomes_router.post("/add", response_model=Income, status_code=status.HTTP_201_CREATED)
async def add_new_income(income: IncomeCreate):
    logger.info("Adding new income: {}", income.source_name)
    income_source = await mongo_client.get_one_record(
        collection="income_source",
        find_obj={"name": {"$regex": f"^{income.source_name}$", "$options": "i"}}
    )
    if not income_source:
        logger.warning("Income source not found: {}", income.source_name)
        raise HTTPException(status_code=404, detail=f"Income source {income.source_name} not found")

    income_dict = income.model_dump()
    income_dict["source"] = income_source
    income_dict.pop("source_name")
    try:
        response = await mongo_client.insert_one(
            collection="incomes",
            data=income_dict
        )
        logger.info(
            "Income added successfully: {} (id={})",
            income.source_name,
            response.inserted_id
        )
        return Income(**income_dict, id=str(response.inserted_id))
    except Exception:
        logger.exception(
            "Failed to add income: {} | payload={}",
            income.source_name,
            income_dict
        )
        raise HTTPException(status_code=500, detail="Failed to add income")


@incomes_router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(income_id: str):
    logger.info("Deleting income with id={}", income_id)

    if not ObjectId.is_valid(income_id):
        logger.warning("Invalid income id: {}", income_id)
        raise HTTPException(status_code=400, detail="Invalid income id")

    response = await mongo_client.delete_one("incomes", {"_id": ObjectId(income_id)})

    if response.deleted_count == 0:
        logger.warning("Income not found for deletion: {}", income_id)
        raise HTTPException(status_code=404, detail="Income not found")

    logger.info("Income deleted successfully: {}", income_id)
    return {"message": "Income deleted successfully", "id": income_id}