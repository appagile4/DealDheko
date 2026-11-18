import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMyAds, deleteMyAd, setStatusFilter } from "../store/slices/myAdsSlice";
import { AdvertisementItem } from "../store/slices/listingsSlice";
import { listingsApi } from "../services/api";
import { THEME } from "../constants/theme";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "sold", label: "Sold" },
] as const;

export default function MyAdsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { ads, activeStatusFilter, isLoading, isRefreshing } = useAppSelector(
    (state) => state.myAds
  );

  useEffect(() => {
    dispatch(fetchMyAds());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchMyAds(true));
  };

  const filteredAds = ads.filter((ad) => {
    if (activeStatusFilter === "all") return true;
    return ad.status === activeStatusFilter;
  });

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete Advertisement",
      `Are you sure you want to permanently delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteMyAd(id)),
        },
      ]
    );
  };

  const handleMarkAsSold = async (ad: AdvertisementItem) => {
    try {
      await listingsApi.update(ad._id, { status: "sold", isSold: true });
      dispatch(fetchMyAds(true));
      Alert.alert("Marked as Sold", "Your advertisement has been marked as sold.");
    } catch (err: any) {
      Alert.alert("Error", "Could not mark advertisement as sold.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return {
          label: "Active & Published",
          bg: THEME.colors.successLight,
          color: THEME.colors.success,
          icon: "checkmark-circle",
        };
      case "pending":
        return {
          label: "Pending Moderation",
          bg: THEME.colors.warningLight,
          color: THEME.colors.warning,
          icon: "time",
        };
      case "rejected":
        return {
          label: "Changes Required",
          bg: THEME.colors.dangerLight,
          color: THEME.colors.danger,
          icon: "alert-circle",
        };
      case "sold":
        return {
          label: "Sold Out",
          bg: "#F1F5F9",
          color: THEME.colors.textMuted,
          icon: "bag-check",
        };
      default:
        return {
          label: status,
          bg: THEME.colors.borderLight,
          color: THEME.colors.textSecondary,
          icon: "ellipse",
        };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Advertisements</Text>
        <TouchableOpacity
          style={styles.postNewBtn}
          onPress={() => router.push("/(tabs)/post-ad" as any)}
        >
          <Ionicons name="add" size={20} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsRow}>
        {STATUS_TABS.map((tab) => {
          const isSelected = activeStatusFilter === tab.key;
          const count = ads.filter((a) => (tab.key === "all" ? true : a.status === tab.key)).length;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.statusTab, isSelected && styles.activeStatusTab]}
              onPress={() => dispatch(setStatusFilter(tab.key as any))}
            >
              <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                {tab.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredAds}
        keyExtractor={(item) => item._id}
        style={{ flex: 1, backgroundColor: THEME.colors.background }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
            tintColor={THEME.colors.primary}
          />
        }
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          const imgUrl =
            item.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=200&q=80";

          return (
            <View style={styles.adCard}>
              <View style={styles.cardMain}>
                <Image source={{ uri: imgUrl }} style={styles.thumb} contentFit="cover" />

                <View style={styles.cardDetails}>
                  <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon as any} size={12} color={badge.color} />
                    <Text style={[styles.badgePillText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>

                  <Text style={styles.adTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.adPrice}>
                    Rs. {Number(item.price).toLocaleString("en-IN")}
                  </Text>
                  <Text style={styles.adDate}>
                    Posted: {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionRow}>
                {item.status === "approved" && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleMarkAsSold(item)}
                  >
                    <Ionicons name="bag-check-outline" size={16} color={THEME.colors.textSecondary} />
                    <Text style={styles.actionBtnText}>Mark as Sold</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    router.push({
                      pathname: "/listing/[slug]",
                      params: { slug: item.slug },
                    } as any);
                  }}
                >
                  <Ionicons name="eye-outline" size={16} color={THEME.colors.primary} />
                  <Text style={[styles.actionBtnText, { color: THEME.colors.primary }]}>
                    Preview
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item._id, item.title)}
                >
                  <Ionicons name="trash-outline" size={16} color={THEME.colors.danger} />
                  <Text style={[styles.actionBtnText, { color: THEME.colors.danger }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>No advertisements</Text>
              <Text style={styles.emptySubtitle}>
                You haven't posted any advertisements in this section yet.
              </Text>
              <TouchableOpacity
                style={styles.postBtn}
                onPress={() => router.push("/(tabs)/post-ad" as any)}
              >
                <Text style={styles.postBtnText}>Post an Ad</Text>
              </TouchableOpacity>
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
  postNewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  statusTab: {
    paddingVertical: 12,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeStatusTab: {
    borderBottomColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  activeTabText: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  adCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: "hidden",
    ...THEME.shadows.sm,
  },
  cardMain: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: THEME.radii.md,
    backgroundColor: THEME.colors.borderLight,
  },
  cardDetails: {
    flex: 1,
  },
  badgePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.radii.xs,
    gap: 4,
    marginBottom: 4,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  adTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
    color: THEME.colors.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  adPrice: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  adDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: THEME.colors.divider,
    backgroundColor: "#FAFBFD",
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "flex-end",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.sm,
    gap: 4,
  },
  actionBtnText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  deleteBtn: {
    backgroundColor: THEME.colors.dangerLight,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  postBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: THEME.radii.md,
  },
  postBtnText: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
  },
});
