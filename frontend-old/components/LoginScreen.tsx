import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToSignup: () => void;
}

export function LoginScreen({ onLoginSuccess, onNavigateToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter both email and password",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Login successful:", response.data);

      Toast.show({
        type: "success",
        text1: "Welcome!",
        text2: `Hello ${response.data.name}`,
      });

      // Store user data in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(response.data));
      await AsyncStorage.setItem("user_id", response.data.id);

      onLoginSuccess();
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Extract error message properly
      let errorMessage = "Invalid email or password";
      
      if (error.response?.data?.detail) {
        // Handle string detail message
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Handle validation error array
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg || err)
            .join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        {/* Header */}
        <View className="flex-1 justify-center">
          <View className="mb-12">
            <Text className="text-4xl font-bold mb-2" style={{ color: "#8E486A" }}>
              Mera Musafir
            </Text>
            <Text className="text-lg text-gray-600">
              Discover trips, meet travelers
            </Text>
          </View>

          {/* Login Form */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <Text className="text-2xl font-bold mb-6 text-gray-800">
              Sign In
            </Text>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <Mail size={20} color="#8E486A" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <Lock size={20} color="#8E486A" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className="h-14 rounded-lg items-center justify-center mb-4"
              style={{
                backgroundColor: "#8E486A",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Sign In
                </Text>
              )}
            </Pressable>

            {/* Forgot Password */}
            <Pressable className="items-center py-3">
              <Text className="text-sm text-gray-600">
                Forgot your password?
              </Text>
            </Pressable>
          </View>

          {/* Signup Link */}
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-gray-600">New account?</Text>
            <Pressable onPress={onNavigateToSignup} disabled={loading}>
              <Text
                className="font-semibold"
                style={{ color: "#8E486A" }}
              >
                Signup!
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-4">
          <Text className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service
          </Text>
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}
