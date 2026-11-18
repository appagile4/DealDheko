import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser, setAuthModalVisible } from "../../store/slices/authSlice";

export default function AccountScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const myAds = useAppSelector((state) => state.myAds.ads);
  const favourites = useAppSelector((state) => state.favourites.favouriteIds);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of DealDoko?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => dispatch(logoutUser()),
      },
    ]);
  };

  // Not logged in view
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Account</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: THEME.colors.background }}
          contentContainerStyle={styles.guestContainer}
        >
          <View style={styles.guestAvatar}>
            <Ionicons name="person" size={40} color={THEME.colors.textMuted} />
          </View>
          <Text style={styles.guestTitle}>Welcome to DealDoko</Text>
          <Text style={styles.guestSubtitle}>
            Log in to manage your advertisements, review incoming offers, track
            favorite deals, and view profile settings.
          </Text>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => dispatch(setAuthModalVisible(true))}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.loginBtnText}>Log In or Sign Up</Text>
          </TouchableOpacity>

          <View style={[styles.menuCard, { width: "100%", marginTop: 24 }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/safety-tips" as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={THEME.colors.textSecondary}
                />
              </View>
              <Text style={styles.menuLabel}>Buyer & Seller Safety Guide</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={THEME.colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/terms" as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={THEME.colors.textSecondary}
                />
              </View>
              <Text style={styles.menuLabel}>Terms of Use</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={THEME.colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/privacy" as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={THEME.colors.textSecondary}
                />
              </View>
              <Text style={styles.menuLabel}>Privacy Policy</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={THEME.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.versionText, { marginTop: 16 }]}>DealDoko Customer App v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const avatarUrl =
    user?.avatar ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/edit-profile" as any)}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={THEME.colors.primary}
          />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: THEME.colors.background }}
        contentContainerStyle={styles.contentList}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={THEME.colors.primary}
                />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "Customer"}</Text>
            {user?.email && <Text style={styles.userSub}>{user.email}</Text>}
            {user?.phone && <Text style={styles.userSub}>{user.phone}</Text>}
            <View style={styles.badgeRow}>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>Verified Customer</Text>
              </View>
              {user?.city && (
                <View style={styles.cityPill}>
                  <Ionicons
                    name="location-outline"
                    size={11}
                    color={THEME.colors.textMuted}
                  />
                  <Text style={styles.cityPillText}>{user.city}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push("/my-ads" as any)}
          >
            <Text style={styles.statNum}>{myAds.length}</Text>
            <Text style={styles.statLabel}>My Ads</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push("/favourites" as any)}
          >
            <Text style={styles.statNum}>{favourites.length}</Text>
            <Text style={styles.statLabel}>Favourites</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push("/(tabs)/messages" as any)}
          >
            <Ionicons
              name="chatbubbles"
              size={22}
              color={THEME.colors.primary}
            />
            <Text style={styles.statLabel}>Messages</Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Customer Actions */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/my-ads" as any)}
          >
            <View
              style={[
                styles.menuIconWrap,
                { backgroundColor: THEME.colors.primaryLight },
              ]}
            >
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={THEME.colors.primary}
              />
            </View>
            <Text style={styles.menuLabel}>My Advertisements</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/favourites" as any)}
          >
            <View
              style={[
                styles.menuIconWrap,
                { backgroundColor: THEME.colors.dangerLight },
              ]}
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color={THEME.colors.danger}
              />
            </View>
            <Text style={styles.menuLabel}>Saved Favourites</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/notifications" as any)}
          >
            <View
              style={[
                styles.menuIconWrap,
                { backgroundColor: THEME.colors.warningLight },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={THEME.colors.warning}
              />
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/post-ad" as any)}
          >
            <View
              style={[
                styles.menuIconWrap,
                { backgroundColor: THEME.colors.accentLight },
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={THEME.colors.accent}
              />
            </View>
            <Text style={styles.menuLabel}>Publish New Advertisement</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Section 2: Account Settings */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/edit-profile" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={THEME.colors.textSecondary}
              />
            </View>
            <Text style={styles.menuLabel}>Personal Information</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/safety-tips" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={THEME.colors.textSecondary}
              />
            </View>
            <Text style={styles.menuLabel}>Buyer & Seller Safety Guide</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/terms" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={THEME.colors.textSecondary}
              />
            </View>
            <Text style={styles.menuLabel}>Terms of Use</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/privacy" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={THEME.colors.textSecondary}
              />
            </View>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={THEME.colors.danger}
          />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DealDoko Customer App v1.0.0</Text>
      </ScrollView>
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
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  contentList: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
    gap: 14,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.borderLight,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  userSub: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  rolePill: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radii.xs,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: THEME.radii.xs,
    gap: 2,
  },
  cityPillText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statNum: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  statLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.border,
  },
  menuCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: "hidden",
    ...THEME.shadows.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.dangerLight,
    paddingVertical: 14,
    borderRadius: THEME.radii.lg,
    gap: 8,
    marginTop: 6,
  },
  logoutBtnText: {
    color: THEME.colors.danger,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  guestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: "700",
    color: THEME.colors.navy,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
    gap: 8,
    ...THEME.shadows.sm,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.base,
    fontWeight: "600",
  },
});
