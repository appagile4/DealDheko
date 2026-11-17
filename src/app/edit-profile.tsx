import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateUser } from "../store/slices/authSlice";
import { authApi, uploadApi } from "../services/api";
import { POPULAR_CITIES } from "../constants/locations";
import { THEME } from "../constants/theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "Kathmandu");
  const [about, setAbout] = useState(user?.about || "");
  const [avatar, setAvatar] = useState(
    user?.avatar ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
  );

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow photo access to change your avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const photo = result.assets[0];
        setUploadingAvatar(true);

        const formData = new FormData();
        const filename = photo.uri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("image", {
          uri: photo.uri,
          name: filename,
          type,
        } as any);

        try {
          const res = await uploadApi.uploadSingle(formData);
          if (res.data?.url) {
            setAvatar(res.data.url);
          }
        } catch {
          // Local fallback preview if upload offline
          setAvatar(photo.uri);
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (err) {
      console.warn("Avatar pick error:", err);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }

    setSaving(true);
    try {
      await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        city,
        about: about.trim(),
      });

      dispatch(
        updateUser({
          name: name.trim(),
          phone: phone.trim(),
          city,
          about: about.trim(),
          avatar,
        })
      );

      Alert.alert("Profile Updated", "Your changes have been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Update Failed", err.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={THEME.colors.primary} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
            <TouchableOpacity
              style={styles.cameraIconBtn}
              onPress={handlePickAvatar}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.changeAvatarText}>Tap camera to change photo</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={THEME.colors.textMuted}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+977 98XXXXXXXX"
            placeholderTextColor={THEME.colors.textMuted}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>City</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {POPULAR_CITIES.filter((c) => c.id !== "all-nepal").map((c) => {
              const isSelected = city.toLowerCase() === c.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.cityChip, isSelected && styles.selectedCityChip]}
                  onPress={() => setCity(c.name)}
                >
                  <Text style={[styles.cityText, isSelected && styles.selectedCityText]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 14 }]}>About / Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={about}
            onChangeText={setAbout}
            multiline
            numberOfLines={3}
            placeholder="Tell buyers and sellers a little about yourself..."
            placeholderTextColor={THEME.colors.textMuted}
            maxLength={200}
          />
        </View>

        <TouchableOpacity style={styles.saveActionBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveActionText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  saveBtnText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 10,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME.colors.borderLight,
  },
  cameraIconBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: THEME.colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  changeAvatarText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  label: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: "600",
    color: THEME.colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 12,
    height: 44,
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  cityScroll: {
    flexDirection: "row",
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.md,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 8,
  },
  selectedCityChip: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  cityText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  selectedCityText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  saveActionBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radii.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    ...THEME.shadows.sm,
  },
  saveActionText: {
    color: "#FFFFFF",
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
  },
});
