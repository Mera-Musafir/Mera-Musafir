# Group Chat API

Documentation for the group chat system endpoints.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips/chats/{chat_id}` | Get chat details and members |
| GET | `/trips/chats/{chat_id}/messages` | Get chat messages |
| POST | `/trips/chats/{chat_id}/messages` | Send a message |

---

## GET /trips/chats/{chat_id}

Get chat details including member list. User must be a member of the chat.

### Request

```http
GET /trips/chats/1
Authorization: Bearer <token>
```

### Response

**Status:** `200 OK`

```json
{
  "id": 1,
  "trip_id": 1,
  "name": "Paris Adventure Group Chat",
  "created_at": "2025-12-06T10:30:00Z",
  "members": [
    {
      "id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "joined_at": "2025-12-06T10:30:00Z",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Sarah M.",
        "email": "sarah@example.com"
      }
    },
    {
      "id": 2,
      "user_id": "660f9511-f3ac-52e5-b827-557766551111",
      "joined_at": "2025-12-06T11:15:00Z",
      "user": {
        "id": "660f9511-f3ac-52e5-b827-557766551111",
        "name": "James K.",
        "email": "james@example.com"
      }
    }
  ]
}
```

### Error Responses

**403 Forbidden**
```json
{
  "detail": "You are not a member of this chat"
}
```

**404 Not Found**
```json
{
  "detail": "Chat not found"
}
```

### Frontend Integration

```typescript
interface ChatMember {
  id: number;
  user_id: string;
  joined_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ChatDetails {
  id: number;
  trip_id: number;
  name: string;
  created_at: string;
  members: ChatMember[];
}

const useChatDetails = (chatId: number) => {
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const response = await fetch(`/trips/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setChatDetails(data);
        }
      } catch (error) {
        console.error('Failed to fetch chat details:', error);
      }
    };

    if (chatId) {
      fetchChatDetails();
    }
  }, [chatId]);

  return chatDetails;
};
```

---

## GET /trips/chats/{chat_id}/messages

Get chat messages with pagination support. Messages are returned in chronological order.

### Request

```http
GET /trips/chats/1/messages?skip=0&limit=50
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Number of messages to skip |
| `limit` | integer | 50 | Maximum messages to return |

### Response

**Status:** `200 OK`

```json
[
  {
    "id": 1,
    "chat_id": 1,
    "sender_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Hey everyone! Looking forward to this trip!",
    "created_at": "2025-12-06T10:35:00Z",
    "sender": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Sarah M.",
      "email": "sarah@example.com"
    }
  },
  {
    "id": 2,
    "chat_id": 1,
    "sender_id": "660f9511-f3ac-52e5-b827-557766551111",
    "message": "Me too! When should we meet at the airport?",
    "created_at": "2025-12-06T10:37:00Z",
    "sender": {
      "id": "660f9511-f3ac-52e5-b827-557766551111",
      "name": "James K.",
      "email": "james@example.com"
    }
  }
]
```

### Frontend Integration

```typescript
interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: string;
  message: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

const useChatMessages = (chatId: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (skip = 0, limit = 50) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/trips/chats/${chatId}/messages?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (skip === 0) {
          setMessages(data);
        } else {
          setMessages(prev => [...prev, ...data]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (!chatId) return;

    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [chatId]);

  return { messages, loading, fetchMessages };
};
```

---

## POST /trips/chats/{chat_id}/messages

Send a new message to the chat. User must be a member of the chat.

### Request

```http
POST /trips/chats/1/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Looking forward to meeting everyone!"
}
```

### Request Body

```json
{
  "message": "Your message text here"
}
```

### Response

**Status:** `200 OK`

```json
{
  "id": 3,
  "chat_id": 1,
  "sender_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Looking forward to meeting everyone!",
  "created_at": "2025-12-06T10:40:00Z",
  "sender": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sarah M.",
    "email": "sarah@example.com"
  }
}
```

### Error Responses

**403 Forbidden**
```json
{
  "detail": "You are not a member of this chat"
}
```

### Frontend Integration

```typescript
interface SendMessageRequest {
  message: string;
}

const useSendMessage = (chatId: number) => {
  const [sending, setSending] = useState(false);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/trips/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        return newMessage;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  return { sendMessage, sending };
};

// React Native chat component example
const ChatScreen = ({ route }) => {
  const { chatId } = route.params;
  const [messageInput, setMessageInput] = useState('');
  const { messages, fetchMessages } = useChatMessages(chatId);
  const { sendMessage, sending } = useSendMessage(chatId);

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    try {
      await sendMessage(messageInput);
      setMessageInput('');
      // Refresh messages to show the new one
      fetchMessages();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MessageBubble
            message={item.message}
            sender={item.sender.name}
            timestamp={item.created_at}
            isOwn={item.sender_id === currentUserId}
          />
        )}
      />
      
      <View style={{ flexDirection: 'row', padding: 16 }}>
        <TextInput
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="Type a message..."
          style={{ flex: 1, borderWidth: 1, padding: 12 }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !messageInput.trim()}
        >
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

## Real-time Updates

Since WebSockets are not implemented, use polling for real-time updates:

```typescript
// Optimized polling strategy
const useChatPolling = (chatId: number) => {
  const { fetchMessages } = useChatMessages(chatId);
  
  useEffect(() => {
    if (!chatId) return;

    // Fast polling when app is active
    const fastInterval = setInterval(() => {
      fetchMessages();
    }, 2000);

    // Handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        fetchMessages(); // Refresh when app becomes active
      }
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(fastInterval);
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [chatId]);
};
```
