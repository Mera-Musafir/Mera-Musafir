import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
} from "lucide-react-native";

interface Message {
  id: string;
  type: "text" | "system" | "poll" | "activity";
  userId: string;
  userName: string;
  userInitials: string;
  content: string;
  timestamp: Date;
  pollOptions?: { option: string; votes: string[] }[];
  activityDetails?: {
    name: string;
    date: string;
    location: string;
    confirmed: boolean;
  };
}

interface GroupChatProps {
  tripId: string;
  tripTitle: string;
  onBack: () => void;
}

export function GroupChat({ tripId, tripTitle, onBack }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentUserId] = useState("1");
  const [activeTab, setActiveTab] = useState<"chat" | "itinerary">("chat");

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "text",
      userId: currentUserId,
      userName: "Sarah M.",
      userInitials: "SM",
      content: messageInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
  };

  const handleVote = (messageId: string, optionIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.pollOptions) {
          const newOptions = msg.pollOptions.map((opt, idx) => {
            if (idx === optionIndex) {
              const hasVoted = opt.votes.includes(currentUserId);
              return {
                ...opt,
                votes: hasVoted
                  ? opt.votes.filter((id) => id !== currentUserId)
                  : [...opt.votes, currentUserId],
              };
            }
            return {
              ...opt,
              votes: opt.votes.filter((id) => id !== currentUserId),
            };
          });
          return { ...msg, pollOptions: newOptions };
        }
        return msg;
      })
    );
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.userId === currentUserId;
    return (
        <View key={message.id} className="mb-3">
          {message.type === "system" && (
            <View className="flex-row justify-center my-3">
              {" "}
              <Text className="px-4 py-2 rounded-full bg-gray-100 text-xs text-gray-600 text-center">
                {message.content}{" "}
              </Text>{" "}
            </View>
          )}
          ```
          {message.type === "text" && (
            <View
              className={`flex-row items-start ${isCurrentUser ? "justify-end" : "justify-start"}`}
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
                className={`max-w-[75%] mb-1  ${isCurrentUser ? "items-end" : "items-start"}`}
              >
                {!isCurrentUser && (
                  <Text className="text-xs  text-gray-500 mb-1">
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
          {message.type === "poll" && message.pollOptions && (
            <View className="mb-4 mx-2">
              <View className="flex-row gap-2 mb-2 items-start">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#8E486A" }}
                >
                  <Text className="text-white font-semibold text-xs">
                    {message.userInitials}
                  </Text>
                </View>

                <View className="flex-1">
                  <View
                    className="bg-white rounded-2xl p-4 border-2"
                    style={{ borderColor: "#8E486A40" }}
                  >
                    <Text className="mb-2 font-semibold">
                      {message.userName} – Poll
                    </Text>
                    <Text className="mb-3">{message.content}</Text>
                    {message.pollOptions.map((opt, idx) => {
                      const hasVoted = opt.votes.includes(currentUserId);
                      const totalVotes =
                        message.pollOptions?.reduce(
                          (sum, o) => sum + o.votes.length,
                          0
                        ) || 0;
                      const percentage =
                        totalVotes > 0
                          ? (opt.votes.length / totalVotes) * 100
                          : 0;
                      return (
                        <Pressable
                          key={idx}
                          onPress={() => handleVote(message.id, idx)}
                          className="mb-2 rounded-xl border overflow-hidden"
                          style={{
                            borderColor: hasVoted ? "#8E486A" : "#e5e7eb",
                          }}
                        >
                          <View
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${percentage}%`,
                              backgroundColor: "#8E486A20",
                            }}
                          />
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: 10,
                            }}
                          >
                            <Text>{opt.option}</Text>
                            <View className="flex-row items-center gap-2">
                              <Text className="text-xs text-gray-500">
                                {opt.votes.length}
                              </Text>
                              {hasVoted && (
                                <CheckCircle2
                                  width={16}
                                  height={16}
                                  color="#8E486A"
                                />
                              )}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                    <Text className="text-xs text-gray-400 mt-2">
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          {message.type === "activity" && message.activityDetails && (
            <View className="mb-4 mx-2">
              <View className="flex-row gap-2">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#8E486A" }}
                >
                  <Text className="text-white font-semibold text-xs">
                    {message.userInitials}
                  </Text>
                </View>

                <View className="flex-1">
                  <View
                    className="bg-white rounded-2xl p-4 border-2"
                    style={{ borderColor: "#763E5940" }}
                  >
                    <Text className="font-semibold text-base mb-1">
                      {message.activityDetails.name}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Calendar width={14} height={14} />
                      <Text>{message.activityDetails.date}</Text>
                    </View>
                    <View className="flex-row items-center gap-2 mt-1">
                      <MapPin width={14} height={14} />
                      <Text>{message.activityDetails.location}</Text>
                    </View>
                    {message.activityDetails.confirmed && (
                      <View className="flex-row items-center gap-2 mt-2">
                        <CheckCircle2 width={14} height={14} color="#8E486A" />
                        <Text style={{ color: "#8E486A" }}>Confirmed</Text>
                      </View>
                    )}
                    <Text className="text-xs text-gray-400 mt-2">
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header and Tabs omitted for brevity: same as previous rewrite */}
      {/* Chat */}
      {activeTab === "chat" && (
        <View className="flex-1">
          {" "}
          <ScrollView ref={scrollRef} className="flex-1 px-4 py-4">
            {messages.map(renderMessage)}
          </ScrollView>{" "}
          <View className="p-4 bg-white border-t border-gray-200 flex-row items-center">
            {" "}
            <Pressable className="w-10 h-10 items-center justify-center">
              <Paperclip width={18} height={18} color="#9CA3AF" />
            </Pressable>{" "}
            <TextInput
              className="flex-1 h-11 rounded-full border px-4 ml-2 bg-white"
              placeholder="Type a message..."
              value={messageInput}
              onChangeText={setMessageInput}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              className="w-11 h-11 ml-2 rounded-full items-center justify-center"
              style={{ backgroundColor: "#8E486A" }}
              onPress={handleSendMessage}
            >
              <Send width={18} height={18} color="#fff" />
            </Pressable>{" "}
          </View>{" "}
        </View>
      )}

      {/* Itinerary placeholder (optional) */}
      {activeTab === "itinerary" && (
        <ScrollView className="flex-1 px-5 py-4">
          <Text>Itinerary content goes here</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
