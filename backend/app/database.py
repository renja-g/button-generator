from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlmodel import create_engine, Session
from contextlib import asynccontextmanager
from collections.abc import Generator


DATABASE_URL = "sqlite:///./data/data.db"

engine = create_engine(DATABASE_URL)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


async def init_db():
    """Initialize the database."""
    SQLModel.metadata.create_all(engine)
