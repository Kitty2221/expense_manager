import sys
from loguru import logger

def setup_logger():
    logger.remove()

    logger.add(
        sys.stdout,
        level="DEBUG",
        enqueue=True,
    )