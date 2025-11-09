from datetime import datetime
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from app.models.income_source import IncomeSource


class IncomeCreate(BaseModel):
    date: datetime
    amount: float
    source_name: str


class Income(BaseModel):
    id: Optional[str] = Field(alias="_id", default_factory=lambda: str(ObjectId()))
    date: datetime
    amount: float
    source: IncomeSource

    def __init__(self, *args, **kwargs):
        kwargs["_id"] = str(kwargs["_id"])
        super().__init__(*args, **kwargs)
