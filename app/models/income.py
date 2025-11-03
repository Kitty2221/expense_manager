from datetime import datetime

from pydantic import BaseModel


class Income(BaseModel):
    date: datetime
    amount: float
    source: str
