import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  searchListingsThunk,
  clearSearchResults,
} from "../store/slices/listingsSlice";
import { ProductCard } from "../components/common/ProductCard";
import { CATEGORIES } from "../constants/categories";
import { THEME } from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

const RECENT_SEARCHES = [
  "iPhone 15",
  "Royal Enfield",
  "Kathmandu Apartment",
  "MacBook Air",
  "Pulsar 220",
];

export default function SearchScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();

  const [query, setQuery] = useState(params.q || "");
  const [activeCategory, setActiveCategory] = useState(
    params.category || "all",
  );
  const selectedCity = useAppSelector((state) => state.location.selectedCity);
  const { searchResults, isSearching } = useAppSelector(
    (state) => state.listings,
  );

  useEffect(() => {
    if (params.q || params.category) {
      dispatch(
        searchListingsThunk({
          q: params.q,
          category: params.category,
          city: selectedCity,
        }),
      );
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, params.q, params.category, selectedCity]);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim() && activeCategory === "all") return;
    dispatch(
      searchListingsThunk({
        q: searchQuery.trim(),
        category: activeCategory !== "all" ? activeCategory : undefined,
        city: selectedCity,
      }),
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.navy} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <Ionicons
            name="search-outline"
            size={18}
            color={THEME.colors.textMuted}
          />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            placeholder="Search in DealDoko..."
            placeholderTextColor={THEME.colors.textMuted}
            returnKeyType="search"
            autoFocus={!params.q}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={THEME.colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchActionBtn}
          onPress={() => handleSearch()}
        >
          <Text style={styles.searchActionText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoryChipsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          <TouchableOpacity
            style={[styles.chip, activeCategory === "all" && styles.activeChip]}
            onPress={() => {
              setActiveCategory("all");
              handleSearch();
            }}
          >
            <Text
              style={[
                styles.chipText,
                activeCategory === "all" && styles.activeChipText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                activeCategory === cat.slug && styles.activeChip,
              ]}
              onPress={() => {
                const next = activeCategory === cat.slug ? "all" : cat.slug;
                setActiveCategory(next);
                handleSearch();
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  activeCategory === cat.slug && styles.activeChipText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results or Recent Searches */}
      {searchResults.length === 0 && !isSearching ? (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentTitle}>Popular Searches</Text>
          <View style={styles.tagsContainer}>
            {RECENT_SEARCHES.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tagPill}
                onPress={() => {
                  setQuery(tag);
                  handleSearch(tag);
                }}
              >
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={THEME.colors.primary}
                />
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.resultsContent}
          renderItem={({ item }) => (
            <ProductCard item={item} width={CARD_WIDTH} />
          )}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              Found {searchResults.length}{" "}
              {searchResults.length === 1 ? "result" : "results"} in{" "}
              {selectedCity}
            </Text>
          }
          ListEmptyComponent={
            isSearching ? (
              <ActivityIndicator
                style={{ marginTop: 40 }}
                size="large"
                color={THEME.colors.primary}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={THEME.colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No matching items found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching with different keywords or browse other
                  categories.
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radii.lg,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.text,
  },
  searchActionBtn: {
    paddingHorizontal: 8,
  },
  searchActionText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  categoryChipsBar: {
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  activeChip: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  activeChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  recentSearchesContainer: {
    padding: 20,
  },
  recentTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.navy,
    marginBottom: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 6,
    ...THEME.shadows.sm,
  },
  tagText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.text,
    fontWeight: "500",
  },
  resultsContent: {
    padding: 16,
    paddingBottom: 36,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  resultsCount: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginBottom: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
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
    paddingHorizontal: 24,
  },
});
