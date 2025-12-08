from sqlalchemy.orm import Session, joinedload
from models.group_chats import GroupChat
from models.group_chat_members import GroupChatMember
from models.chat_messages import ChatMessage
from models.trips import Trip
from models.users import User
import uuid

def get_or_create_group_chat(db: Session, trip_id: int, user_id: uuid.UUID):
    """Get existing chat or create new one for trip"""
    
    # Check if chat already exists for this trip
    existing_chat = db.query(GroupChat).filter(GroupChat.trip_id == trip_id).first()
    
    if existing_chat:
        # Check if user is already a member
        existing_member = db.query(GroupChatMember).filter(
            GroupChatMember.chat_id == existing_chat.id,
            GroupChatMember.user_id == user_id
        ).first()
        
        user_joined = False
        if not existing_member:
            # Add user to existing chat
            new_member = GroupChatMember(chat_id=existing_chat.id, user_id=user_id)
            db.add(new_member)
            
            # Increment participants in the trip
            trip = db.query(Trip).filter(Trip.id == trip_id).first()
            if trip:
                trip.participants = (trip.participants or 0) + 1
            
            db.commit()
            user_joined = True
            
        return existing_chat, user_joined
    
    # Create new chat
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        return None, False
        
    new_chat = GroupChat(
        trip_id=trip_id,
        name=f"{trip.title} Group Chat"
    )
    db.add(new_chat)
    db.flush()  # Get the chat ID
    
    # Add user as first member
    new_member = GroupChatMember(chat_id=new_chat.id, user_id=user_id)
    db.add(new_member)
    
    # Increment participants (first member)
    trip.participants = (trip.participants or 0) + 1
    
    db.commit()
    
    return new_chat, True


def get_all_chats_for_user(db: Session, user_id: uuid.UUID):
    """Return all group chats where the user is a member"""
    return (
        db.query(GroupChat)
        .join(GroupChatMember, GroupChatMember.chat_id == GroupChat.id)
        .options(joinedload(GroupChat.members).joinedload(GroupChatMember.user))
        .filter(GroupChatMember.user_id == user_id)
        .order_by(GroupChat.created_at.desc())
        .all()
    )


def get_group_chat_with_members(db: Session, chat_id: int):
    """Get chat with all members"""
    return db.query(GroupChat).options(
        joinedload(GroupChat.members).joinedload(GroupChatMember.user)
    ).filter(GroupChat.id == chat_id).first()

def get_chat_messages(db: Session, chat_id: int, skip: int = 0, limit: int = 50):
    """Get chat messages with sender info"""
    return db.query(ChatMessage).options(
        joinedload(ChatMessage.sender)
    ).filter(
        ChatMessage.chat_id == chat_id
    ).order_by(
        ChatMessage.created_at.asc()
    ).offset(skip).limit(limit).all()

def create_chat_message(db: Session, chat_id: int, sender_id: uuid.UUID, message: str):
    """Create new chat message"""
    new_message = ChatMessage(
        chat_id=chat_id,
        sender_id=sender_id,
        message=message
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message

def is_user_in_chat(db: Session, chat_id: int, user_id: uuid.UUID) -> bool:
    """Check if user is member of chat"""
    member = db.query(GroupChatMember).filter(
        GroupChatMember.chat_id == chat_id,
        GroupChatMember.user_id == user_id
    ).first()
    return member is not None
