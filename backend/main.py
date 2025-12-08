from fastapi import FastAPI
from database import engine, Base
from models import trips, activities, users, group_chats, group_chat_members, chat_messages, itinerary_items
from routers.trips_router import router as trips_router
from routers.chat_router import router as chat_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(trips_router)
app.include_router(chat_router)

@app.get("/")
def initialize():
    return {"title": "Mere Musafir"}
