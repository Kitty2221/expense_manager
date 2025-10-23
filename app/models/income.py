from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime



class Income(BaseModel):
    date: datetime
    amount: float
    source: str
