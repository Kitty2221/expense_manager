from datetime import date

from pydantic import BaseModel


class Income(BaseModel):
    date: date
    amount: float
    source: str
