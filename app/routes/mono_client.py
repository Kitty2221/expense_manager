import monobank
import datetime

import os
from dotenv import load_dotenv

from fastapi import APIRouter, HTTPException, status

from app.db.mongo_client import ExpenseManagerMongoClient

from app.utils.utils import get_category_from_mcc

expenses_mono_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()

load_dotenv()
mono_client = monobank.Client(os.environ.get("MONO_API_TOKEN"))


def fetch_transactions(days):
    today = datetime.datetime.now()
    start = today - datetime.timedelta(days=days)

    accounts = mono_client.get_client_info()["accounts"]
    print(accounts)
    account_id = accounts[2]["id"]
    print(account_id)

    return mono_client.get_statements("iyHAALcQj20XvTp6-XvjGw", start, today)

@expenses_mono_router.post("/mono/import")
async def import_transactions():
    raw_data = fetch_transactions(25)

    for transaction in raw_data:
        raw_amount = transaction["amount"] / 100
        date = datetime.datetime.fromtimestamp(transaction["time"])
        description = transaction.get("description", "")
        mcc = transaction.get("mcc", 0)
        category_from_mcc = get_category_from_mcc(mcc)

        category = await mongo_client.get_one_record(
            "categories",
            {"name": {"$regex": f"^{category_from_mcc}$", "$options": "i"}}
        )

        if not category:
            insert_cat = await mongo_client.insert_one(
                "categories", {"name": category_from_mcc}
            )
            category = {"_id": insert_cat.inserted_id, "name": category_from_mcc}


        if raw_amount < 0:
            expense_dict = {
                "amount": abs(raw_amount),
                "date": date,
                "comment": description,
                "category": category,
            }
            await mongo_client.insert_one("expenses", expense_dict)


        else:
            income_source = await mongo_client.get_one_record(
                "income_source",
                {"name": {"$regex": "^present$", "$options": "i"}}
            )

            if not income_source:
                insert_src = await mongo_client.insert_one(
                    "income_source", {"name": "present"}
                )
                income_source = {"_id": insert_src.inserted_id, "name": "present"}

            incomes_dict = {
                "amount": raw_amount,
                "date": date,
                "source": income_source,
            }
            await mongo_client.insert_one("incomes", incomes_dict)
