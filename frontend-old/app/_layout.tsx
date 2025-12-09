import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { SignupScreen } from "@/components/SignupScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const unstable_settings = {
  anchor: "(tabs)",
};

type AuthScreen = "login" | "signup" | null;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          // User is logged in
          setAuthScreen(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = async () => {
    setAuthScreen(null);
  };


  const handleSignupSuccess = async () => {
    setAuthScreen("login"); 
  };

  if (isLoading) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    );
  }

  // Show auth screens
  if (authScreen === "login") {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToSignup={() => setAuthScreen("signup")}
        />
        <Toast />
      </>
    );
  }

  if (authScreen === "signup") {
    return (
      <>
        <SignupScreen
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={() => setAuthScreen("login")}
        />
        <Toast />
      </>
    );
  }

  // Show main app
  return (
    <>
      <AuthContext.Provider value={{ logout: handleLogout }}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
        <Toast />
      </AuthContext.Provider>
    </>
  );
}
