import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { bannersApi } from "../../services/api";
import { THEME } from "../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 32;

interface BannerItem {
  _id: string;
  title?: string;
  imageUrl?: string;
  image?: { url: string };
  link?: string;
}

const FALLBACK_BANNERS: BannerItem[] = [
  {
    _id: "banner-1",
    title: "Buy & Sell Everything Across Nepal",
    imageUrl:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: "banner-2",
    title: "Verified Used Cars & Two-Wheelers",
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: "banner-3",
    title: "Real Estate & Apartments in Kathmandu",
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80",
  },
];

export const BannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>(FALLBACK_BANNERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    bannersApi
      .getActive()
      .then((res) => {
        if (res.data?.banners && res.data.banners.length > 0) {
          setBanners(res.data.banners);
        }
      })
      .catch(() => {
        // Fallback used silently
      });
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % banners.length;
      try {
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setActiveIndex(nextIndex);
      } catch {
        // Ignore scroll error if unmounted
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [banners.length]);

  const onMomentumScrollEnd = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  };

  const scrollToBanner = (index: number) => {
    try {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    } catch {
      // Ignore
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.index * SCREEN_WIDTH,
            animated: true,
          });
        }}
        renderItem={({ item }) => {
          const img =
            item.imageUrl ||
            item.image?.url ||
            "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=80";

          return (
            <View style={styles.slideContainer}>
              <TouchableOpacity style={styles.bannerCard} activeOpacity={0.9}>
                <Image source={{ uri: img }} style={styles.image} contentFit="cover" />
                {item.title ? (
                  <View style={styles.overlay}>
                    <Text style={styles.bannerTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.dotsRow}>
          {banners.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => scrollToBanner(i)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={[
                styles.dot,
                activeIndex === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 140,
    borderRadius: THEME.radii.lg,
    overflow: "hidden",
    position: "relative",
    backgroundColor: THEME.colors.primaryDark,
    ...THEME.shadows.md,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 20,
    backgroundColor: THEME.colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: THEME.colors.border,
  },
});
