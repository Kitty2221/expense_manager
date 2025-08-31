from bson import ObjectId
from pydantic import BaseModel


class Category(BaseModel):
    _id = str(ObjectId())
    name: str
