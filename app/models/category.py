from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str

class Category(BaseModel):
    id: Optional[str] = Field(alias="_id", default_factory=lambda: str(ObjectId()))
    name: str

    def __init__(self, *args, **kwargs):
        kwargs["_id"] = str(kwargs["_id"])
        super().__init__(*args, **kwargs)
