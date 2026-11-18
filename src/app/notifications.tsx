import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchNotifications,
  markAllNotificationsReadThunk,
} from "../store/slices/notificationsSlice";
import { THEME } from "../constants/theme";

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, isLoading } = useAppSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchNotifications());
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsReadThunk());
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        style={{ flex: 1, backgroundColor: THEME.colors.background }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
            tintColor={THEME.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={
                  item.type === "ad_approved"
                    ? "checkmark-circle"
                    : item.type === "ad_rejected"
                    ? "alert-circle"
                    : "notifications"
                }
                size={20}
                color={
                  item.type === "ad_approved"
                    ? THEME.colors.success
                    : item.type === "ad_rejected"
                    ? THEME.colors.danger
                    : THEME.colors.primary
                }
              />
            </View>

            <View style={styles.contentWrap}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifMessage}>{item.message}</Text>
              <Text style={styles.notifTime}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>

            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>
                You will receive updates here when your ads are approved or when buyers message you.
              </Text>
            </View>
          ) : (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" color={THEME.colors.primary} />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.navy,
  },
  markReadText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.primary,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: "flex-start",
    gap: 12,
    ...THEME.shadows.sm,
  },
  unreadCard: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrap: {
    flex: 1,
  },
  notifTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 2,
  },
  notifMessage: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.accent,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
