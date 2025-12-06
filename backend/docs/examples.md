# Complete Integration Examples

This document provides complete, copy-paste ready examples for integrating with the Mera Musafir API.

## React Native Complete Example

### 1. API Service Setup

```typescript
// services/api.ts
export interface Trip {
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
  participantlist: Array<{
    id: number;
    name: string;
    initials: string;
  }>;
  activities: Array<{
    id: number;
    name: string;
    trip_id: number;
  }>;
}

export interface ChatMessage {
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

class MeraMusafirAPI {
  private baseURL = 'http://localhost:8000';
  private token = 'mock-token'; // Replace with real token

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Trip methods
  async getTrips(): Promise<Trip[]> {
    return this.request<Trip[]>('/trips/');
  }

  async joinTripChat(tripId: number) {
    return this.request<{
      chat_id: number;
      trip_id: number;
      user_joined: boolean;
      message: string;
    }>(`/trips/${tripId}/join-chat`, { method: 'POST' });
  }

  // Chat methods
  async getChatMessages(chatId: number, skip = 0, limit = 50): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/trips/chats/${chatId}/messages?skip=${skip}&limit=${limit}`);
  }

  async sendMessage(chatId: number, message: string): Promise<ChatMessage> {
    return this.request<ChatMessage>(`/trips/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const api = new MeraMusafirAPI();
```

### 2. Trip Listing Screen

```tsx
// screens/TripsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { api, Trip } from '../services/api';

export const TripsScreen = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const tripsData = await api.getTrips();
      setTrips(tripsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trips');
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChat = async (trip: Trip) => {
    try {
      const result = await api.joinTripChat(trip.id);
      
      Alert.alert('Success', result.message, [
        {
          text: 'Go to Chat',
          onPress: () => navigation.navigate('Chat', {
            chatId: result.chat_id,
            tripTitle: trip.title,
          }),
        },
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to join chat');
      console.error('Failed to join chat:', error);
    }
  };

  const renderTrip = ({ item: trip }: { item: Trip }) => (
    <View style={styles.tripCard}>
      {trip.imageurl && (
        <Image source={{ uri: trip.imageurl }} style={styles.tripImage} />
      )}
      
      <View style={styles.tripInfo}>
        <Text style={styles.tripTitle}>{trip.title}</Text>
        <Text style={styles.tripLocation}>{trip.location}</Text>
        <Text style={styles.tripDates}>{trip.dates}</Text>
        
        <View style={styles.participantsContainer}>
          <Text style={styles.participants}>
            {trip.participants}/{trip.maxparticipants} travelers
          </Text>
        </View>

        {trip.activities.length > 0 && (
          <View style={styles.activitiesContainer}>
            <Text style={styles.activitiesTitle}>Activities:</Text>
            {trip.activities.slice(0, 3).map(activity => (
              <Text key={activity.id} style={styles.activity}>
                • {activity.name}
              </Text>
            ))}
            {trip.activities.length > 3 && (
              <Text style={styles.moreActivities}>
                +{trip.activities.length - 3} more
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinChat(trip)}
        >
          <Text style={styles.joinButtonText}>Join Group Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading trips...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadTrips}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tripInfo: {
    padding: 16,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  tripDates: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  participantsContainer: {
    marginBottom: 12,
  },
  participants: {
    fontSize: 14,
    color: '#8E486A',
    fontWeight: '500',
  },
  activitiesContainer: {
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  activity: {
    fontSize: 13,
    color: '#666',
  },
  moreActivities: {
    fontSize: 13,
    color: '#8E486A',
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: '#8E486A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 3. Chat Screen

```tsx
// screens/ChatScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { api, ChatMessage } from '../services/api';

export const ChatScreen = ({ route, navigation }) => {
  const { chatId, tripTitle } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({
      title: tripTitle || 'Group Chat',
    });
  }, [navigation, tripTitle]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [chatId]);

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages(false); // Don't show loading on refresh
    }, 3000);

    return () => clearInterval(interval);
  }, [chatId]);

  const loadMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const messagesData = await api.getChatMessages(chatId);
      setMessages(messagesData);
      
      // Scroll to bottom after loading
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      if (showLoading) {
        Alert.alert('Error', 'Failed to load messages');
      }
      console.error('Failed to load messages:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const sentMessage = await api.sendMessage(chatId, messageText);
      
      // Add message to list immediately for better UX
      setMessages(prev => [...prev, sentMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Refresh all messages to ensure consistency
      await loadMessages(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      console.error('Failed to send message:', error);
      // Restore message text on error
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item: message }: { item: ChatMessage }) => {
    const isOwn = false; // TODO: Compare with current user ID
    const messageTime = new Date(message.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[
        styles.messageContainer,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}>
        {!isOwn && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}
        <Text style={styles.messageText}>{message.message}</Text>
        <Text style={styles.messageTime}>{messageTime}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8E486A',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#8E486A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
```

### 4. Navigation Setup

```tsx
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsScreen } from '../screens/TripsScreen';
import { ChatScreen } from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Trips"
          component={TripsScreen}
          options={{
            title: 'Discover Trips',
            headerStyle: {
              backgroundColor: '#8E486A',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerStyle: {
              backgroundColor: '#8E486A',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 5. App.tsx

```tsx
// App.tsx
import React from 'react';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
```

## Web React Example

```tsx
// hooks/useApi.ts
import { useState, useEffect } from 'react';
import { api, Trip, ChatMessage } from '../services/api';

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTrips();
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return { trips, loading, error, refetch: loadTrips };
};

export const useChat = (chatId: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    if (!chatId) return;
    
    try {
      const data = await api.getChatMessages(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    try {
      const newMessage = await api.sendMessage(chatId, message);
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Poll for new messages
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  return { messages, loading, sendMessage, refetch: loadMessages };
};
```

This complete example provides:

1. **Full API integration** - All endpoints covered
2. **Error handling** - Proper error states and user feedback
3. **Real-time updates** - Polling-based message updates
4. **UI/UX best practices** - Loading states, optimistic updates
5. **Type safety** - Full TypeScript support
6. **Navigation** - Screen transitions and parameter passing
7. **Responsive design** - Works on different screen sizes

Copy these examples and customize the styling and functionality to match your app's design requirements!
