import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  ArrowLeft,
  Send,
  Paperclip,
  MapPin,
  Clock,
  CheckCircle2,
  Plus,
  Edit2,
  X,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

interface ItineraryItem {
  id: number;
  chat_id: number;
  day: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  completed: boolean;
}

interface ItineraryFormData {
  day: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
}

export function GroupChat({ chatId, tripId, tripTitle, onBack }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "itinerary">("chat");
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([]);
  const [itineraryLoading, setItineraryLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [formData, setFormData] = useState<ItineraryFormData>({
    day: "",
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  // Load current user ID on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };
    loadCurrentUser();
  }, []);

  // Load messages on mount or when chatId changes
  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }
    loadMessages();
  }, [chatId]);

  // Load itineraries when component mounts
  useEffect(() => {
    if (!tripId) return;
    loadItineraries();
  }, [tripId]);

  // Auto-refresh messages every 3 seconds - ONLY if not loading
  useEffect(() => {
    if (!chatId) return;

    const interval = setInterval(() => {
      loadMessages(false); // Silent refresh
    }, 5000); // Increased from 3s to 5s to reduce API calls

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

  const loadItineraries = async () => {
    if (!chatId) return;
    try {
      setItineraryLoading(true);
      const response = await api.get(`/trips/chats/${chatId}/itinerary`);
      console.log("Fetched itineraries:", response.data);
      setItineraries(response.data);
    } catch (error) {
      console.error("Failed to load itineraries:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load itinerary",
        text2: "Please try again",
      });
    } finally {
      setItineraryLoading(false);
    }
  };

  // Load itineraries when chat ID changes
  useEffect(() => {
    if (!chatId) return;
    loadItineraries();
  }, [chatId]);

  const resetForm = () => {
    setFormData({
      day: "",
      title: "",
      description: "",
      location: "",
      start_time: "",
      end_time: "",
    });
    setEditingItem(null);
  };

  const handleAddItem = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditItem = (item: ItineraryItem) => {
    setFormData({
      day: item.day.toString(),
      title: item.title,
      description: item.description,
      location: item.location,
      start_time: item.start_time,
      end_time: item.end_time,
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSubmitForm = async () => {
    if (!formData.day.trim() || !formData.title.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in day and title",
      });
      return;
    }

    if (!chatId) return;

    setSubmitting(true);
    try {
      const payload = {
        day: parseInt(formData.day),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_time: formData.start_time,
        end_time: formData.end_time,
      };

      if (editingItem) {
        // Update existing item
        await api.patch(`/trips/chats/${chatId}/itinerary/${editingItem.id}`, payload);
        Toast.show({
          type: "success",
          text1: "Itinerary Updated",
          text2: "Item has been updated successfully",
        });
      } else {
        // Create new item
        await api.post(`/trips/chats/${chatId}/itinerary`, payload);
        Toast.show({
          type: "success",
          text1: "Itinerary Added",
          text2: "New item has been added successfully",
        });
      }

      // Reload itineraries
      await loadItineraries();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Failed to save itinerary:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Save",
        text2: error.response?.data?.detail || "Please try again",
      });
    } finally {
      setSubmitting(false);
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
                  backgroundColor: isCurrentUser ? "#10B981" : "white",
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
                style={{ backgroundColor: "#10B981" }}
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

  const renderItineraryItem = (item: ItineraryItem) => {
    return (
      <View key={item.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: "#8E486A20" }}
              >
                <Text className="text-xs font-semibold" style={{ color: "#8E486A" }}>
                  Day {item.day}
                </Text>
              </View>
              {item.completed && (
                <CheckCircle2 size={16} color="#10B981" />
              )}
            </View>
            <Text className="text-lg font-semibold text-gray-800 mb-1">
              {item.title}
            </Text>
          </View>
          <Pressable
            onPress={() => handleEditItem(item)}
            className="p-2"
          >
            <Edit2 size={18} color="#8E486A" />
          </Pressable>
        </View>

        {item.description && (
          <Text className="text-gray-600 text-sm mb-3">
            {item.description}
          </Text>
        )}

        <View className="flex-col gap-2">
          {item.location && (
            <View className="flex-row items-center gap-2">
              <MapPin size={14} color="#8E486A" />
              <Text className="text-sm text-gray-600">{item.location}</Text>
            </View>
          )}
          {item.start_time && (
            <View className="flex-row items-center gap-2">
              <Clock size={14} color="#8E486A" />
              <Text className="text-sm text-gray-600">
                {item.start_time}
                {item.end_time && ` - ${item.end_time}`}
              </Text>
            </View>
          )}
        </View>

        {item.completed && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <Text className="text-xs font-semibold text-green-600">
              ✓ Completed
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Memoize rendered messages to prevent re-renders
  const renderedMessages = React.useMemo(
    () => messages.map(renderMessage),
    [messages, currentUserId]
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#8E486A" />
        <Text className="mt-3 text-gray-600">Loading...</Text>
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
            <Text className="text-xs text-gray-500">
              {activeTab === "chat" ? "Group Chat" : "Itinerary"}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Switcher */}
      <View className="px-5 py-4 bg-white border-b border-gray-200 flex-row gap-4">
        <Pressable
          onPress={() => setActiveTab("chat")}
          className="flex-1 pb-3 border-b-2"
          style={{
            borderBottomColor: activeTab === "chat" ? "#8E486A" : "transparent",
          }}
        >
          <Text
            className="text-center font-semibold"
            style={{
              color: activeTab === "chat" ? "#8E486A" : "#9CA3AF",
            }}
          >
            Chat
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("itinerary")}
          className="flex-1 pb-3 border-b-2"
          style={{
            borderBottomColor: activeTab === "itinerary" ? "#8E486A" : "transparent",
          }}
        >
          <Text
            className="text-center font-semibold"
            style={{
              color: activeTab === "itinerary" ? "#8E486A" : "#9CA3AF",
            }}
          >
            Itinerary
          </Text>
        </Pressable>
      </View>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <>
          <ScrollView ref={scrollRef} className="flex-1 px-4 py-4">
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-gray-500">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            ) : (
              renderedMessages
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
              style={{
                backgroundColor: "#10B981",
                opacity: sending || !messageInput.trim() ? 0.5 : 1,
              }}
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
        </>
      )}

      {/* Itinerary Tab */}
      {activeTab === "itinerary" && (
        <>
          <View className="px-5 py-4 bg-white border-b border-gray-200 flex-row justify-end">
            <Pressable
              onPress={handleAddItem}
              className="flex-row items-center gap-2 px-4 py-2 rounded-lg"
              style={{ backgroundColor: "#8E486A" }}
            >
              <Plus size={18} color="#fff" />
              <Text className="text-white font-semibold">Add Item</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5 py-4">
            {itineraryLoading ? (
              <View className="flex-1 items-center justify-center py-8">
                <ActivityIndicator size="large" color="#8E486A" />
                <Text className="mt-3 text-gray-600">Loading itinerary...</Text>
              </View>
            ) : itineraries.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-500 text-center mb-4">
                  No itinerary items yet. {"\n"}
                  Create activities to build your trip plan!
                </Text>
                <Pressable
                  onPress={handleAddItem}
                  className="flex-row items-center gap-2 px-4 py-2 rounded-lg"
                  style={{ backgroundColor: "#8E486A" }}
                >
                  <Plus size={18} color="#fff" />
                  <Text className="text-white font-semibold">Create First Item</Text>
                </Pressable>
              </View>
            ) : (
              <View className="pb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-4">
                  Trip Itinerary
                </Text>
                {itineraries
                  .sort((a, b) => a.day - b.day)
                  .map(renderItineraryItem)}
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* Modal Header */}
          <View className="px-5 py-4 bg-white border-b border-gray-200 flex-row items-center justify-between">
            <Text className="text-lg font-semibold">
              {editingItem ? "Edit Activity" : "Add Activity"}
            </Text>
            <Pressable onPress={() => setShowAddModal(false)}>
              <X size={24} color="#8E486A" />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView className="flex-1 px-5 py-4">
            {/* Day Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Day *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="e.g., 1, 2, 3..."
                keyboardType="numeric"
                value={formData.day}
                onChangeText={(text) => setFormData({ ...formData, day: text })}
              />
            </View>

            {/* Title Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Title *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="e.g., Eiffel Tower Visit"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            {/* Description Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white h-20"
                placeholder="Details about this activity..."
                multiline
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            {/* Location Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Location
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="e.g., Eiffel Tower, Paris"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
            </View>

            {/* Start Time Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Start Time
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="e.g., 09:00 AM"
                value={formData.start_time}
                onChangeText={(text) => setFormData({ ...formData, start_time: text })}
              />
            </View>

            {/* End Time Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                End Time
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="e.g., 12:30 PM"
                value={formData.end_time}
                onChangeText={(text) => setFormData({ ...formData, end_time: text })}
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmitForm}
              disabled={submitting}
              className="h-14 rounded-lg items-center justify-center mb-4"
              style={{
                backgroundColor: "#8E486A",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {editingItem ? "Update Activity" : "Add Activity"}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}
