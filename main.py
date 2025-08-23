import uvicorn
from fastapi import FastAPI

from app.routes.categories import categories_router
from app.routes.expenses import expenses_router
from app.routes.incomes import incomes_router

app = FastAPI()
app.include_router(categories_router)
app.include_router(expenses_router)
app.include_router(incomes_router)


if __name__ == "__main__":
    uvicorn.run(
        app=app,
        host="127.0.0.1",
        port=8080,
    )
