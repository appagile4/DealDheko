import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppSelector } from "../store/hooks";
import { ProductCard } from "../components/common/ProductCard";
import { THEME } from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

export default function FavouritesScreen() {
  const router = useRouter();
  const favouriteItems = useAppSelector((state) => state.favourites.favouriteItems);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Favourites ({favouriteItems.length})</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={favouriteItems}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ProductCard item={item} width={CARD_WIDTH} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={48} color={THEME.colors.danger} />
            </View>
            <Text style={styles.emptyTitle}>No saved favourites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any advertisement to save it and compare deals easily later.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push("/(tabs)" as any)}
            >
              <Text style={styles.browseBtnText}>Explore Marketplace Deals</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
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
  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  emptySubtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  browseBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
  },
  browseBtnText: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
  },
});
