from fastapi import FastAPI
from database import engine, Base
from models import trips, activities  
from routers.trips_router import router as trips_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(trips_router)

@app.get("/")
def initialize():
    return {"title": "Mere Musafir"}
