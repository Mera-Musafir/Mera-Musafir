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

// Mock data for trips (kept identical)
const mockTrips = [
  {
    id: "1",
    title: "Paris Adventure",
    location: "Paris, France",
    dates: "Dec 15-22, 2025",
    imageUrl:
      "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2MjU2ODg2NHww&ixlib=rb-4.1.0&q=80&w=1080",
    participants: 4,
    maxParticipants: 8,
    description:
      "Experience the magic of Paris during the holiday season! Explore iconic landmarks, indulge in French cuisine, and immerse yourself in art and culture. Perfect for first-time visitors and Paris lovers alike.",
    budget: "$1,200-1,800",
    duration: "7 days",
    tripType: "Cultural",
    participantsList: [
      { id: "1", name: "Sarah M.", initials: "SM" },
      { id: "2", name: "James K.", initials: "JK" },
      { id: "3", name: "Emma L.", initials: "EL" },
      { id: "4", name: "David R.", initials: "DR" },
    ],
    activities: [
      "Eiffel Tower",
      "Louvre Museum",
      "Seine River Cruise",
      "Montmartre",
      "Wine Tasting",
    ],
  },
  {
    id: "2",
    title: "Tokyo Exploration",
    location: "Tokyo, Japan",
    dates: "Jan 10-18, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1583915223588-7d88ebf23414?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGNpdHklMjBuaWdodHxlbnwxfHx8fDE3NjI2MDY5NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    participants: 6,
    maxParticipants: 10,
    description:
      "Discover the perfect blend of traditional and modern Japan. From ancient temples to neon-lit streets, experience the unique culture, amazing food, and warm hospitality of Tokyo.",
    budget: "$2,000-2,800",
    duration: "9 days",
    tripType: "Adventure",
    participantsList: [
      { id: "1", name: "Michael T.", initials: "MT" },
      { id: "2", name: "Lisa W.", initials: "LW" },
      { id: "3", name: "Robert H.", initials: "RH" },
      { id: "4", name: "Anna P.", initials: "AP" },
      { id: "5", name: "Chris B.", initials: "CB" },
      { id: "6", name: "Sophie N.", initials: "SN" },
    ],
    activities: [
      "Shibuya Crossing",
      "Senso-ji Temple",
      "Mt. Fuji Day Trip",
      "Tsukiji Market",
      "Akihabara",
    ],
  },
  {
    id: "3",
    title: "Bali Retreat",
    location: "Bali, Indonesia",
    dates: "Feb 5-14, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1729605410878-2538ab1fe658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwYmVhY2glMjB0cm9waWNhbHxlbnwxfHx8fDE3NjI2MzgyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    participants: 3,
    maxParticipants: 6,
    description:
      "Relax and rejuvenate in paradise. This wellness-focused trip combines beach time, yoga sessions, temple visits, and authentic Balinese experiences for the ultimate tropical getaway.",
    budget: "$1,400-2,000",
    duration: "10 days",
    tripType: "Relaxation",
    participantsList: [
      { id: "1", name: "Jessica A.", initials: "JA" },
      { id: "2", name: "Tom S.", initials: "TS" },
      { id: "3", name: "Maya K.", initials: "MK" },
    ],
    activities: [
      "Yoga Retreat",
      "Beach Hopping",
      "Temple Tours",
      "Surf Lessons",
      "Spa Day",
      "Rice Terraces",
    ],
  },
  {
    id: "4",
    title: "NYC Weekend",
    location: "New York, USA",
    dates: "Nov 28-Dec 1, 2025",
    imageUrl:
      "https://images.unsplash.com/photo-1570304816841-906a17d7b067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwc2t5bGluZXxlbnwxfHx8fDE3NjI1NDkzMjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    participants: 5,
    maxParticipants: 8,
    description:
      "Experience the city that never sleeps! A packed weekend featuring Broadway shows, world-class museums, diverse cuisine, and iconic landmarks. Perfect for a quick urban adventure.",
    budget: "$800-1,200",
    duration: "4 days",
    tripType: "City Break",
    participantsList: [
      { id: "1", name: "Alex D.", initials: "AD" },
      { id: "2", name: "Rachel G.", initials: "RG" },
      { id: "3", name: "Mark J.", initials: "MJ" },
      { id: "4", name: "Nina F.", initials: "NF" },
      { id: "5", name: "Kevin L.", initials: "KL" },
    ],
    activities: [
      "Broadway Show",
      "Central Park",
      "Times Square",
      "MoMA",
      "Brooklyn Bridge",
    ],
  },
];

export default function App() {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [trips, setTrips] = useState(mockTrips);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  const handleJoinChat = (chatId: number, tripTitle: string) => {
    // Navigate to GroupChat with chat_id
    setShowGroupChat(true);
    // Pass chat details to GroupChat component
    setSelectedChatId(chatId);
  };

  const handleCreateTrip = (tripData: any) => {
    console.log("New trip created:", tripData);
    setShowCreateTrip(false);
    Toast.show({
      type: "success",
      text1: "Trip created successfully!",
      text2: "Your trip is now available for travelers to join.",
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
                typeof activity === 'string' ? activity : activity.name
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
          <Text className="text-sm text-gray-500">
            {trips.length} trips
          </Text>
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
