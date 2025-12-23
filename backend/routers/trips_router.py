from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from crud.users_crud import log_event
from database import get_db
from crud.trips_crud import get_all_trips, create_trip
from schemas.trips import TripCreate, TripResponse
from auth.dependencies import get_current_user
from supabase import create_client, Client
from io import BytesIO
import mimetypes
import os
from uuid import uuid4

router = APIRouter(prefix="/trips", tags=["Trips"])

TRIP_IMAGES_BUCKET = "tripimages"
TRIP_IMAGES_PUBLIC_BASE_URL = "https://eywxhunezrqpfzzyqzed.supabase.co/storage/v1/object/public/tripimages/"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase_client: Optional[Client] = (
    create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
)

async def _upload_trip_image(image: UploadFile, trip_id: int) -> str:
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Image storage is not configured.")
    file_bytes = await image.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    extension = mimetypes.guess_extension(image.content_type or "") or ".bin"
    filename = f"{uuid4()}{extension}"
    storage_path = f"trips/{trip_id}/{filename}"
    buffer = BytesIO(file_bytes)
    buffer.seek(0)
    try:
        response = supabase_client.storage.from_(TRIP_IMAGES_BUCKET).upload(
            storage_path,
            buffer,
            {
                "contentType": image.content_type or "application/octet-stream",
                "upsert": True,
            },
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to upload image.") from exc
    error = getattr(response, "error", None)
    if isinstance(response, dict):
        error = response.get("error")
    if error:
        raise HTTPException(status_code=502, detail="Unable to upload image.")
    return f"{TRIP_IMAGES_PUBLIC_BASE_URL}{storage_path}"


@router.get("/", response_model=List[TripResponse])
def read_all_trips(db: Session = Depends(get_db)):
    return get_all_trips(db)


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_new_trip(
    trip: TripCreate = Depends(TripCreate.as_form),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Create trip (CRUD function unaware of user)
    new_trip = create_trip(db, trip)
    if image:
        image_url = await _upload_trip_image(image, new_trip.id)
        new_trip.imageurl = image_url
        db.add(new_trip)
        db.commit()
        db.refresh(new_trip)

    # Log analytics event here
    log_event(
        db,
        user_id=current_user.id,
        event_type="trip_created",
        metadata={"trip_id": new_trip.id}
    )

    return new_trip