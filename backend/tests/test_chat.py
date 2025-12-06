import pytest
from fastapi import status

class TestChatRoutes:
    """Test cases for chat routes"""
    
    def test_join_chat_creates_new_chat(self, client, test_trip, test_user):
        """Test joining a chat creates new group chat for first user"""
        pytest.set_current_test_user(test_user)
        
        response = client.post(f"/trips/{test_trip.id}/join-chat")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["trip_id"] == test_trip.id
        assert data["user_joined"] == True
        assert "chat_id" in data
        assert "Welcome! You created the group chat" in data["message"]
    
    def test_join_chat_adds_user_to_existing_chat(self, client, test_trip, test_user, another_user):
        """Test joining existing chat adds user as member"""
        # First user creates chat
        pytest.set_current_test_user(test_user)
        response1 = client.post(f"/trips/{test_trip.id}/join-chat")
        assert response1.status_code == status.HTTP_200_OK
        chat_id = response1.json()["chat_id"]
        
        # Second user joins existing chat
        pytest.set_current_test_user(another_user)
        response2 = client.post(f"/trips/{test_trip.id}/join-chat")
        assert response2.status_code == status.HTTP_200_OK
        
        data = response2.json()
        assert data["trip_id"] == test_trip.id
        assert data["chat_id"] == chat_id  # Same chat
        assert data["user_joined"] == True
        assert "Successfully joined the chat" in data["message"]
    
    def test_join_chat_user_already_member(self, client, test_trip, test_user):
        """Test joining chat when user is already a member"""
        pytest.set_current_test_user(test_user)
        
        # Join first time
        response1 = client.post(f"/trips/{test_trip.id}/join-chat")
        assert response1.status_code == status.HTTP_200_OK
        
        # Join second time (should not add again)
        response2 = client.post(f"/trips/{test_trip.id}/join-chat")
        assert response2.status_code == status.HTTP_200_OK
        
        data = response2.json()
        assert data["user_joined"] == False
        assert "Joined existing chat" in data["message"]
    
    def test_join_chat_nonexistent_trip(self, client, test_user):
        """Test joining chat for non-existent trip"""
        pytest.set_current_test_user(test_user)
        
        response = client.post("/trips/99999/join-chat")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Trip not found" in response.json()["detail"]
    
    def test_get_chat_details(self, client, test_trip, test_user):
        """Test getting chat details with members"""
        pytest.set_current_test_user(test_user)
        
        # Create chat first
        join_response = client.post(f"/trips/{test_trip.id}/join-chat")
        chat_id = join_response.json()["chat_id"]
        
        # Get chat details
        response = client.get(f"/trips/chats/{chat_id}")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["id"] == chat_id
        assert data["trip_id"] == test_trip.id
        assert data["name"] == f"{test_trip.title} Group Chat"
        assert "members" in data
        assert len(data["members"]) == 1
        assert data["members"][0]["user"]["name"] == test_user.name
    
    def test_get_chat_details_unauthorized(self, client, test_trip, test_user, another_user):
        """Test getting chat details when user is not a member"""
        # Create chat with first user
        pytest.set_current_test_user(test_user)
        join_response = client.post(f"/trips/{test_trip.id}/join-chat")
        chat_id = join_response.json()["chat_id"]
        
        # Try to access with different user
        pytest.set_current_test_user(another_user)
        response = client.get(f"/trips/chats/{chat_id}")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "You are not a member of this chat" in response.json()["detail"]
    
    def test_get_chat_messages_empty(self, client, test_trip, test_user):
        """Test getting messages from empty chat"""
        pytest.set_current_test_user(test_user)
        
        # Create chat
        join_response = client.post(f"/trips/{test_trip.id}/join-chat")
        chat_id = join_response.json()["chat_id"]
        
        # Get messages
        response = client.get(f"/trips/chats/{chat_id}/messages")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_send_and_get_messages(self, client, test_trip, test_user):
        """Test sending and retrieving messages"""
        pytest.set_current_test_user(test_user)
        
        # Create chat
        join_response = client.post(f"/trips/{test_trip.id}/join-chat")
        chat_id = join_response.json()["chat_id"]
        
        # Send message
        message_data = {"message": "Hello everyone! Excited for this trip!"}
        send_response = client.post(f"/trips/chats/{chat_id}/messages", json=message_data)
        assert send_response.status_code == status.HTTP_200_OK
        
        sent_message = send_response.json()
        assert sent_message["message"] == message_data["message"]
        assert sent_message["chat_id"] == chat_id
        assert sent_message["sender"]["name"] == test_user.name
        
        # Get messages
        get_response = client.get(f"/trips/chats/{chat_id}/messages")
        assert get_response.status_code == status.HTTP_200_OK
        
        messages = get_response.json()
        assert len(messages) == 1
        assert messages[0]["message"] == message_data["message"]
        assert messages[0]["sender"]["name"] == test_user.name
    
    def test_send_message_unauthorized(self, client, test_trip, test_user, another_user):
        """Test sending message when user is not a member"""
        # Create chat with first user
        pytest.set_current_test_user(test_user)
        join_response = client.post(f"/trips/{test_trip.id}/join-chat")
        chat_id = join_response.json()["chat_id"]
        
        # Try to send message with different user
        pytest.set_current_test_user(another_user)
        message_data = {"message": "I want to join!"}
        response = client.post(f"/trips/chats/{chat_id}/messages", json=message_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "You are not a member of this chat" in response.json()["detail"]
    
    def test_get_messages_unauthorized(self, client, test_trip, test_user, another_user):
        """Test getting messages when user is not a member"""
        # Create chat with first user
        pytest.set_current_test_user(test_user)
        join_response = client.post(f"/trips/{test_trip.id}/join-chat")
        chat_id = join_response.json()["chat_id"]
        
        # Try to get messages with different user
        pytest.set_current_test_user(another_user)
        response = client.get(f"/trips/chats/{chat_id}/messages")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "You are not a member of this chat" in response.json()["detail"]
    
    def test_multiple_users_multiple_messages(self, client, test_trip, test_user, another_user):
        """Test multiple users sending multiple messages"""
        # User 1 creates chat
        pytest.set_current_test_user(test_user)
        join_response = client.post(f"/trips/{test_trip.id}/join-chat")
        chat_id = join_response.json()["chat_id"]
        
        # User 2 joins chat
        pytest.set_current_test_user(another_user)
        client.post(f"/trips/{test_trip.id}/join-chat")
        
        # Send messages from both users
        messages = [
            (test_user, "Hey everyone! Looking forward to this trip!"),
            (another_user, "Me too! When should we meet?"),
            (test_user, "How about at the airport 2 hours before flight?"),
            (another_user, "Perfect! See you there.")
        ]
        
        for user, message_text in messages:
            pytest.set_current_test_user(user)
            response = client.post(f"/trips/chats/{chat_id}/messages", json={"message": message_text})
            assert response.status_code == status.HTTP_200_OK
        
        # Get all messages
        pytest.set_current_test_user(test_user)  # Any member can read
        response = client.get(f"/trips/chats/{chat_id}/messages")
        assert response.status_code == status.HTTP_200_OK
        
        retrieved_messages = response.json()
        assert len(retrieved_messages) == 4
        
        # Verify message order and content
        for i, (expected_user, expected_text) in enumerate(messages):
            assert retrieved_messages[i]["message"] == expected_text
            assert retrieved_messages[i]["sender"]["name"] == expected_user.name
    
    def test_message_pagination(self, client, test_trip, test_user):
        """Test message pagination with skip and limit"""
        pytest.set_current_test_user(test_user)
        
        # Create chat
        join_response = client.post(f"/trips/{test_trip.id}/join-chat")
        chat_id = join_response.json()["chat_id"]
        
        # Send multiple messages
        for i in range(10):
            message_data = {"message": f"Message {i+1}"}
            client.post(f"/trips/chats/{chat_id}/messages", json=message_data)
        
        # Test pagination
        response = client.get(f"/trips/chats/{chat_id}/messages?skip=0&limit=5")
        assert response.status_code == status.HTTP_200_OK
        
        messages = response.json()
        assert len(messages) == 5
        assert messages[0]["message"] == "Message 1"
        assert messages[4]["message"] == "Message 5"
        
        # Test second page
        response = client.get(f"/trips/chats/{chat_id}/messages?skip=5&limit=5")
        assert response.status_code == status.HTTP_200_OK
        
        messages = response.json()
        assert len(messages) == 5
        assert messages[0]["message"] == "Message 6"
        assert messages[4]["message"] == "Message 10"
