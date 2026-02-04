from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from loguru import logger

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.category import Category, CategoryCreate

categories_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@categories_router.get("/all", response_model=List[Category])
async def get_all_categories():
    logger.info("Fetching all categories")
    return await mongo_client.get_many_records(collection="categories")


@categories_router.get("/{name}")
async def get_categories_by_name(name: str):
    logger.info("Fetching category by name: {}", name)

    category = await mongo_client.get_one_record(
        collection="categories",
        find_obj={"name": {"$regex": f"^{name}$", "$options": "i"}}
    )

    if not category:
        logger.warning("Category not found: {}", name)
        raise HTTPException(status_code=404, detail=f"Category {name} not found")

    logger.info("Category found: {}", name)
    return category


@categories_router.post("/add", status_code=status.HTTP_201_CREATED, response_model=Category)
async def add_new_category(category: CategoryCreate):
    logger.info("Adding new category: {}", category.name)

    try:
        response = await mongo_client.insert_one(
            collection="categories",
            data=category.dict(),
        )

        logger.info(
            "Category added successfully: {} (id={})",
            category.name,
            response.inserted_id,
        )

        return Category(**category.model_dump(), _id=response.inserted_id)

    except Exception :
        logger.exception(
            "Failed to add category: {} | payload={}",
            category.name,
            category.model_dump(),
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to add category",
        )


@categories_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str):
    logger.info("Deleting category with id={}", category_id)

    if not ObjectId.is_valid(category_id):
        logger.warning("Invalid category id received: {}", category_id)
        raise HTTPException(status_code=400, detail="Invalid category id")

    response = await mongo_client.delete_one(
        "categories",
        {"_id": ObjectId(category_id)},
    )

    if response.deleted_count == 0:
        logger.warning("Category not found for deletion: {}", category_id)
        raise HTTPException(status_code=404, detail="Category not found")

    logger.info("Category deleted successfully: {}", category_id)
    return {"message": "Category deleted successfully", "id": category_id}