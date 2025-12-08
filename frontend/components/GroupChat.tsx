import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import api from "../api/api";

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

interface Message {
  id: string;
  type: "text" | "system";
  userId: string;
  userName: string;
  userInitials: string;
  content: string;
  timestamp: Date;
}

interface GroupChatProps {
  chatId: number | null;
  tripId: string;
  tripTitle: string;
  onBack: () => void;
}

export function GroupChat({ chatId, tripId, tripTitle, onBack }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId] = useState("1");
  const scrollRef = useRef<ScrollView | null>(null);

  // Load messages on mount or when chatId changes
  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }
    loadMessages();
  }, [chatId]);

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (!chatId) return;

    const interval = setInterval(() => {
      loadMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async (showLoading = true) => {
    if (!chatId) return;

    try {
      if (showLoading) setLoading(true);

      const response = await api.get(`/trips/chats/${chatId}/messages`);
      console.log("Fetched chat messages:", response.data);

      // Map API response to Message format
      const mappedMessages: Message[] = response.data.map((msg: ChatMessage) => ({
        id: msg.id.toString(),
        type: "text",
        userId: msg.sender_id,
        userName: msg.sender?.name || "Unknown",
        userInitials: msg.sender?.name?.slice(0, 2).toUpperCase() || "?",
        content: msg.message,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(mappedMessages);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      if (showLoading) {
        Toast.show({
          type: "error",
          text1: "Failed to load messages",
          text2: "Please try again",
        });
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatId) return;

    const messageText = messageInput.trim();
    setMessageInput("");
    setSending(true);

    try {
      // Send message to API
      const response = await api.post(`/trips/chats/${chatId}/messages`, {
        message: messageText,
      });

      console.log("Message sent:", response.data);

      // Add message to list immediately for better UX
      const newMessage: Message = {
        id: response.data.id.toString(),
        type: "text",
        userId: response.data.sender_id,
        userName: response.data.sender?.name || "You",
        userInitials: response.data.sender?.name?.slice(0, 2).toUpperCase() || "?",
        content: response.data.message,
        timestamp: new Date(response.data.created_at),
      };

      setMessages((prev) => [...prev, newMessage]);

      Toast.show({
        type: "success",
        text1: "Message sent",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      Toast.show({
        type: "error",
        text1: "Failed to send message",
        text2: error.response?.data?.detail || "Please try again",
      });
      // Restore message text on error
      setMessageInput(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.userId === currentUserId;

    return (
      <View key={message.id} className="mb-3">
        {message.type === "text" && (
          <View
            className={`flex-row items-start ${
              isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isCurrentUser && (
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: "#8E486A" }}
              >
                <Text className="text-white font-semibold text-xs">
                  {message.userInitials}
                </Text>
              </View>
            )}

            <View
              className={`max-w-[75%] ${isCurrentUser ? "items-end" : "items-start"}`}
            >
              {!isCurrentUser && (
                <Text className="text-xs text-gray-500 mb-1">
                  {message.userName}
                </Text>
              )}
              <View
                className="px-4 py-2 rounded-2xl"
                style={{
                  backgroundColor: isCurrentUser ? "#8E486A" : "white",
                }}
              >
                <Text
                  style={{
                    color: isCurrentUser ? "#fff" : "#000",
                    fontSize: 14,
                  }}
                >
                  {message.content}
                </Text>
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                {formatTime(message.timestamp)}
              </Text>
            </View>

            {isCurrentUser && (
              <View
                className="w-8 h-8 rounded-full items-center justify-center ml-2"
                style={{ backgroundColor: "#8E486A" }}
              >
                <Text className="text-white font-semibold text-xs">
                  {message.userInitials}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#8E486A" />
        <Text className="mt-3 text-gray-600">Loading messages...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-200 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <Pressable onPress={onBack} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={24} color="#8E486A" />
          </Pressable>
          <View>
            <Text className="text-lg font-semibold">{tripTitle}</Text>
            <Text className="text-xs text-gray-500">Group Chat</Text>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <ScrollView ref={scrollRef} className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">No messages yet. Start the conversation!</Text>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollView>

      {/* Message Input */}
      <View className="p-4 bg-white border-t border-gray-200 flex-row items-center gap-2">
        <Pressable className="w-10 h-10 items-center justify-center">
          <Paperclip width={18} height={18} color="#9CA3AF" />
        </Pressable>

        <TextInput
          className="flex-1 h-11 rounded-full border border-gray-200 px-4 bg-white"
          placeholder="Type a message..."
          value={messageInput}
          onChangeText={setMessageInput}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
          placeholderTextColor="#9CA3AF"
          editable={!sending}
        />

        <Pressable
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: "#8E486A", opacity: sending || !messageInput.trim() ? 0.5 : 1 }}
          onPress={handleSendMessage}
          disabled={sending || !messageInput.trim()}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send width={18} height={18} color="#fff" />
          )}
        </Pressable>
      </View>

      <Toast />
    </SafeAreaView>
  );
}
