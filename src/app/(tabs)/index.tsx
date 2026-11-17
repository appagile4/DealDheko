import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchApprovedListings,
  fetchFeaturedListings,
  setSelectedCategory,
} from "../../store/slices/listingsSlice";
import { Header } from "../../components/common/Header";
import { ProductCard } from "../../components/common/ProductCard";
import { CategoryCard } from "../../components/common/CategoryCard";
import { BannerCarousel } from "../../components/common/BannerCarousel";
import { CATEGORIES } from "../../constants/categories";
import { THEME } from "../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    approvedAds,
    featuredAds,
    selectedCategory,
    selectedCity,
    page,
    totalPages,
    isLoading,
    isRefreshing,
  } = useAppSelector((state) => state.listings);

  // Initial load
  useEffect(() => {
    dispatch(fetchApprovedListings({ category: selectedCategory, city: selectedCity, page: 1 }));
    dispatch(fetchFeaturedListings(8));
  }, [dispatch, selectedCategory, selectedCity]);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    dispatch(
      fetchApprovedListings({
        category: selectedCategory,
        city: selectedCity,
        page: 1,
        refresh: true,
      })
    );
    dispatch(fetchFeaturedListings(8));
  }, [dispatch, selectedCategory, selectedCity]);

  // Load more pagination
  const handleLoadMore = () => {
    if (!isLoading && page < totalPages) {
      dispatch(
        fetchApprovedListings({
          category: selectedCategory,
          city: selectedCity,
          page: page + 1,
        })
      );
    }
  };

  const handleCategorySelect = (slug: string) => {
    if (selectedCategory === slug) {
      dispatch(setSelectedCategory("all"));
    } else {
      dispatch(setSelectedCategory(slug));
    }
  };

  // Header Component inside FlatList
  const renderListHeader = () => (
    <View style={styles.headerComponent}>
      {/* Search Input Bar Trigger */}
      <TouchableOpacity
        style={styles.searchBarTrigger}
        onPress={() => router.push("/search" as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
        <Text style={styles.searchBarPlaceholder}>Find Cars, Mobiles, Bikes, Jobs...</Text>
        <View style={styles.filterPill}>
          <Ionicons name="options-outline" size={16} color={THEME.colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Promotional Banner Carousel */}
      <BannerCarousel />

      {/* Categories Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/categories" as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isSelected={selectedCategory === cat.slug}
            onPress={() => handleCategorySelect(cat.slug)}
          />
        ))}
      </ScrollView>

      {/* Featured Listings Carousel (if available) */}
      {featuredAds.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.featuredTitleWrap}>
              <Ionicons name="flash" size={18} color={THEME.colors.accent} />
              <Text style={styles.sectionTitle}>Featured Deals</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredRow}
          >
            {featuredAds.map((ad) => (
              <View key={ad._id} style={{ width: 170 }}>
                <ProductCard item={ad} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Fresh Recommendations Header */}
      <View style={[styles.sectionHeader, { marginTop: 16, marginBottom: 8 }]}>
        <Text style={styles.sectionTitle}>
          {selectedCategory !== "all"
            ? `${selectedCategory.toUpperCase()} in ${selectedCity}`
            : `Fresh Recommendations in ${selectedCity}`}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header />

      <FlatList
        data={approvedAds}
        keyExtractor={(item) => item._id}
        numColumns={2}
        style={styles.feedList}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.feedContent}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item }) => (
          <ProductCard item={item} width={CARD_WIDTH} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
            tintColor={THEME.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loaderFooter}>
              <ActivityIndicator size="small" color={THEME.colors.primary} />
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>No advertisements found</Text>
              <Text style={styles.emptySubtitle}>
                No approved listings matching your selection in {selectedCity}. Be the first to post!
              </Text>
              <TouchableOpacity
                style={styles.postAdButton}
                onPress={() => router.push("/(tabs)/post-ad" as any)}
              >
                <Text style={styles.postAdButtonText}>Post an Ad Now</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
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
  feedList: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  headerComponent: {
    paddingBottom: 4,
  },
  searchBarTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
    gap: 8,
  },
  searchBarPlaceholder: {
    flex: 1,
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textMuted,
  },
  filterPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: "700",
    color: THEME.colors.navy,
  },
  seeAllText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  categoriesRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  featuredSection: {
    marginTop: 8,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  featuredTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featuredRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  feedContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
  },
  postAdButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: THEME.radii.md,
  },
  postAdButtonText: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
  },
});
