from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import trips, activities, users, group_chats, group_chat_members, chat_messages, itinerary_items
from routers.trips_router import router as trips_router
from routers.chat_router import router as chat_router
from routers.auth_router import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",      # Expo web dev server
        "http://localhost:3000",      # React dev server
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:8081",      # Alternative localhost
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],              # Allow all HTTP methods
    allow_headers=["*"],              # Allow all headers
)

app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(chat_router)

@app.get("/")
def initialize():
    return {"title": "Mere Musafir"}
