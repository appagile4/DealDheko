import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setLocationModalVisible, setCityAndPersist } from "../../store/slices/locationSlice";
import { setSelectedCity, fetchApprovedListings } from "../../store/slices/listingsSlice";
import { POPULAR_CITIES, CityLocation } from "../../constants/locations";
import { THEME } from "../../constants/theme";

export const LocationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const visible = useAppSelector((state) => state.location.locationModalVisible);
  const selectedCity = useAppSelector((state) => state.location.selectedCity);
  const [search, setSearch] = useState("");

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city: CityLocation) => {
    dispatch(setCityAndPersist(city.name));
    dispatch(setSelectedCity(city.name));
    dispatch(fetchApprovedListings({ city: city.name, page: 1, refresh: true }));
  };

  const handleClose = () => {
    dispatch(setLocationModalVisible(false));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.handleBar} />

              <View style={styles.header}>
                <Text style={styles.title}>Select Location</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search city or province..."
                  placeholderTextColor={THEME.colors.textMuted}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Cities List */}
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const isSelected = selectedCity.toLowerCase() === item.name.toLowerCase();
                  return (
                    <TouchableOpacity
                      style={[styles.cityRow, isSelected && styles.selectedRow]}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={styles.cityLeft}>
                        <View style={[styles.pinCircle, isSelected && styles.selectedPinCircle]}>
                          <Ionicons
                            name="location"
                            size={16}
                            color={isSelected ? "#FFFFFF" : THEME.colors.primary}
                          />
                        </View>
                        <View>
                          <Text style={[styles.cityName, isSelected && styles.selectedText]}>
                            {item.name}
                          </Text>
                          <Text style={styles.provinceName}>{item.state}</Text>
                        </View>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={THEME.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: THEME.colors.backdrop,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radii.xl,
    borderTopRightRadius: THEME.radii.xl,
    maxHeight: "75%",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    ...THEME.shadows.lg,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.colors.border,
    alignSelf: "center",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.navy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: THEME.typography.sizes.base,
    color: THEME.colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
  },
  selectedRow: {
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 10,
  },
  cityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPinCircle: {
    backgroundColor: THEME.colors.primary,
  },
  cityName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  provinceName: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  selectedText: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
});
