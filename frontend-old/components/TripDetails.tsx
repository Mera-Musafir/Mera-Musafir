import React, { useState } from "react";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  DollarSign,
  Clock,
} from "lucide-react-native";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { TouchableOpacity, Pressable, Text, View, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import api from "../api/api";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
}

interface TripDetailsProps {
  trip: {
    id: string | number;
    title: string;
    location: string;
    dates: string;
    imageUrl: string;
    participants: number;
    maxparticipants: number;
    description: string;
    budget: string;
    duration: string;
    triptype: string;
    participantsList: Participant[];
    activities: string[];
  };
  onBack: () => void;
  onJoinChat: (chatId: number, tripTitle: string) => void;
}

export function TripDetails({ trip, onBack, onJoinChat }: TripDetailsProps) {
  const [isJoiningChat, setIsJoiningChat] = useState(false);

  const handleJoinChat = async () => {
    setIsJoiningChat(true);
    try {
      const response = await api.post(`/trips/${trip.id}/join-chat`);
      const { chat_id } = response.data;

      Toast.show({
        type: "success",
        text1: "Successfully joined!",
        text2: response.data.message,
      });

      onJoinChat(chat_id, trip.title);
    } catch (error) {
      console.error("Failed to join chat:", error);
      Toast.show({
        type: "error",
        text1: "Failed to join chat",
        text2: error.response?.data?.detail || "Please try again",
      });
    } finally {
      setIsJoiningChat(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="relative h-72">
        <ImageWithFallback
          src={trip.imageUrl}
          alt={trip.title}
          className="w-full h-full"
        />

        {/* Back Button */}
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow"
        >
          <ArrowLeft size={20} color="#8E486A" />
        </Pressable>

        {/* Gradient Overlay */}
        <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      </View>

      <ScrollView className="px-5 mt-6 mb-20">
        <View className="bg-white rounded-2xl shadow-lg p-5">
          {/* Title & Trip Type */}
          <View className="flex-row items-start justify-between mb-3">
            <Text className="flex-1 text-lg font-semibold">{trip.title}</Text>
            <View
              className="ml-2 px-3 py-1 rounded-full"
              style={{ backgroundColor: "#8E486A" }}
            >
              <Text className="text-white text-xs font-semibold">
                {trip.triptype}
              </Text>
            </View>
          </View>

          {/* Key Info Grid */}
          <View className="flex flex-row flex-wrap justify-between mb-5">
            {[
              { icon: MapPin, label: "Location", value: trip.location },
              { icon: Calendar, label: "Dates", value: trip.dates },
              { icon: Clock, label: "Duration", value: trip.duration },
              { icon: DollarSign, label: "Budget", value: trip.budget },
            ].map((info, index) => (
              <View
                key={index}
                className="w-[48%] flex-row items-center gap-2 mb-3"
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#8E486A20" }}
                >
                  <info.icon size={20} color="#8E486A" />
                </View>
                <View>
                  <Text className="text-xs text-gray-500">{info.label}</Text>
                  <Text className="text-sm">{info.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="mb-2 font-semibold">About This Trip</Text>
            <Text className="text-gray-600">{trip.description}</Text>
          </View>

          {/* Activities */}
          {trip.activities.length > 0 && (
            <View className="mb-5">
              <Text className="mb-3 font-semibold">Planned Activities</Text>
              <View className="flex-row flex-wrap gap-2">
                {trip.activities.map((activity, index) => (
                  <Text
                    key={index}
                    className="px-3 py-1.5 rounded-full text-sm"
                    style={{ backgroundColor: "#763E5920", color: "#763E59" }}
                  >
                    {activity}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Participants */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-semibold">
                Travelers ({trip.participants}/{trip.maxparticipants})
              </Text>
              <Text className="text-sm text-gray-500">
                {trip.maxparticipants - trip.participants} spots left
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {trip.participantsList.map((participant) => (
                <View key={participant.id} className="flex-row items-center gap-2">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: "#8E486A" }}
                  >
                    <Text className="text-white font-semibold">
                      {participant.initials}
                    </Text>
                  </View>
                  <Text className="text-sm">{participant.name}</Text>
                </View>
              ))}

              {Array.from({ length: trip.maxparticipants - trip.participants }).map(
                (_, index) => (
                  <View key={`empty-${index}`} className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 items-center justify-center"
                    >
                      <Users size={20} color="#A0A0A0" />
                    </View>
                  </View>
                )
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Join Button */}
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-[#8E486A] border-t border-gray-200">
        <Pressable
          onPress={handleJoinChat}
          disabled={isJoiningChat}
          style={({ pressed }) => [
            { opacity: pressed || isJoiningChat ? 0.7 : 1, backgroundColor: "#8E486A" },
          ]}
          className="w-full h-14 rounded-xl flex-row items-center justify-center gap-2"
        >
          <MessageCircle size={20} color="#FFF" />
          <Text className="text-white text-base font-semibold">
            {isJoiningChat ? "Joining..." : "Join Group Chat"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
