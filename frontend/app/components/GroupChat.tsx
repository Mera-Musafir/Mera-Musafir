import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  Users,
  MessageCircle,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
} from "lucide-react";

const GroupChat = ({ chatId, tripId, onBack }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Itinerary states
  const [itinerary, setItinerary] = useState([]);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    day: 1,
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userId"));
      setUserName(localStorage.getItem("userName"));
      setUserLoaded(true); // <-- must set this
    }
  }, []);

  useEffect(() => {
    if (!userLoaded || !userId) return; // <-- wait for user to be ready

    fetchChatDetails();
    fetchMessages();
    fetchItinerary();

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId, userLoaded, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatDetails = async () => {
    try {
      const response = await fetch(
        `https://backend-production-b554.up.railway.app/trips/chats/${chatId}`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat details");
      }

      const data = await response.json();
      setChat(data);
    } catch (err) {
      setError("Failed to load chat details");
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://backend-production-b554.up.railway.app/trips/chats/${chatId}/messages?skip=0&limit=50`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch(
        `https://backend-production-b554.up.railway.app/trips/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({
            message: messageText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setMessageText("");
      await fetchMessages();
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Itinerary functions
  const fetchItinerary = async () => {
    setItineraryLoading(true);
    try {
      const response = await fetch(
        `https://backend-production-b554.up.railway.app/trips/chats/${chatId}/itinerary`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch itinerary");
      }

      const data = await response.json();
      setItinerary(
        data.sort(
          (a, b) => a.day - b.day || a.start_time.localeCompare(b.start_time)
        )
      );
    } catch (err) {
      console.error("Failed to load itinerary:", err);
    } finally {
      setItineraryLoading(false);
    }
  };

  const handleAddItinerary = async () => {
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(
        `https://backend-production-b554.up.railway.app/trips/chats/${chatId}/itinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add itinerary item");
      }

      await fetchItinerary();
      setShowAddModal(false);
      resetForm();
      setError("");
    } catch (err) {
      setError("Failed to add itinerary item");
      console.error(err);
    }
  };

  const handleEditItinerary = async () => {
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(
        `https://backend-production-b554.up.railway.app/trips/chats/${chatId}/itinerary/${editingItem.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit itinerary item");
      }

      await fetchItinerary();
      setEditingItem(null);
      resetForm();
      setError("");
    } catch (err) {
      setError("Failed to edit itinerary item");
      console.error(err);
    }
  };

  const handleDeleteItinerary = async (itemId) => {
    if (!confirm("Are you sure you want to delete this itinerary item?"))
      return;

    try {
      const response = await fetch(
        `https://backend-production-b554.up.railway.app/trips/chats/${chatId}/itinerary/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete itinerary item");
      }

      await fetchItinerary();
    } catch (err) {
      setError("Failed to delete itinerary item");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      day: 1,
      title: "",
      description: "",
      location: "",
      start_time: "",
      end_time: "",
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      day: item.day,
      title: item.title,
      description: item.description || "",
      location: item.location || "",
      start_time: item.start_time,
      end_time: item.end_time,
    });
  };

  const groupByDay = (items) => {
    return items.reduce((acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = [];
      }
      acc[item.day].push(item);
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              {activeTab === "chat" ? (
                <MessageCircle className="w-6 h-6" />
              ) : (
                <Calendar className="w-6 h-6" />
              )}
              {chat?.name || "Group Chat"}
            </h1>
          </div>

          <button
            onClick={() => {}}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <Users className="w-5 h-5" />
            {chat?.members?.length || 0}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 pb-4">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "chat"
                  ? "bg-white text-purple-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => {
                setActiveTab("itinerary");
                fetchItinerary();
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "itinerary"
                  ? "bg-white text-purple-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Itinerary
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chat" ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <div className="bg-red-50/20 border border-red-400/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-96 text-center">
                <div>
                  <MessageCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isOwnMessage = msg.sender_id === userId;
                  return (
                    <div
                      key={idx}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none"
                            : "bg-white/95 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        {!isOwnMessage && (
                          <p className="text-xs font-bold mb-1 opacity-70">
                            {msg.sender?.name || "Unknown"}
                          </p>
                        )}
                        <p className="break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-2 ${
                            isOwnMessage ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <div className="bg-red-50/20 border border-red-400/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Trip Itinerary</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </div>

            {itineraryLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : itinerary.length === 0 ? (
              <div className="flex items-center justify-center min-h-96 text-center">
                <div>
                  <Calendar className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">
                    No itinerary items yet. Add your first item!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupByDay(itinerary)).map(([day, items]) => (
                  <div
                    key={day}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">
                      Day {day}
                    </h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/90 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-purple-900">
                                {item.title}
                              </h4>
                              <p className="text-sm text-purple-700">
                                {item.start_time} - {item.end_time}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4 text-purple-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteItinerary(item.id)}
                                className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                          {item.location && (
                            <p className="text-sm text-gray-700 mb-2">
                              📍 {item.location}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Input (only show for chat tab) */}
      {activeTab === "chat" && (
        <div className="bg-white/10 backdrop-blur-md border-t border-white/20 sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 placeholder:text-[#666] text-black bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-lg outline-none focus:border-white/50 transition-all backdrop-blur-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageText.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
              >
                {sendingMessage ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-purple-900">
                {editingItem ? "Edit Item" : "Add Itinerary Item"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Day *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.day}
                  onChange={(e) =>
                    setFormData({ ...formData, day: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border placeholder:text-[#666] text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border placeholder:text-[#666] text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border placeholder:text-[#666] text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="w-full px-4 py-2 border placeholder:text-[#666] text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="w-full px-4 py-2 border placeholder:text-[#666] text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border placeholder:text-[#666] text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  rows="3"
                />
              </div>

              <button
                onClick={editingItem ? handleEditItinerary : handleAddItinerary}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingItem ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
