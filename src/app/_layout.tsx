import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "../store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { checkAuthSession } from "../store/slices/authSlice";
import { loadFavourites } from "../store/slices/favouritesSlice";
import { loadSavedCity } from "../store/slices/locationSlice";
import { initSocket, disconnectSocket } from "../services/socket";
import { AuthModal } from "../components/common/AuthModal";
import { LocationModal } from "../components/common/LocationModal";

function AppContent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Check saved session on app startup
    dispatch(checkAuthSession());
    dispatch(loadFavourites());
    dispatch(loadSavedCity());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      initSocket().catch((err) => {
        console.warn("Socket initialization non-fatal:", err);
      });
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="my-ads" options={{ headerShown: false }} />
        <Stack.Screen name="favourites" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      </Stack>

      {/* Global Modals accessible anywhere */}
      <AuthModal />
      <LocationModal />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
