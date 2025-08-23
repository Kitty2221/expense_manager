from fastapi import APIRouter, HTTPException

from app.models.category import Category

categories_router = APIRouter()

test_categories = [
    Category(id="1", name="Food"),
    Category(id="2", name="Transport"),
]


@categories_router.get("/categories/all")
async def get_all_categories():
    return test_categories


@categories_router.get("/categories/{name}")
async def get_categories_by_name(name):
    for category in test_categories:
        if category.name.lower() == name.lower():
            return category

    raise HTTPException(status_code=404, detail=f"Category {name} not found")
