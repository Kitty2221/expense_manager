from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class IncomeSourceCreate(BaseModel):
    name: str


class IncomeSource(BaseModel):
    id: Optional[str] = Field(alias="_id", default_factory=lambda: str(ObjectId()))
    name: str

    def __init__(self, *args, **kwargs):
        kwargs["_id"] = str(kwargs["_id"])
        super().__init__(*args, **kwargs)
