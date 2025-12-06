# Trip Management API

Documentation for trip-related endpoints.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips/` | Get all available trips |
| POST | `/trips/{trip_id}/join-chat` | Join or create group chat for trip |

---

## GET /trips/

Get all available trips with their activities and participant information.

### Request

```http
GET /trips/
```

No authentication required for listing trips.

### Response

**Status:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "Paris Adventure",
    "location": "Paris, France",
    "dates": "Dec 15-22, 2025",
    "imageurl": "https://example.com/paris.jpg",
    "participants": 4,
    "maxparticipants": 8,
    "description": "Experience the magic of Paris during the holiday season!",
    "budget": "$1,200-1,800",
    "duration": 7,
    "triptype": "Cultural",
    "participantlist": [
      {
        "id": 1,
        "name": "Sarah M.",
        "initials": "SM"
      },
      {
        "id": 2,
        "name": "James K.",
        "initials": "JK"
      }
    ],
    "activities": [
      {
        "id": 1,
        "name": "Eiffel Tower",
        "trip_id": 1
      },
      {
        "id": 2,
        "name": "Louvre Museum",
        "trip_id": 1
      }
    ]
  }
]
```

### Frontend Integration

```typescript
// TypeScript interface
interface Trip {
  id: number;
  title: string;
  location: string;
  dates: string;
  imageurl: string | null;
  participants: number;
  maxparticipants: number;
  description: string | null;
  budget: string | null;
  duration: number | null;
  triptype: string | null;
  participantlist: Participant[];
  activities: Activity[];
}

interface Participant {
  id: number;
  name: string;
  initials: string;
}

interface Activity {
  id: number;
  name: string;
  trip_id: number;
}

// React hook example
const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/trips/');
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error('Failed to fetch trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return { trips, loading };
};
```

---

## POST /trips/{trip_id}/join-chat

Join an existing group chat or create a new one for the specified trip. Only one group chat exists per trip.

### Request

```http
POST /trips/1/join-chat
Authorization: Bearer <token>
```

### Response

**Status:** `200 OK`

```json
{
  "chat_id": 1,
  "trip_id": 1,
  "user_joined": true,
  "message": "Successfully joined the chat"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `chat_id` | integer | ID of the group chat |
| `trip_id` | integer | ID of the trip |
| `user_joined` | boolean | `true` if user was added, `false` if already member |
| `message` | string | Human-readable status message |

### Possible Messages

- `"Welcome! You created the group chat"` - First user joining
- `"Successfully joined the chat"` - New member added
- `"Joined existing chat"` - User was already a member

### Error Responses

**404 Not Found**
```json
{
  "detail": "Trip not found"
}
```

### Frontend Integration

```typescript
interface JoinChatResponse {
  chat_id: number;
  trip_id: number;
  user_joined: boolean;
  message: string;
}

const joinTripChat = async (tripId: number): Promise<JoinChatResponse> => {
  const response = await fetch(`/trips/${tripId}/join-chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to join chat');
  }

  return response.json();
};

// React component example
const TripCard = ({ trip }: { trip: Trip }) => {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinChat = async () => {
    setIsJoining(true);
    try {
      const result = await joinTripChat(trip.id);
      console.log(result.message);
      // Navigate to chat screen with chat_id
      navigation.navigate('Chat', { chatId: result.chat_id });
    } catch (error) {
      console.error('Failed to join chat:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleJoinChat} disabled={isJoining}>
      <Text>{isJoining ? 'Joining...' : 'Join Group Chat'}</Text>
    </TouchableOpacity>
  );
};
```

### State Management

```typescript
// Redux/Zustand store example
interface ChatState {
  currentChatId: number | null;
  joinedChats: Set<number>;
}

const useChatStore = create<ChatState>((set) => ({
  currentChatId: null,
  joinedChats: new Set(),
  
  joinChat: (chatId: number) => set((state) => ({
    currentChatId: chatId,
    joinedChats: new Set([...state.joinedChats, chatId]),
  })),
}));
```
