import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { THEME } from "../constants/theme";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loginWithGoogle,
  setAuthModalVisible,
} from "../store/slices/authSlice";

// Complete auth session if openBrowserAsync is waiting
WebBrowser.maybeCompleteAuthSession();

export default function OAuth2RedirectScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
    access_token?: string;
    id_token?: string;
  }>();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authError = useAppSelector((state) => state.auth.error);

  const [statusMessage, setStatusMessage] = useState(
    "Signing you in with Google..."
  );
  const [hasError, setHasError] = useState(false);
  const hasDispatchedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function handleRedirect() {
      // 1. Notify WebBrowser session
      WebBrowser.maybeCompleteAuthSession();

      // 2. Check for OAuth error in callback params
      if (params.error) {
        if (isMounted) {
          setHasError(true);
          setStatusMessage(
            params.error_description ||
              params.error ||
              "Google sign-in was canceled or failed."
          );
        }
        setTimeout(() => {
          if (isMounted) {
            dispatch(setAuthModalVisible(false));
            router.replace("/(tabs)");
          }
        }, 1800);
        return;
      }

      // 3. If already authenticated by active modal hook, return to app
      if (isAuthenticated) {
        dispatch(setAuthModalVisible(false));
        router.replace("/(tabs)");
        return;
      }

      // 4. If code or token is present and not yet dispatched directly
      const code = params.code;
      const accessToken = params.access_token;
      const idToken = params.id_token;

      if ((code || accessToken || idToken) && !hasDispatchedRef.current) {
        hasDispatchedRef.current = true;
        try {
          if (isMounted) {
            setStatusMessage("Verifying your Google account...");
          }

          // If accessToken is present, fetch basic user profile
          let userInfo = null;
          if (accessToken) {
            try {
              const uRes = await fetch(
                "https://www.googleapis.com/userinfo/v2/me",
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }
              );
              if (uRes.ok) {
                userInfo = await uRes.json();
              }
            } catch (uErr) {
              console.warn("Could not fetch userinfo directly:", uErr);
            }
          }

          await dispatch(
            loginWithGoogle({
              code,
              accessToken,
              idToken,
              credential: idToken,
              userInfo: userInfo
                ? {
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    sub: userInfo.id,
                  }
                : undefined,
            })
          ).unwrap();

          dispatch(setAuthModalVisible(false));
          if (isMounted) {
            router.replace("/(tabs)");
          }
        } catch (err: any) {
          console.warn("OAuth direct completion error:", err);
          // If background listener already processed or failed, wait briefly then route
          setTimeout(() => {
            if (isMounted) {
              dispatch(setAuthModalVisible(false));
              router.replace("/(tabs)");
            }
          }, 1200);
        }
      } else {
        // Fallback: Give state 800ms to reconcile then go home
        const timer = setTimeout(() => {
          if (isMounted) {
            dispatch(setAuthModalVisible(false));
            router.replace("/(tabs)");
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    handleRedirect();

    return () => {
      isMounted = false;
    };
  }, [
    params.code,
    params.access_token,
    params.id_token,
    params.error,
    isAuthenticated,
  ]);

  // If redux state reports authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(setAuthModalVisible(false));
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/dealdoko-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="large"
        color={THEME.colors.primary}
        style={styles.loader}
      />
      <Text style={[styles.text, hasError && styles.errorText]}>
        {hasError ? statusMessage : authError || statusMessage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    width: 190,
    height: 60,
    marginBottom: 28,
  },
  loader: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
    maxWidth: 280,
  },
  errorText: {
    color: THEME.colors.danger,
  },
});
