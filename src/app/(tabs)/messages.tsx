import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchConversations, ConversationItem } from "../../store/slices/chatSlice";
import { setAuthModalVisible } from "../../store/slices/authSlice";
import { THEME } from "../../constants/theme";

export default function MessagesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { conversations, isLoadingConversations } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    }
  }, [dispatch, isAuthenticated]);

  const onRefresh = () => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    }
  };

  const handleOpenConversation = (conversation: ConversationItem) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: conversation._id },
    } as any);
  };

  // Not logged in view
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.authPromptContainer}>
          <View style={styles.authIconCircle}>
            <Ionicons name="chatbubbles" size={32} color={THEME.colors.primary} />
          </View>
          <Text style={styles.authPromptTitle}>Your Messages</Text>
          <Text style={styles.authPromptSubtitle}>
            Log in to chat in real-time with buyers and sellers, negotiate prices, and make deals safely.
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => dispatch(setAuthModalVisible(true))}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.signInButtonText}>Login or Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats & Messages</Text>
        <Text style={styles.headerSubtitle}>Direct messages with buyers and sellers</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        style={{ flex: 1, backgroundColor: THEME.colors.background }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingConversations}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
            tintColor={THEME.colors.primary}
          />
        }
        renderItem={({ item }) => {
          // Identify the other participant
          const otherUser =
            item.participants?.find((p) => p._id !== user?._id) || item.participants?.[0];

          const avatarUrl =
            otherUser?.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

          const adImage =
            item.advertisement?.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=200&q=80";

          return (
            <TouchableOpacity
              style={styles.conversationCard}
              onPress={() => handleOpenConversation(item)}
              activeOpacity={0.7}
            >
              {/* Left Avatar */}
              <View style={styles.avatarWrap}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
                {otherUser?.isVerified && (
                  <View style={styles.verifiedDot}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>

              {/* Middle Chat Info */}
              <View style={styles.middleInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {otherUser?.name || "Marketplace User"}
                  </Text>
                  {item.lastMessage?.createdAt && (
                    <Text style={styles.timeText}>
                      {new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </View>

                {item.advertisement?.title && (
                  <Text style={styles.adTitle} numberOfLines={1}>
                    Ad: {item.advertisement.title}
                  </Text>
                )}

                <Text style={styles.lastMessageText} numberOfLines={1}>
                  {item.lastMessage?.text || "Started conversation"}
                </Text>
              </View>

              {/* Right: Ad Image & Unread Badge */}
              <View style={styles.rightWrap}>
                <Image source={{ uri: adImage }} style={styles.adThumb} contentFit="cover" />
                {(item.unreadCount || 0) > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {item.unreadCount! > 9 ? "9+" : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !isLoadingConversations ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={56} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                When you contact sellers or buyers message your listings, your chats will appear here.
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push("/(tabs)" as any)}
              >
                <Text style={styles.browseButtonText}>Explore Marketplace Deals</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: "700",
    color: THEME.colors.navy,
  },
  headerSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.borderLight,
  },
  verifiedDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    backgroundColor: THEME.colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  middleInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  userName: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "700",
    color: THEME.colors.text,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  adTitle: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  lastMessageText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
  },
  rightWrap: {
    alignItems: "flex-end",
    position: "relative",
  },
  adThumb: {
    width: 42,
    height: 42,
    borderRadius: THEME.radii.sm,
    backgroundColor: THEME.colors.borderLight,
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
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
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
  },
  authPromptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  authIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  authPromptTitle: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: "700",
    color: THEME.colors.navy,
    marginBottom: 8,
    textAlign: "center",
  },
  authPromptSubtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
    gap: 8,
    ...THEME.shadows.sm,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.base,
    fontWeight: "600",
  },
});
