import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch } from "../../store/hooks";
import { setSelectedCategory } from "../../store/slices/listingsSlice";
import { CATEGORIES, Category } from "../../constants/categories";
import { THEME } from "../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - CARD_GAP) / 2;

export default function CategoriesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatModal, setSelectedCatModal] = useState<Category | null>(null);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.subCategories.some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleSelectCategory = (category: Category) => {
    setSelectedCatModal(null);
    dispatch(setSelectedCategory(category.slug));
    router.push("/(tabs)" as any);
  };

  const handleSelectSubCategory = (category: Category, subName: string) => {
    setSelectedCatModal(null);
    dispatch(setSelectedCategory(category.slug));
    router.push({
      pathname: "/search",
      params: { category: category.slug, q: subName },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Categories</Text>
        <Text style={styles.headerSubtitle}>
          Select a category to explore deals across Nepal
        </Text>

        {/* Search Filter Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories or subcategories..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Body Area */}
      <View style={styles.body}>
        {/* Grid of Square Category Cards */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.gridContainer}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.squareCard}
                onPress={() => setSelectedCatModal(cat)}
                activeOpacity={0.8}
              >
                {/* Badge for Subcategory Count */}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cat.subCategories.length}</Text>
                </View>

                {/* 3D Icon Square Box */}
                <View style={styles.iconBox}>
                  <Image source={cat.image} style={styles.iconImage} resizeMode="contain" />
                </View>

                {/* Category Name */}
                <Text style={styles.categoryName} numberOfLines={2}>
                  {cat.name}
                </Text>

                {/* Tap Hint */}
                <View style={styles.exploreHint}>
                  <Text style={styles.exploreHintText}>Explore</Text>
                  <Ionicons name="chevron-forward" size={12} color={THEME.colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredCategories.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>No categories found</Text>
              <Text style={styles.emptySubtitle}>Try searching for something else</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Subcategories Bottom Sheet Modal */}
      <Modal
        visible={!!selectedCatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCatModal(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedCatModal(null)}
          />

          <View style={styles.modalSheet}>
            {/* Sheet Handle */}
            <View style={styles.modalHandle} />

            {selectedCatModal && (
              <>
                {/* Modal Category Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.modalIconBox}>
                      <Image
                        source={selectedCatModal.image}
                        style={styles.modalIconImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.modalHeaderTextWrap}>
                      <Text style={styles.modalTitle}>{selectedCatModal.name}</Text>
                      <Text style={styles.modalSubtitle}>
                        {selectedCatModal.subCategories.length} subcategories
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedCatModal(null)}
                  >
                    <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* View All Listings in this Category Button */}
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => handleSelectCategory(selectedCatModal)}
                  activeOpacity={0.85}
                >
                  <View style={styles.viewAllLeft}>
                    <Ionicons name="apps" size={18} color="#FFFFFF" />
                    <Text style={styles.viewAllText}>
                      View All in {selectedCatModal.name}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Subcategories List */}
                <Text style={styles.subListTitle}>Select Subcategory</Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.subListScroll}
                  contentContainerStyle={styles.subListContent}
                >
                  {selectedCatModal.subCategories.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={styles.subCategoryRow}
                      onPress={() => handleSelectSubCategory(selectedCatModal, sub.name)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.subRowLeft}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.subCategoryName}>{sub.name}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={THEME.colors.textMuted}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  body: {
    flex: 1,
    backgroundColor: THEME.colors.background,
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
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: THEME.radii.md,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.text,
    paddingVertical: 0,
  },
  scrollContent: {
    padding: PADDING,
    paddingBottom: 32,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  squareCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH, // Exactly square
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: CARD_GAP,
    position: "relative",
    ...THEME.shadows.sm,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radii.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconImage: {
    width: 44,
    height: 44,
  },
  categoryName: {
    fontSize: THEME.typography.sizes.xs + 1,
    fontWeight: "700",
    color: THEME.colors.navy,
    textAlign: "center",
    marginBottom: 4,
  },
  exploreHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  exploreHintText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalSheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: "80%",
    ...THEME.shadows.lg,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalIconImage: {
    width: 34,
    height: 34,
  },
  modalHeaderTextWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.navy,
  },
  modalSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: THEME.radii.full,
    backgroundColor: "#F1F5F9",
  },
  viewAllBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
    marginBottom: 16,
    ...THEME.shadows.sm,
  },
  viewAllLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewAllText: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "700",
  },
  subListTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: "700",
    color: THEME.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subListScroll: {
    maxHeight: 320,
  },
  subListContent: {
    paddingBottom: 8,
  },
  subCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
  },
  subRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
    marginRight: 12,
  },
  subCategoryName: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.text,
    fontWeight: "500",
  },
});
