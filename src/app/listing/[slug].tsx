import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchListingBySlug,
  fetchRelatedListings,
  AdvertisementItem,
} from "../../store/slices/listingsSlice";
import { toggleFavouriteThunk } from "../../store/slices/favouritesSlice";
import { setAuthModalVisible } from "../../store/slices/authSlice";
import { chatApi } from "../../services/api";
import { ProductCard } from "../../components/common/ProductCard";
import { THEME } from "../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ListingDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentAd, relatedAds, isLoading } = useAppSelector((state) => state.listings);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const favouriteIds = useAppSelector((state) => state.favourites.favouriteIds);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchListingBySlug(slug)).then((action: any) => {
        if (action.payload?._id) {
          dispatch(fetchRelatedListings(action.payload._id));
        }
      });
    }
  }, [dispatch, slug]);

  if (isLoading || !currentAd) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </SafeAreaView>
    );
  }

  const isFav = favouriteIds.includes(currentAd._id);
  const isOwner = user && currentAd.seller?._id === user._id;

  const handleToggleFav = () => {
    dispatch(toggleFavouriteThunk(currentAd));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this listing on DealDheko: ${currentAd.title} - Rs. ${currentAd.price.toLocaleString("en-IN")}`,
      });
    } catch (err) {}
  };

  const handleCall = () => {
    const phone = currentAd.sellerContact?.phone || currentAd.seller?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("Contact Unavailable", "Seller has chosen to communicate via in-app chat.");
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      dispatch(setAuthModalVisible(true));
      return;
    }

    if (isOwner) {
      Alert.alert("Your Advertisement", "You cannot start a chat with yourself.");
      return;
    }

    setStartingChat(true);
    try {
      const res = await chatApi.getOrCreateConversation(currentAd._id);
      const conversationId = res.data?.conversation?._id || res.data?._id;
      if (conversationId) {
        router.push({
          pathname: "/chat/[id]",
          params: { id: conversationId },
        } as any);
      }
    } catch (err: any) {
      Alert.alert(
        "Chat Unavailable",
        err.response?.data?.message || "Could not open chat with the seller."
      );
    } finally {
      setStartingChat(false);
    }
  };

  const images = currentAd.images?.length > 0 ? currentAd.images : [{ url: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=800&q=80" }];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Floating Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.navy} />
        </TouchableOpacity>

        <View style={styles.rightBarActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={THEME.colors.navy} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleToggleFav}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? THEME.colors.danger : THEME.colors.navy}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo Gallery Carousel */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIdx(idx);
            }}
          >
            {images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img.url }}
                style={styles.galleryImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          {/* Image index counter badge */}
          {images.length > 1 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {activeImageIdx + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Condition Tag */}
          <View style={styles.conditionTag}>
            <Text style={styles.conditionTagText}>{currentAd.condition || "Used"}</Text>
          </View>
        </View>

        {/* Main Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.priceText}>
            Rs. {Number(currentAd.price).toLocaleString("en-IN")}
          </Text>
          <Text style={styles.titleText}>{currentAd.title}</Text>

          <View style={styles.locationDateRow}>
            <View style={styles.locWrap}>
              <Ionicons name="location" size={14} color={THEME.colors.primary} />
              <Text style={styles.locText}>
                {currentAd.location?.area ? `${currentAd.location.area}, ` : ""}
                {currentAd.location?.city || "Nepal"}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(currentAd.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>{currentAd.description}</Text>
        </View>

        {/* Seller Info Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Seller Information</Text>
          <View style={styles.sellerRow}>
            <Image
              source={{
                uri:
                  currentAd.seller?.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.sellerAvatar}
              contentFit="cover"
            />
            <View style={styles.sellerTextWrap}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{currentAd.seller?.name || "Seller"}</Text>
                {currentAd.seller?.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} />
                )}
              </View>
              <Text style={styles.sellerSub}>
                Verified Member • {currentAd.seller?.city || "Kathmandu"}
              </Text>
            </View>
          </View>
        </View>

        {/* Related Ads */}
        {relatedAds.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionHeading}>Similar Advertisements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedRow}>
              {relatedAds.map((ad) => (
                <View key={ad._id} style={{ width: 170, marginRight: 12 }}>
                  <ProductCard item={ad} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
          <Ionicons name="call" size={18} color={THEME.colors.primary} />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleStartChat}
          disabled={startingChat}
          activeOpacity={0.85}
        >
          {startingChat ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
              <Text style={styles.chatButtonText}>Chat with Seller</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  rightBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: "#000",
    position: "relative",
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  counterBadge: {
    position: "absolute",
    bottom: 12,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radii.full,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  conditionTag: {
    position: "absolute",
    bottom: 12,
    left: 16,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radii.xs,
  },
  conditionTagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  priceText: {
    fontSize: 26,
    fontWeight: "800",
    color: THEME.colors.primary,
    marginBottom: 6,
  },
  titleText: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  locationDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.divider,
  },
  locWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: "500",
  },
  dateText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
  },
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  sectionHeading: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.navy,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.text,
    lineHeight: 22,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.borderLight,
  },
  sellerTextWrap: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sellerName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  sellerSub: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  relatedSection: {
    marginTop: 10,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 16,
    paddingLeft: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  relatedRow: {
    marginTop: 8,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
    ...THEME.shadows.lg,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 20,
    height: 48,
    gap: 6,
  },
  callButtonText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radii.md,
    height: 48,
    gap: 8,
    ...THEME.shadows.sm,
  },
  chatButtonText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
