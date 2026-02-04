import os
from typing import Dict, Optional

from dotenv import load_dotenv
from loguru import logger
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.results import UpdateResult

load_dotenv()


class ExpenseManagerMongoClient:
    instance: "ExpenseManagerMongoClient"
    client: AsyncIOMotorClient

    def __new__(cls):
        if not hasattr(cls, "instance"):
            logger.info("Make new instance of MongoClient")
            cls.instance = super().__new__(cls)

            cls.instance.client = AsyncIOMotorClient(
                host=os.environ.get("MONGO_HOST"),
                maxPoolSize=10
            )
        return cls.instance

    def __init__(self):
        self.db = self.client[os.environ.get("DB_NAME")]

    async def get_one_record(self,
                             collection: str,
                             find_obj: Optional[dict] = None,
                             field: Optional[str] = None,
                             mongo_cli_cls=None,
                             *args,
                             **kwargs) -> Optional[dict]:
        """Get one records"""
        logger.info(f"-->> Request with arguments: {locals()}")
        res = await self.db[collection].find_one(find_obj, *args, **kwargs)
        logger.debug(f"<<-- {res}")
        return res.get(field) if field is not None and res else res

    async def get_many_records(self,
                               collection: str,
                               projection: Optional[dict] = None,
                               find_obj: Optional[dict] = None,
                               *args,
                               **kwargs,
                               ) -> Optional[list]:
        """Get many records"""
        logger.info(f"-->> Request with arguments: {locals()}")
        if find_obj is None:
            find_obj = {}
        cursor = self.db[collection].find(find_obj, projection, *args, **kwargs)
        return await cursor.to_list(length=None)

    async def insert_one(self,
                         collection: str,
                         data: Dict):
        """Insert one record"""
        logger.info(f"-->> Request with arguments: {locals()}")
        return await self.db[collection].insert_one(data)

    async def update_one(self,
                         collection: str,
                         find_obj: dict,
                         data_to_update: dict,
                         upsert: bool = False,
                         db_name: str = None,
                         *args,
                         **kwargs,
                         ) -> UpdateResult:
        """Update document"""
        logger.info(f"-->> {locals()}")
        res = await self.db[collection].update_one(filter=find_obj, update=data_to_update, upsert=upsert)
        logger.info(f"<<-- {res.raw_result}")
        return res

    async def delete_one(self,
                         collection: str,
                         find_obj: dict):
        """Delete document"""
        logger.info(f"-->> Request with arguments: {locals()}")
        return await self.db[collection].delete_one(filter=find_obj)
