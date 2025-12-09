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
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import Toast from "react-native-toast-message";
import api from "../api/api";

interface SignupScreenProps {
  onSignupSuccess: () => void;
  onNavigateToLogin: () => void;
}

export function SignupScreen({ onSignupSuccess, onNavigateToLogin }: SignupScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Don't Match",
        text2: "Please make sure your passwords match",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Signup successful:", response.data);

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: `Welcome ${response.data.name}`,
      });

      onSignupSuccess();
    } catch (error: any) {
      console.error("Signup failed:", error);
      
      // Extract error message properly
      let errorMessage = "Please try again";
      
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
        text1: "Signup Failed",
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
        <View className="flex-row items-center mb-8 mt-4">
          <Pressable
            onPress={onNavigateToLogin}
            disabled={loading}
            className="p-2"
          >
            <ArrowLeft size={24} color="#8E486A" />
          </Pressable>
          <Text className="text-2xl font-bold ml-4 text-gray-800">
            Create Account
          </Text>
        </View>

        {/* Signup Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          {/* Name Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Full Name
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
              <User size={20} color="#8E486A" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                editable={!loading}
                autoCapitalize="words"
              />
            </View>
          </View>

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
          <View className="mb-5">
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
            <Text className="text-xs text-gray-500 mt-1">
              At least 6 characters
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
              <Lock size={20} color="#8E486A" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-2"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Signup Button */}
          <Pressable
            onPress={handleSignup}
            disabled={loading}
            className="h-14 rounded-lg items-center justify-center"
            style={{
              backgroundColor: "#8E486A",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Create Account
              </Text>
            )}
          </Pressable>
        </View>

        {/* Login Link */}
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-gray-600">Already have an account?</Text>
          <Pressable onPress={onNavigateToLogin} disabled={loading}>
            <Text
              className="font-semibold"
              style={{ color: "#8E486A" }}
            >
              Login!
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}
