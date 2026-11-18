import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
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
import { THEME } from "../constants/theme";

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync().catch(() => {});

// Global interception of OAuth callback sessions
WebBrowser.maybeCompleteAuthSession();

function AppContent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [appIsReady, setAppIsReady] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load essential session & persisted user preferences
        await Promise.allSettled([
          dispatch(checkAuthSession()).unwrap(),
          dispatch(loadFavourites()).unwrap(),
          dispatch(loadSavedCity()).unwrap(),
        ]);
      } catch (e) {
        console.warn("App initialization non-fatal:", e);
      } finally {
        // Hide the native splash screen
        await SplashScreen.hideAsync().catch(() => {});

        // Graceful fade transition out of splash screen
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          setAppIsReady(true);
        });
      }
    }

    prepare();
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
    <View style={styles.rootContainer}>
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
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="safety-tips" options={{ headerShown: false }} />
        <Stack.Screen
          name="oauth2redirect"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="oauthredirect"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </Stack>

      {/* Global Modals accessible anywhere */}
      <AuthModal />
      <LocationModal />

      {/* Branded In-App Splash Overlay with Smooth Fade Out */}
      {!appIsReady && (
        <Animated.View
          pointerEvents="none"
          style={[styles.splashOverlay, { opacity: fadeAnim }]}
        >
          <View style={styles.splashContent}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../../assets/images/dealdoko-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.taglineWrap}>
              <Text style={styles.taglineText}>
                Buy & Sell Everything Across Nepal
              </Text>
            </View>
            <ActivityIndicator
              size="small"
              color="#FF6A00"
              style={{ marginTop: 24 }}
            />
          </View>
          <View style={styles.splashFooter}>
            <Text style={styles.footerBrand}>DealDoko Nepal</Text>
            <Text style={styles.footerVersion}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      )}
    </View>
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

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  splashOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0047BA",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    zIndex: 9999,
  },
  splashContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 240,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  taglineWrap: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginTop: 8,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  splashFooter: {
    alignItems: "center",
    gap: 4,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  footerVersion: {
    fontSize: 11,
    color: "#93C5FD",
    fontWeight: "500",
  },
});
