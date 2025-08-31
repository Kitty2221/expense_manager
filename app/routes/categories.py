from fastapi import APIRouter, HTTPException, status

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.category import Category

categories_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@categories_router.get("/all")
async def get_all_categories():
    return await mongo_client.get_many_records(collection="categories", projection={"_id": False})


@categories_router.get("/{name}")
async def get_categories_by_name(name):
    category = await mongo_client.get_one_record(
        collection="categories",
        find_obj={"name": {"$regex": f"^{name}$", "$options": "i"}}
    )
    if category:
        category["_id"] = str(category["_id"])
        return category
    raise HTTPException(status_code=404, detail=f"Category {name} not found")


@categories_router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_new_category(category: Category):
    try:
        response = await mongo_client.insert_one(collection="categories", data=category.dict())
        return {"message": "New category added successfully", "id": str(response.inserted_id)}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to add category: {error}")
