import uvicorn
from fastapi import FastAPI

from app.routes.categories import categories_router
from app.routes.expenses import expenses_router
from app.routes.incomes import incomes_router
from app.routes.income_source import incomes_sources_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.include_router(categories_router, prefix="/categories", tags=["Categories"])
app.include_router(expenses_router, prefix="/expenses", tags=["Expenses"])
app.include_router(incomes_router, prefix="/incomes", tags=["Incomes"])
app.include_router(incomes_sources_router, prefix="/income_sources", tags=["IncomeSource"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run(
        app=app,
        host="127.0.0.1",
        port=8000,
    )
