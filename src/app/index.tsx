import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { THEME } from "../constants/theme";

const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to (tabs) after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)" as any);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {/* DealDoko Brand Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../../assets/images/dealdoko-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Nepal Tagline Badge */}
        <View style={styles.taglineWrap}>
          <Text style={styles.taglineText}>
            Buy & Sell Everything Across Nepal
          </Text>
        </View>

        {/* Brand Accent Loader */}
        <ActivityIndicator
          size="small"
          color="#FF6A00"
          style={styles.loader}
        />
      </View>

      {/* Footer Branding */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>DealDoko Nepal</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0047BA",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  content: {
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
  loader: {
    marginTop: 28,
  },
  footer: {
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
