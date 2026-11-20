import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { deleteAccountThunk } from "../store/slices/authSlice";
import { authApi } from "../services/api";
import { THEME } from "../constants/theme";

const REASONS = [
  "I have found what I was looking for",
  "I have privacy or data security concerns",
  "I receive too many messages or notifications",
  "I am switching to another account",
  "I encountered technical issues or bugs",
  "I am no longer using classified marketplaces in Nepal",
  "Other reason",
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState(user?.email || "");
  const [selectedReason, setSelectedReason] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Sync user email if available
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Request 6-digit OTP code via email
  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please enter your registered email address.");
      return;
    }

    if (!selectedReason) {
      Alert.alert("Reason Required", "Please choose a reason for deleting your account.");
      return;
    }

    setIsSendingOtp(true);
    try {
      await authApi.requestDeleteAccountOtp(cleanEmail);
      setOtpSent(true);
      setCountdown(60);
      Alert.alert(
        "Verification Code Sent",
        `A 6-digit code has been sent to ${cleanEmail}. It is valid for 5 minutes.`
      );
    } catch (err: any) {
      Alert.alert(
        "Request Failed",
        err.response?.data?.message || err.message || "Unable to send verification code."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Execute Permanent Account Deletion
  const handleDeleteAccount = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      Alert.alert("Email Required", "Please enter your registered email address.");
      return;
    }

    if (!selectedReason) {
      Alert.alert("Reason Required", "Please select a reason for deleting your account.");
      return;
    }

    if (!otpSent || otp.trim().length !== 6) {
      Alert.alert(
        "Verification Code Required",
        "Please request and enter the 6-digit verification code sent to your email."
      );
      return;
    }

    if (!isConfirmed) {
      Alert.alert(
        "Acknowledgment Required",
        "Please check the confirmation box acknowledging that account deletion is permanent and cannot be undone."
      );
      return;
    }

    Alert.alert(
      "FINAL CONFIRMATION",
      "Are you absolutely sure you want to permanently delete your DealDoko account? All your active advertisements, chat messages, and saved data will be erased forever and cannot be recovered.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Permanently Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await dispatch(
                deleteAccountThunk({
                  email: cleanEmail,
                  otp: otp.trim(),
                  reason: selectedReason,
                  reasonDetails: reasonDetails.trim() || undefined,
                })
              ).unwrap();

              Alert.alert(
                "Account Deleted",
                "Your DealDoko account and associated data have been permanently deleted.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/(tabs)" as any),
                  },
                ]
              );
            } catch (err: any) {
              Alert.alert(
                "Deletion Failed",
                err || "Failed to delete account. Please verify your code and try again."
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={THEME.colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Permanent Warning Banner */}
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={24} color="#DC2626" />
              <Text style={styles.warningTitle}>Warning: Permanent Action</Text>
            </View>
            <Text style={styles.warningDesc}>
              Deleting your account is permanent and cannot be undone. Once confirmed, your account and all data will no longer be available.
            </Text>

            {/* What gets purged */}
            <View style={styles.erasedItemsRow}>
              <View style={styles.erasedPill}>
                <Ionicons name="trash-bin-outline" size={13} color="#DC2626" />
                <Text style={styles.erasedText}>All Listings</Text>
              </View>
              <View style={styles.erasedPill}>
                <Ionicons name="chatbubbles-outline" size={13} color="#DC2626" />
                <Text style={styles.erasedText}>Chat History</Text>
              </View>
              <View style={styles.erasedPill}>
                <Ionicons name="heart-dislike-outline" size={13} color="#DC2626" />
                <Text style={styles.erasedText}>Profile & Data</Text>
              </View>
            </View>
          </View>

          {/* User Account Info Card */}
          {user && (
            <View style={styles.userCard}>
              <Ionicons name="person-circle-outline" size={36} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.userNameText}>{user.name}</Text>
                <Text style={styles.userEmailText}>{user.email || user.phone || ""}</Text>
              </View>
            </View>
          )}

          {/* Reason Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Why are you deleting your account? *</Text>
            <View style={styles.reasonsList}>
              {REASONS.map((r) => {
                const isSelected = selectedReason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                    onPress={() => setSelectedReason(r)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={isSelected ? "#DC2626" : THEME.colors.textMuted}
                    />
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Additional Comments (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Additional Feedback (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={reasonDetails}
              onChangeText={setReasonDetails}
              placeholder="Tell us what we could improve..."
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Email OTP Verification Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Verify Registered Email *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={THEME.colors.textMuted} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!otpSent}
              />
            </View>

            {!otpSent ? (
              <TouchableOpacity
                style={styles.sendOtpBtn}
                onPress={handleSendOtp}
                disabled={isSendingOtp || !email.trim() || !selectedReason}
                activeOpacity={0.8}
              >
                {isSendingOtp ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="keypad-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.sendOtpBtnText}>Send Verification Code</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.otpBox}>
                <Text style={styles.otpLabel}>Enter 6-Digit Code:</Text>
                <View style={styles.otpInputRow}>
                  <TextInput
                    style={styles.otpInput}
                    value={otp}
                    onChangeText={(val) => setOtp(val.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    placeholderTextColor={THEME.colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[styles.resendBtn, countdown > 0 && { opacity: 0.5 }]}
                    onPress={handleSendOtp}
                    disabled={countdown > 0 || isSendingOtp}
                  >
                    <Text style={styles.resendBtnText}>
                      {countdown > 0 ? `${countdown}s` : "Resend"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.otpNotice}>
                  Code sent to {email}. Valid for 5 minutes.
                </Text>
              </View>
            )}
          </View>

          {/* Acknowledgment Checkbox */}
          {otpSent && (
            <TouchableOpacity
              style={styles.confirmRow}
              onPress={() => setIsConfirmed(!isConfirmed)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isConfirmed ? "checkbox" : "square-outline"}
                size={22}
                color={isConfirmed ? "#DC2626" : THEME.colors.textMuted}
              />
              <Text style={styles.confirmText}>
                I understand that deleting my account is permanent and irreversible. All my listings, chats, and personal data will be completely erased.
              </Text>
            </TouchableOpacity>
          )}

          {/* Delete Action Button */}
          {otpSent && (
            <TouchableOpacity
              style={[
                styles.deleteBtn,
                (!isConfirmed || otp.trim().length !== 6 || isDeleting) && styles.deleteBtnDisabled,
              ]}
              onPress={handleDeleteAccount}
              disabled={!isConfirmed || otp.trim().length !== 6 || isDeleting}
              activeOpacity={0.85}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color="#FFFFFF" />
                  <Text style={styles.deleteBtnText}>Permanently Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel &amp; Keep Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  backButton: {
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
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  warningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: THEME.radii.lg,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    padding: 16,
    gap: 8,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#991B1B",
  },
  warningDesc: {
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 18,
  },
  erasedItemsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  erasedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  erasedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#991B1B",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  userNameText: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  userEmailText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  reasonsList: {
    gap: 8,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  reasonOptionSelected: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  reasonText: {
    fontSize: 13,
    color: THEME.colors.text,
    flex: 1,
  },
  reasonTextSelected: {
    color: "#991B1B",
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.sm,
    paddingHorizontal: 12,
    backgroundColor: THEME.colors.background,
    gap: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: THEME.colors.background,
    textAlignVertical: "top",
    minHeight: 70,
  },
  sendOtpBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: THEME.radii.sm,
    marginTop: 4,
  },
  sendOtpBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  otpBox: {
    gap: 8,
    marginTop: 4,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  otpInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  otpInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    borderRadius: THEME.radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 18,
    letterSpacing: 6,
    fontWeight: "700",
    textAlign: "center",
    color: "#991B1B",
  },
  resendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: THEME.radii.sm,
    backgroundColor: THEME.colors.borderLight,
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  otpNotice: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: THEME.radii.md,
    padding: 12,
  },
  confirmText: {
    fontSize: 12,
    color: "#7F1D1D",
    flex: 1,
    lineHeight: 18,
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: THEME.radii.md,
    ...THEME.shadows.sm,
  },
  deleteBtnDisabled: {
    backgroundColor: "#FCA5A5",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
});
