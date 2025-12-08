from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth.dependencies import get_current_user
from models.users import User
from models.trips import Trip
from models.group_chats import GroupChat
from schemas.group_chats import GroupChatResponse, JoinChatResponse
from schemas.chat_messages import ChatMessageCreate, ChatMessageResponse
from crud.chat_crud import (
    get_or_create_group_chat,
    get_group_chat_with_members,
    get_chat_messages,
    create_chat_message,
    is_user_in_chat
)
from crud.itinerary_crud import (
    get_itinerary_for_trip,
    create_itinerary_item,
    get_itinerary_item,
    update_itinerary_item,
    delete_itinerary_item,
)
from schemas.itinerary import (
    ItineraryCreate,
    ItineraryUpdate,
    ItineraryResponse
)

router = APIRouter(prefix="/trips", tags=["Group Chat"])

@router.post("/{trip_id}/join-chat", response_model=JoinChatResponse)
def join_trip_chat(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Join or create a group chat for a trip.
    - Creates chat if it doesn't exist
    - Adds user to chat if not already a member
    """
    
    # Verify trip exists
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    # Get or create chat
    chat, user_joined = get_or_create_group_chat(db, trip_id, current_user.id)
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create or access chat"
        )
    
    message = "Joined existing chat" if not user_joined and chat else \
              "Welcome! You created the group chat" if user_joined and len(chat.members) == 1 else \
              "Successfully joined the chat"
    
    return JoinChatResponse(
        chat_id=chat.id,
        trip_id=trip_id,
        user_joined=user_joined,
        message=message
    )

@router.get("/chats/{chat_id}", response_model=GroupChatResponse)
def get_chat_details(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat details with member list"""
    
    # Verify user is in chat
    if not is_user_in_chat(db, chat_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this chat"
        )
    
    chat = get_group_chat_with_members(db, chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    return chat

@router.get("/chats/{chat_id}/messages", response_model=List[ChatMessageResponse])
def get_chat_messages_endpoint(
    chat_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat messages"""
    
    # Verify user is in chat
    if not is_user_in_chat(db, chat_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this chat"
        )
    
    messages = get_chat_messages(db, chat_id, skip, limit)
    return messages

@router.post("/chats/{chat_id}/messages", response_model=ChatMessageResponse)
def send_message(
    chat_id: int,
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to the chat"""
    
    # Verify user is in chat
    if not is_user_in_chat(db, chat_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this chat"
        )
    
    # Create message
    new_message = create_chat_message(
        db=db,
        chat_id=chat_id,
        sender_id=current_user.id,
        message=message_data.message
    )
    
    # Refresh to get sender info
    db.refresh(new_message)
    
    return new_message

@router.get("/chats/{chat_id}/itinerary", response_model=List[ItineraryResponse])
def get_itinerary(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get shared itinerary for this chat's trip"""
    # Verify user is in chat
    if not is_user_in_chat(db, chat_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this chat"
        )

    chat = db.query(GroupChat).filter(GroupChat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

    items = get_itinerary_for_trip(db, chat.trip_id)
    return items


@router.post("/chats/{chat_id}/itinerary", response_model=ItineraryResponse, status_code=status.HTTP_201_CREATED)
def add_itinerary_item(
    chat_id: int,
    data: ItineraryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new item to the shared itinerary"""
    if not is_user_in_chat(db, chat_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this chat"
        )

    chat = db.query(GroupChat).filter(GroupChat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

    item = create_itinerary_item(db, chat.trip_id, current_user.id, data)
    return item


@router.patch("/chats/{chat_id}/itinerary/{item_id}", response_model=ItineraryResponse)
def edit_itinerary_item(
    chat_id: int,
    item_id: int,
    data: ItineraryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Edit an itinerary item (any chat member can edit for now)"""
    if not is_user_in_chat(db, chat_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this chat"
        )

    chat = db.query(GroupChat).filter(GroupChat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

    item = get_itinerary_item(db, item_id)
    if not item or item.trip_id != chat.trip_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary item not found for this chat"
        )

    updated = update_itinerary_item(db, item, data)
    return updated


@router.delete("/chats/{chat_id}/itinerary/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_itinerary_item(
    chat_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an itinerary item"""
    if not is_user_in_chat(db, chat_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this chat"
        )

    chat = db.query(GroupChat).filter(GroupChat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

    item = get_itinerary_item(db, item_id)
    if not item or item.trip_id != chat.trip_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary item not found for this chat"
        )

    delete_itinerary_item(db, item)
    return
