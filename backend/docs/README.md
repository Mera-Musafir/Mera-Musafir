# Mera Musafir API Documentation

Welcome to the Mera Musafir backend API documentation. This folder contains detailed integration guides for frontend developers.

## 📁 Documentation Structure

- [`trips.md`](./trips.md) - Trip management endpoints
- [`chat.md`](./chat.md) - Group chat system endpoints
- [`authentication.md`](./authentication.md) - Authentication & user management
- [`examples.md`](./examples.md) - Complete integration examples

## 🚀 Quick Start

1. **Base URL**: `http://localhost:8000` (development)
2. **API Prefix**: All endpoints are prefixed with `/api/v1` (will be implemented)
3. **Content Type**: `application/json`
4. **Authentication**: Bearer token (placeholder implementation)

## 📋 Available Endpoints

### Trip Management
- `GET /trips/` - List all trips
- `POST /trips/{trip_id}/join-chat` - Join trip group chat

### Group Chat System  
- `GET /trips/chats/{chat_id}` - Get chat details
- `GET /trips/chats/{chat_id}/messages` - Get chat messages
- `POST /trips/chats/{chat_id}/messages` - Send message

### General
- `GET /` - Health check

## 🔧 Development Setup

```bash
# Start the backend server
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
python run_tests.py
```

## 📱 Frontend Integration Tips

1. **Error Handling**: All endpoints return standard HTTP status codes
2. **Validation**: Request/response bodies are validated with Pydantic
3. **Authentication**: Include Bearer token in Authorization header
4. **Pagination**: Messages support `skip` and `limit` query parameters
5. **Real-time**: For real-time chat, poll `/messages` endpoint every 2-3 seconds

## 🐛 Common Issues

- **CORS**: Configure CORS for your frontend domain
- **Authentication**: Current implementation uses mock users for testing
- **Database**: SQLite for development, PostgreSQL for production
- **File Uploads**: Not yet implemented for trip images

## 📞 Support

For questions about API integration, check the individual endpoint documentation files in this folder.
