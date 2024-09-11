from sqlmodel import Field, SQLModel
from pydantic import BaseModel


class ButtonBase(BaseModel):
    name: str = Field(unique=True, index=True)
    width: int
    height: int


class Button(ButtonBase, SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, index=True)


class ButtonCreate(ButtonBase):
    pass


class ButtonUpdate(ButtonBase):
    name: str | None = Field(default=None, unique=True, index=True)
    width: int | None
    height: int | None
