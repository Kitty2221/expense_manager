from typing import List
from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from loguru import logger

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.income_source import IncomeSource, IncomeSourceCreate

incomes_sources_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@incomes_sources_router.get("/all", response_model=List[IncomeSource])
async def get_all_income_source():
    logger.info("Fetching all income sources")
    return await mongo_client.get_many_records(collection="income_source")


@incomes_sources_router.post("/add", status_code=status.HTTP_201_CREATED, response_model=IncomeSource)
async def add_new_income_source(category: IncomeSourceCreate):
    logger.info("Adding new income source: {}", category.name)
    try:
        response = await mongo_client.insert_one(
            collection="income_source",
            data=category.dict()
        )
        logger.info(
            "Income source added successfully: {} (id={})",
            category.name,
            response.inserted_id
        )
        return IncomeSource(**category.model_dump(), _id=response.inserted_id)
    except Exception:
        logger.exception(
            "Failed to add income source: {} | payload={}",
            category.name,
            category.model_dump()
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to add income source"
        )


@incomes_sources_router.delete("/{income_source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income_source(income_source_id: str):
    logger.info("Deleting income source with id={}", income_source_id)

    if not ObjectId.is_valid(income_source_id):
        logger.warning("Invalid income source id received: {}", income_source_id)
        raise HTTPException(status_code=400, detail="Invalid source income id")

    response = await mongo_client.delete_one(
        "income_source",
        {"_id": ObjectId(income_source_id)}
    )

    if response.deleted_count == 0:
        logger.warning("Income source not found for deletion: {}", income_source_id)
        raise HTTPException(status_code=404, detail="Income source not found")

    logger.info("Income source deleted successfully: {}", income_source_id)
    return {"message": "Income source deleted successfully", "id": income_source_id}