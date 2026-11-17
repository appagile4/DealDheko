import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../../constants/theme";
import { useAppSelector } from "../../store/hooks";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const unreadTotal = useAppSelector((state) => state.chat.unreadTotal);

  // Tailored paddingBottom: compact on iOS, spacious on Android
  const paddingBottom =
    Platform.OS === "ios"
      ? (insets.bottom > 0 ? 22 : 12)
      : Math.max(insets.bottom, 16) + 8;
  const tabHeight = 52 + paddingBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: paddingBottom,
          paddingTop: 8,
          ...THEME.shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color as any}
            />
          ),
        }}
      />

      {/* 2. Categories Tab */}
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={22}
              color={color as any}
            />
          ),
        }}
      />

      {/* 3. Post Ad / SELL Tab (Elevated Center Button) */}
      <Tabs.Screen
        name="post-ad"
        options={{
          title: "SELL",
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.sellLabel,
                {
                  color: focused
                    ? THEME.colors.accentDark
                    : THEME.colors.accent,
                },
              ]}
            >
              SELL
            </Text>
          ),
          tabBarIcon: () => (
            <View style={styles.sellButtonWrap}>
              <View style={styles.sellButtonInner}>
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </View>
            </View>
          ),
        }}
      />

      {/* 4. Messages / Chats Tab */}
      <Tabs.Screen
        name="messages"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.chatIconWrap}>
              <Ionicons
                name={
                  focused
                    ? "chatbubble-ellipses"
                    : "chatbubble-ellipses-outline"
                }
                size={22}
                color={color as any}
              />
              {unreadTotal > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {unreadTotal > 9 ? "9+" : unreadTotal}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* 5. My Account Tab */}
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color as any}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sellButtonWrap: {
    top: -14,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
    ...THEME.shadows.md,
  },
  sellButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: THEME.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sellLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  chatIconWrap: {
    position: "relative",
  },
  tabBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: THEME.colors.accent,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  tabBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});
