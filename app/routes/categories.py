from typing import List

from fastapi import APIRouter, HTTPException, status

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.category import Category, CategoryCreate

categories_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@categories_router.get("/all", response_model=List[Category])
async def get_all_categories():
    return await mongo_client.get_many_records(collection="categories")


@categories_router.get("/{name}")
async def get_categories_by_name(name: str):
    category = await mongo_client.get_one_record(
        collection="categories",
        find_obj={"name": {"$regex": f"^{name}$", "$options": "i"}}
    )
    if not category:
        raise HTTPException(status_code=404, detail=f"Category {name} not found")
    return category


@categories_router.post("/add", status_code=status.HTTP_201_CREATED, response_model=Category)
async def add_new_category(category: CategoryCreate):
    try:
        response = await mongo_client.insert_one(collection="categories", data=category.dict())
        return Category(**category.model_dump(), _id=response.inserted_id)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to add category: {error}")
