import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setLocationModalVisible } from "../../store/slices/locationSlice";
import { setAuthModalVisible } from "../../store/slices/authSlice";
import { THEME } from "../../constants/theme";

export const Header: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedCity = useAppSelector((state) => state.location.selectedCity);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleNotificationsPress = () => {
    if (!isAuthenticated) {
      dispatch(setAuthModalVisible(true));
      return;
    }
    router.push("/notifications" as any);
  };

  const handleLocationPress = () => {
    dispatch(setLocationModalVisible(true));
  };

  const handleSearchPress = () => {
    router.push("/search" as any);
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Logo & Right Actions */}
      <View style={styles.topRow}>
        <Image
          source={require("../../../assets/images/dealdoko-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.actions}>
          {/* Location Selector Pill */}
          <TouchableOpacity
            style={styles.locationPill}
            onPress={handleLocationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={14} color={THEME.colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedCity}
            </Text>
            <Ionicons name="chevron-down" size={14} color={THEME.colors.textSecondary} />
          </TouchableOpacity>

          {/* Search Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSearchPress}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={22} color={THEME.colors.navy} />
          </TouchableOpacity>

          {/* Notifications Bell */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationsPress}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={THEME.colors.navy} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 130,
    height: 36,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    gap: 4,
    maxWidth: 130,
  },
  locationText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: THEME.colors.accent,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
