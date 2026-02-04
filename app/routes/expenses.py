from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from loguru import logger

from app.db.mongo_client import ExpenseManagerMongoClient
from app.models.expense import Expense, ExpenseCreate

expenses_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()


@expenses_router.get("/all", response_model=List[Expense])
async def get_all_expenses():
    logger.info("Fetching all expenses")
    return await mongo_client.get_many_records(collection="expenses")


@expenses_router.get("/category/{category_name}", response_model=List[Expense])
async def get_expenses_by_category(category_name: str):
    logger.info("Fetching expenses by category: {}", category_name)

    category = await mongo_client.get_one_record(
        collection="categories",
        find_obj={"name": {"$regex": f"^{category_name}$", "$options": "i"}},
    )

    if not category:
        logger.warning("Category not found while fetching expenses: {}", category_name)
        raise HTTPException(
            status_code=404,
            detail=f"Category {category_name} not found",
        )

    expenses = await mongo_client.get_many_records(
        collection="expenses",
        find_obj={"category._id": ObjectId(category["_id"])},
    )

    logger.info(
        "Fetched {} expenses for category {}",
        len(expenses),
        category_name,
    )
    return expenses


@expenses_router.post("/add", status_code=status.HTTP_201_CREATED, response_model=Expense)
async def add_new_expense(expense: ExpenseCreate):
    logger.info(
        "Adding new expense: category={}, amount={}",
        expense.category_name,
        expense.amount,
    )

    category = await mongo_client.get_one_record(
        collection="categories",
        find_obj={"name": {"$regex": f"^{expense.category_name}$", "$options": "i"}},
    )

    if not category:
        logger.warning(
            "Category not found while adding expense: {}",
            expense.category_name,
        )
        raise HTTPException(
            status_code=404,
            detail=f"Category {expense.category_name} not found",
        )

    expense_dict = expense.model_dump()
    expense_dict["category"] = category
    expense_dict.pop("category_name")

    try:
        response = await mongo_client.insert_one(
            collection="expenses",
            data=expense_dict,
        )

        logger.info(
            "Expense added successfully: id={}, category={}, amount={}",
            response.inserted_id,
            category["name"],
            expense_dict.get("amount"),
        )

        return Expense(**expense_dict, id=str(response.inserted_id))

    except Exception:
        logger.exception(
            "Failed to add expense: category={}, payload={}",
            expense.category_name,
            expense.model_dump(),
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to add expense",
        )


@expenses_router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: str):
    logger.info("Deleting expense with id={}", expense_id)

    if not ObjectId.is_valid(expense_id):
        logger.warning("Invalid expense id received: {}", expense_id)
        raise HTTPException(status_code=400, detail="Invalid expense id")

    response = await mongo_client.delete_one(
        "expenses",
        {"_id": ObjectId(expense_id)},
    )

    if response.deleted_count == 0:
        logger.warning("Expense not found for deletion: {}", expense_id)
        raise HTTPException(status_code=404, detail="Expense not found")

    logger.info("Expense deleted successfully: {}", expense_id)
    return {"message": "Expense deleted successfully", "id": expense_id}