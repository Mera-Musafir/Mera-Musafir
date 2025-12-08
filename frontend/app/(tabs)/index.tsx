import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Search, SlidersHorizontal, Plus } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { TripCard } from "../../components/TripCard";
import { TripDetails } from "../../components/TripDetails";
import { CreateTrip } from "../../components/CreateTrip";
import { GroupChat } from "../../components/GroupChat";
import api from "../../api/api";
import ExploreScreen from "./explore";
import { AppContext } from "../AppContext";

// Mock data for trips (kept identical)
const mockTrips = [];

export default function App() {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [trips, setTrips] = useState(mockTrips);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [showChatsList, setShowChatsList] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const openChatFromList = (chatId, tripId) => {
    setSelectedChatId(chatId);
    setSelectedTrip(tripId);
    setShowGroupChat(true);
  };

  const handleJoinChat = (chatId: number, tripTitle: string) => {
    // Navigate to GroupChat with chat_id
    setShowGroupChat(true);
    // Pass chat details to GroupChat component
    setSelectedChatId(chatId);
  };

  const handleCreateTrip = (tripData: any) => {
    console.log("New trip created:", tripData);

    setTrips((prev) => [...prev, tripData]);

    setShowCreateTrip(false);

    Toast.show({
      type: "success",
      text1: "Trip created successfully!",
      text2: "Your trip is now visible without reloading.",
    });
  };

  useEffect(() => {
    const getTrips = async () => {
      try {
        const response = await api.get("/trips");
        console.log("Fetched trips:", response.data);
        const tripsWithDefaults = response.data.map((trip: any) => ({
          ...trip,
          participantsList: trip.participantlist || [],
          activities: Array.isArray(trip.activities)
            ? trip.activities.map((activity: any) =>
                typeof activity === "string" ? activity : activity.name
              )
            : [],
        }));
        setTrips(tripsWithDefaults);
      } catch (error) {
        console.log("Error fetching trips:", error);

        if (error.response) {
          console.log("Status:", error.response.status);
          console.log("Data:", error.response.data);
        } else if (error.request) {
          console.log("Request sent but no response received");
        } else {
          console.log("Error setting up request:", error.message);
        }
      }
    };

    getTrips();
  }, []);

  const selectedTripData = trips.find((trip) => trip.id === selectedTrip);

  // Root-level Toast mounted below
  if (showCreateTrip) {
    return (
      <SafeAreaView className="flex-1">
        <CreateTrip
          onBack={() => setShowCreateTrip(false)}
          onCreateTrip={handleCreateTrip}
        />
        <Toast />
      </SafeAreaView>
    );
  }

  if (showGroupChat && selectedTripData) {
    return (
      <SafeAreaView className="flex-1">
        <GroupChat
          chatId={selectedChatId}
          tripId={selectedTripData.id}
          tripTitle={selectedTripData.title}
          onBack={() => {
            setShowGroupChat(false);
            setSelectedChatId(null);
          }}
        />
        <Toast />
      </SafeAreaView>
    );
  }

  if (selectedTripData) {
    return (
      <SafeAreaView className="flex-1">
        <TripDetails
          trip={selectedTripData}
          onBack={() => {
            setSelectedTrip(null);
            setShowGroupChat(false);
          }}
          onJoinChat={handleJoinChat}
        />
        <Toast />
      </SafeAreaView>
    );
  }

  if (showChatsList) {
    return (
      <SafeAreaView className="flex-1">
        <ExploreScreen
          onOpenChat={openChatFromList}
          onBack={() => setShowChatsList(false)}
        />
        <Toast />
      </SafeAreaView>
    );
  }

  // Main listing
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-12 pb-6 bg-[#8E486A]">
        <Text className="text-white text-2xl mb-2">Discover Trips</Text>
        <Text className="text-white/80">
          Find your next adventure with like-minded travelers
        </Text>

        {/* Search Bar */}
        <View className="mt-6 flex-row gap-3 items-center">
          <View className="flex-1 relative">
            <Search
              width={18}
              height={18}
              color="#9CA3AF"
              style={{ position: "absolute", left: 12, top: 14 }}
            />
            <TextInput
              placeholder="Search destinations..."
              className="pl-12 h-12 bg-white border-0 rounded-xl"
            />
          </View>

          <Pressable
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: "#fff" }}
          >
            <SlidersHorizontal width={18} height={18} color="#8E486A" />
          </Pressable>
        </View>
      </View>

      {/* Trips Grid */}
      <ScrollView className="px-5 py-6 pb-24">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold">Available Trips</Text>
          <Text className="text-sm text-gray-500">{trips.length} trips</Text>
        </View>

        <View className="space-y-4">
          {trips.map((trip) => (
            <View key={trip.id}>
              <TripCard {...trip} onClick={() => setSelectedTrip(trip.id)} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => setShowCreateTrip(true)}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: "#8E486A" }}
      >
        <Plus width={22} height={22} color="#fff" />
      </Pressable>

      {/* Toast mounted at root */}
      <Toast />
    </SafeAreaView>
  );
}
