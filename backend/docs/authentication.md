# Authentication API

Documentation for user authentication and authorization.

## Current Implementation

⚠️ **Note**: The current implementation uses mock authentication for development and testing. This should be replaced with a proper authentication system in production.

## Authentication Flow

### Development/Testing
```typescript
// Mock user is automatically created and used
// No actual authentication required for testing
const token = "mock-token"; // Placeholder
```

### Production Ready Implementation
```typescript
// Planned JWT-based authentication
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
```

## User Model

```typescript
interface User {
  id: string; // UUID format
  name: string;
  email: string;
}
```

## Authorization Headers

All protected endpoints require an Authorization header:

```http
Authorization: Bearer <your-token-here>
```

## Protected Endpoints

The following endpoints require authentication:

- `POST /trips/{trip_id}/join-chat`
- `GET /trips/chats/{chat_id}`
- `GET /trips/chats/{chat_id}/messages`
- `POST /trips/chats/{chat_id}/messages`

## Frontend Integration

### Current (Mock) Implementation

```typescript
// Mock authentication service
class AuthService {
  private mockToken = "dev-mock-token";

  async login(email: string, password: string) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      access_token: this.mockToken,
      token_type: "bearer",
      expires_in: 3600,
      user: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test User",
        email: email,
      }
    };
  }

  getToken() {
    return this.mockToken;
  }

  async getCurrentUser() {
    return {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test User",
      email: "test@example.com",
    };
  }
}

// Usage in React/React Native
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (email: string, password: string) => {
    const authService = new AuthService();
    const response = await authService.login(email, password);
    
    setUser(response.user);
    setToken(response.access_token);
    
    // Store in secure storage
    await AsyncStorage.setItem('auth_token', response.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  };

  return { user, token, login };
};
```

### Production Implementation (Planned)

```typescript
// Real authentication service
class AuthService {
  private baseURL = 'http://localhost:8000';

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  async refreshToken(refreshToken: string) {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }
}
```

## API Client with Authentication

```typescript
class ApiClient {
  private baseURL = 'http://localhost:8000';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, handle refresh or logout
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  // Trip endpoints
  async getTrips() {
    return this.request<Trip[]>('/trips/');
  }

  async joinTripChat(tripId: number) {
    return this.request<JoinChatResponse>(`/trips/${tripId}/join-chat`, {
      method: 'POST',
    });
  }

  // Chat endpoints
  async getChatDetails(chatId: number) {
    return this.request<ChatDetails>(`/trips/chats/${chatId}`);
  }

  async getChatMessages(chatId: number, skip = 0, limit = 50) {
    return this.request<ChatMessage[]>(
      `/trips/chats/${chatId}/messages?skip=${skip}&limit=${limit}`
    );
  }

  async sendMessage(chatId: number, message: string) {
    return this.request<ChatMessage>(`/trips/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

// Usage with React Context
const ApiContext = createContext<ApiClient | null>(null);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const apiClient = useMemo(() => new ApiClient(), []);

  return (
    <ApiContext.Provider value={apiClient}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const client = useContext(ApiContext);
  if (!client) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return client;
};
```

## Error Handling

```typescript
// Common authentication errors
interface AuthError {
  status: number;
  message: string;
}

const handleAuthError = (error: any) => {
  switch (error.status) {
    case 401:
      // Token expired or invalid
      // Redirect to login or refresh token
      break;
    case 403:
      // Insufficient permissions
      // Show access denied message
      break;
    case 422:
      // Validation error
      // Show form validation errors
      break;
    default:
      // Generic error handling
      break;
  }
};
```

## Security Considerations

### Current (Development)
- Mock authentication for testing
- No actual security validation
- Suitable for development only

### Production Requirements
- JWT tokens with expiration
- Refresh token mechanism
- Password hashing (bcrypt)
- Rate limiting for auth endpoints
- HTTPS only
- Secure token storage (Keychain/Keystore)
- CSRF protection
- Input validation and sanitization

## Migration Path

To implement real authentication:

1. Replace mock `get_current_user` dependency
2. Add JWT token validation
3. Implement login/register endpoints
4. Add user management database tables
5. Update frontend to handle real authentication flow
6. Implement secure token storage
7. Add token refresh mechanism
