from fastapi import FastAPI, Depends, Query, HTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from .database import init_db, get_db
from .models import Button, ButtonCreate, ButtonUpdate
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, column

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        await init_db()
    except Exception as e:
        print(f"Failed to initialize database: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/buttons", response_model=list[Button])
async def get_buttons(query: str = Query(None), db: Session = Depends(get_db)):
    try:
        if query:
            statement = select(Button).where(column("name").contains(query))
        else:
            statement = select(Button)

        results = db.exec(statement)
        buttons = results.all()

        if not buttons:
            return []

        return buttons
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/buttons", response_model=Button)
async def create_button(button: ButtonCreate, db: Session = Depends(get_db)):
    try:
        new_button = Button(**button.model_dump())
        db.add(new_button)
        db.commit()
        db.refresh(new_button)
        return new_button
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="A button with this name already exists"
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@app.put("/buttons/{button_id}", response_model=Button)
async def update_button(
    button_id: int, button: ButtonUpdate, db: Session = Depends(get_db)
):
    try:
        db_button = db.get(Button, button_id)
        if not db_button:
            raise HTTPException(
                status_code=404, detail=f"Button with id {button_id} not found"
            )

        update_data = button.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_button, key, value)

        db.add(db_button)
        db.commit()
        db.refresh(db_button)
        return db_button
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="A button with this name already exists"
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/buttons/{button_id}", status_code=204)
async def delete_button(button_id: int, db: Session = Depends(get_db)):
    try:
        button = db.get(Button, button_id)
        if not button:
            raise HTTPException(
                status_code=404, detail=f"Button with id {button_id} not found"
            )
        db.delete(button)
        db.commit()
        return None
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
