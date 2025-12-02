from fastapi import Request
import monobank
import datetime
import requests

import os
from dotenv import load_dotenv

from fastapi import APIRouter

from app.db.mongo_client import ExpenseManagerMongoClient

from app.utils.utils import get_category_from_mcc, internal_transfer

expenses_mono_router = APIRouter()
mongo_client = ExpenseManagerMongoClient()

load_dotenv()
mono_client = monobank.Client(os.environ.get("MONO_API_TOKEN"))
url = os.environ.get("URL")


def fetch_transactions(days):
    today = datetime.datetime.now()
    start = today - datetime.timedelta(days=days)

    # TODO: think about getting account id
    accounts = mono_client.get_client_info()["accounts"]
    print(accounts)
    account_id = accounts[2]["id"]

    return mono_client.get_statements("iyHAALcQj20XvTp6-XvjGw", start, today)


async def is_duplicate_expense(date, amount, description):
    return await mongo_client.get_one_record(
        "expenses",
        {"date": date, "amount": amount, "comment": description}
    )


async def is_duplicate_income(date, amount):
    return await mongo_client.get_one_record(
        "incomes",
        {"date": date, "amount": amount}
    )


@expenses_mono_router.post("/import")
async def import_transactions():
    inserted_exp = 0
    inserted_inc = 0
    skipped_dupes = 0
    skipped_transfers = 0

    raw_data = fetch_transactions(1)
    for transaction in raw_data:
        description = transaction.get("description", "")
        raw_amount = transaction["amount"] / 100
        date = datetime.datetime.fromtimestamp(transaction["time"])
        mcc = transaction.get("mcc", 0)
        category_from_mcc = get_category_from_mcc(mcc)

        if raw_amount < 0:
            if any(keyword in description for keyword in internal_transfer):
                print("kkk")
                skipped_transfers += 1
                continue
            amount = abs(raw_amount)
            category = await mongo_client.get_one_record(
                "categories",
                {"name": {"$regex": f"^{category_from_mcc}$", "$options": "i"}}
            )

            if not category:
                insert_cat = await mongo_client.insert_one(
                    "categories", {"name": category_from_mcc}
                )
                category = {"_id": insert_cat.inserted_id, "name": category_from_mcc}

            if await is_duplicate_expense(date, amount, description):
                skipped_dupes += 1
                continue

            expense_dict = {
                "amount": amount,
                "date": date,
                "comment": description,
                "category": category,
            }
            await mongo_client.insert_one("expenses", expense_dict)
            inserted_exp += 1
            continue

        else:
            amount = raw_amount

            # TODO: remove this
            if transaction.get("counterName", None) == "Holub Kateryna":
                source_name = "Salary"
            else:
                source_name = "Present"

            source = await mongo_client.get_one_record(
                "income_source",
                {"name": {"$regex": f"^{source_name}$", "$options": "i"}}
            )

            if not source:
                new_src = await mongo_client.insert_one(
                    "income_source", {"name": source_name}
                )
                source = {"_id": new_src.inserted_id, "name": source_name}

            if await is_duplicate_income(date, amount):
                skipped_dupes += 1
                continue

            income_doc = {
                "amount": amount,
                "date": date,
                "source": source,
            }

            await mongo_client.insert_one("incomes", income_doc)
            inserted_inc += 1

    return {
        "inserted_expenses": inserted_exp,
        "inserted_incomes": inserted_inc,
        "skipped_duplicates": skipped_dupes,
        "skipped_transfers": skipped_transfers,
        "total_received": len(raw_data),
    }

@expenses_mono_router.post("/webhook")
async def post_test_webhook(body: dict):
    print(f"Webhook received{body}")
    return {"status": "ok"}

@expenses_mono_router.get("/webhook")
async def get_test_webhook(request: Request):
    print(f"Webhook received aaaaaaaaaaaaaaaaaaaaaa")

@expenses_mono_router.post("/set-webhook")
async def set_webhook():
    reg_webhook = requests.post(
        url,
        headers={"X-Token": os.getenv("MONO_API_TOKEN")},
        json={"webHookUrl": url}
    )

    return {"status": reg_webhook.status_code, "response": reg_webhook.text}
