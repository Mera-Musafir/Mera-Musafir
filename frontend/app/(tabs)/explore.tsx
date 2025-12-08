import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import api from "../../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";

export default function ExploreScreen({ onOpenChat, onLogout }) {
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    try {
      const response = await api.get("/trips/chats");
      setChats(response.data);
    } catch (error) {
      console.log("Failed to load chats:", error);
    }
  };

  

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <View className="flex-1 bg-white p-4">

      <Text className="text-xl font-bold mb-3">Your Group Chats</Text>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <div
            className="p-4 border-b border-gray-200"
            onPress={() => onOpenChat(item.id, item)}
          >
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-500">{item.members.length} members</Text>
          </div>
        )}
      />

      {/* Logout button */}
      
    </View>
  );
}
