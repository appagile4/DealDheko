import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleFavouriteThunk } from "../../store/slices/favouritesSlice";
import { AdvertisementItem } from "../../store/slices/listingsSlice";
import { THEME } from "../../constants/theme";

interface ProductCardProps {
  item: AdvertisementItem;
  width?: number | string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, width }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const favouriteIds = useAppSelector((state) => state.favourites.favouriteIds);
  const isFav = favouriteIds.includes(item._id);

  const handlePress = () => {
    router.push({
      pathname: "/listing/[slug]",
      params: { slug: item.slug },
    } as any);
  };

  const handleToggleFavourite = (e: any) => {
    e?.stopPropagation?.();
    dispatch(toggleFavouriteThunk(item));
  };

  const imageUrl =
    item.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=600&q=80";

  // Format price
  const formattedPrice = `Rs. ${Number(item.price).toLocaleString("en-IN")}`;

  return (
    <TouchableOpacity
      style={[styles.card, width ? { width: width as any } : {}]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Product Image & Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        {/* Featured Tag */}
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="sparkles" size={10} color="#FFFFFF" />
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}

        {/* Condition Tag */}
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{item.condition || "Used"}</Text>
        </View>

        {/* Heart Favorite Button */}
        <TouchableOpacity
          style={styles.favButton}
          onPress={handleToggleFavourite}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={18}
            color={isFav ? THEME.colors.danger : THEME.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Info Content */}
      <View style={styles.content}>
        <Text style={styles.price}>{formattedPrice}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.locationWrap}>
            <Ionicons name="location-outline" size={12} color={THEME.colors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location?.city || "Nepal"}
            </Text>
          </View>

          {item.seller?.isVerified && (
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={12} color={THEME.colors.primary} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
    ...THEME.shadows.sm,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: THEME.colors.borderLight,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.radii.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  featuredText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  conditionBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.radii.xs,
  },
  conditionText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  favButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...THEME.shadows.sm,
  },
  content: {
    padding: 10,
  },
  price: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.text,
    lineHeight: 18,
    fontWeight: "500",
    height: 36,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: THEME.colors.divider,
    paddingTop: 6,
  },
  locationWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  locationText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    flex: 1,
  },
  verifiedTag: {
    marginLeft: 4,
  },
});
