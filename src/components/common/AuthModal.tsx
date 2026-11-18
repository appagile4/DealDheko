import Ionicons from "@expo/vector-icons/Ionicons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { THEME } from "../../constants/theme";
import { authApi } from "../../services/api";
import googleAuthService from "../../services/googleAuth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearAuthError,
  loginWithGoogle,
  setAuthModalVisible,
  verifyEmailOtpThunk,
  verifyPhoneOtpThunk,
} from "../../store/slices/authSlice";

WebBrowser.maybeCompleteAuthSession();

type AuthMode =
  | "initial"
  | "phone"
  | "phone_otp"
  | "email"
  | "email_otp"
  | "set_password";

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const visible = useAppSelector((state) => state.auth.authModalVisible);
  const authError = useAppSelector((state) => state.auth.error);

  const [mode, setMode] = useState<AuthMode>("initial");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Phone flow
  const [phoneNumber, setPhoneNumber] = useState("+977 ");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  // Email flow
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [registrationToken, setRegistrationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Reset modal state on open/close
  useEffect(() => {
    if (visible) {
      setMode("initial");
      setLocalError(null);
      setLoading(false);
      dispatch(clearAuthError());
    }
  }, [visible]);

  // Timers for countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phoneCountdown > 0) {
      timer = setTimeout(() => setPhoneCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [phoneCountdown]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (emailCountdown > 0) {
      timer = setTimeout(() => setEmailCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailCountdown]);

  const handleClose = () => {
    dispatch(setAuthModalVisible(false));
  };

  // Google OAuth Configuration for Android, iOS & Web
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "882363919027-g1cv9i0tks94lq5s5n87bmvsjtuohv4i.apps.googleusercontent.com",
    iosClientId:
      "882363919027-cpvtr5pemi2bn67mfb823ipusu60m8q3.apps.googleusercontent.com",
    webClientId:
      "882363919027-55u63mhmlrtmd4jtko8icqk91fm01e85.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    redirectUri: Platform.select({
      ios: "com.googleusercontent.apps.882363919027-cpvtr5pemi2bn67mfb823ipusu60m8q3:/oauthredirect",
      android:
        "com.googleusercontent.apps.882363919027-g1cv9i0tks94lq5s5n87bmvsjtuohv4i:/oauth2redirect",
      default: undefined,
    }),
  });

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleAuthSuccess(response);
    } else if (response?.type === "error") {
      setLocalError(
        response.error?.message || "Google sign-in encountered an error.",
      );
      setLoading(false);
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (authResponse: any) => {
    setLoading(true);
    setLocalError(null);
    try {
      const authentication = authResponse?.authentication;
      const params = authResponse?.params;
      const accessToken = authentication?.accessToken || params?.access_token;
      const idToken = authentication?.idToken || params?.id_token;
      const code = params?.code;

      // If neither token nor code is present yet (e.g. intermediate state), do not send empty payload
      if (!accessToken && !idToken && !code) {
        return;
      }

      let userInfo = null;
      if (accessToken) {
        try {
          const uRes = await fetch(
            "https://www.googleapis.com/userinfo/v2/me",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          if (uRes.ok) {
            userInfo = await uRes.json();
          }
        } catch (uErr) {
          console.warn("Could not fetch userinfo directly:", uErr);
        }
      }

      await dispatch(
        loginWithGoogle({
          accessToken,
          idToken,
          credential: idToken,
          code,
          userInfo: userInfo
            ? {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                sub: userInfo.id,
              }
            : undefined,
        }),
      ).unwrap();

      handleClose();
    } catch (err: any) {
      setLocalError(err || "Google sign-in could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize native Google Sign-In SDK
  useEffect(() => {
    googleAuthService.init();
  }, []);

  // Trigger Google OAuth Flow (Native SDK with browser fallback)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLocalError(null);

    // 1. Prefer native Google Sign-In SDK if available in the current build (like Kalki_Sena_Drive)
    if (googleAuthService.isAvailable()) {
      try {
        const result = await googleAuthService.signIn();
        if (result.cancelled) {
          setLoading(false);
          return;
        }

        if (!result.success || !result.idToken) {
          setLocalError(result.error || "Google Sign-In failed.");
          setLoading(false);
          return;
        }

        await dispatch(
          loginWithGoogle({
            idToken: result.idToken,
            credential: result.idToken,
            accessToken: result.accessToken,
            userInfo: result.userInfo,
          }),
        ).unwrap();

        handleClose();
      } catch (err: any) {
        setLocalError(err || "Google authentication failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Web fallback (when running on Web)
    if (Platform.OS === "web") {
      try {
        if (!request) {
          const res = await promptAsync();
          if (res.type !== "success") {
            setLoading(false);
          }
          return;
        }
        const res = await promptAsync();
        if (res.type !== "success") {
          setLoading(false);
        }
      } catch (err: any) {
        setLoading(false);
        setLocalError(err.message || "Failed to launch Google Sign-In.");
      }
      return;
    }

    // 3. Mobile in Expo Go: Prompt developer/user that a development build is required (matching Kalki_Sena_Drive)
    setLoading(false);
    Alert.alert(
      "Development Build Required",
      "Google Sign-In uses native Google Play Services / iOS frameworks and requires a development build (npx expo run:ios or EAS build). It is not available in the standard Expo Go app.\n\nYou can continue testing using Email OTP or Phone OTP in Expo Go."
    );
  };

  // ==========================================
  // PHONE FLOW (Passwordless) - Temporarily disabled (Coming Soon)
  // ==========================================
  const handlePhoneLoginPress = () => {
    Alert.alert(
      "Coming Soon",
      "Phone number login is coming soon. Please continue with Google or Email for now."
    );
  };

  /*
  const handleSendPhoneOtp = async () => {
    const cleanPhone = phoneNumber.replace(/[\s-]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setLocalError("Please enter a valid phone number with country code.");
      return;
    }

    setLoading(true);
    setLocalError(null);
    try {
      await authApi.sendPhoneOtp(cleanPhone);
      setPhoneCountdown(60);
      setMode("phone_otp");
    } catch (err: any) {
      setLocalError(err.response?.data?.message || "Failed to send SMS OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.trim().length !== 6) {
      setLocalError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setLocalError(null);
    try {
      const cleanPhone = phoneNumber.replace(/[\s-]/g, "");
      await dispatch(
        verifyPhoneOtpThunk({
          phone: cleanPhone,
          otp: phoneOtp.trim(),
        }),
      ).unwrap();
      handleClose();
    } catch (err: any) {
      setLocalError(err || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };
  */

  // ==========================================
  // EMAIL FLOW
  // ==========================================
  const handleSendEmailOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setLocalError(null);
    try {
      await authApi.sendEmailOtp(cleanEmail);
      setEmailCountdown(60);
      setMode("email_otp");
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send email OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.trim().length !== 6) {
      setLocalError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setLocalError(null);
    try {
      const res: any = await dispatch(
        verifyEmailOtpThunk({
          email: email.trim().toLowerCase(),
          otp: emailOtp.trim(),
        }),
      ).unwrap();

      if (res?.isNewUser && res?.registrationToken) {
        setRegistrationToken(res.registrationToken);
        setMode("set_password");
      } else {
        handleClose();
      }
    } catch (err: any) {
      setLocalError(err || "Invalid email verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEmailRegistration = async () => {
    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setLocalError(null);
    try {
      const res = await authApi.setEmailPassword({
        registrationToken,
        email: email.trim().toLowerCase(),
        password: newPassword,
        name: fullName.trim() || undefined,
      });

      if (res.data?.success) {
        Alert.alert("Account Created", "Welcome to DealDoko!");
        handleClose();
      }
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message || "Failed to create password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetContainer}>
                {/* Drag Handle Indicator */}
                <View style={styles.handleBar} />

                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={THEME.colors.textSecondary}
                  />
                </TouchableOpacity>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.sheetContent}
                  keyboardShouldPersistTaps="handled"
                >
                {/* Brand Logo & Header */}
                <View style={styles.headerArea}>
                  <Image
                    source={require("../../../assets/images/dealdoko-logo.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.titleText}>Welcome Back</Text>
                  <Text style={styles.subtitleText}>
                    {mode === "initial" && "Choose how you want to continue"}
                    {mode === "phone" &&
                      "Enter your phone number to receive an OTP"}
                    {mode === "phone_otp" &&
                      `Enter 6-digit code sent to ${phoneNumber}`}
                    {mode === "email" && "Enter your email to receive an OTP"}
                    {mode === "email_otp" &&
                      `Enter 6-digit code sent to ${email}`}
                    {mode === "set_password" &&
                      "Create a secure password for your new account"}
                  </Text>
                </View>

                {/* Error Banner */}
                {(localError || authError) && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle"
                      size={18}
                      color={THEME.colors.danger}
                    />
                    <Text style={styles.errorText}>
                      {localError || authError}
                    </Text>
                  </View>
                )}

                {/* ========================================================= */}
                {/* INITIAL MODE */}
                {/* ========================================================= */}
                {mode === "initial" && (
                  <View style={styles.buttonsContainer}>
                    {/* Google Button */}
                    <TouchableOpacity
                      style={styles.googleButton}
                      onPress={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <Ionicons name="logo-google" size={20} color="#EA4335" />
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                    </TouchableOpacity>

                    {/* Email Button */}
                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() => setMode("email")}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={THEME.colors.primary}
                      />
                      <Text style={styles.outlineButtonText}>
                        Continue with Email
                      </Text>
                    </TouchableOpacity>

                    {/* OR Divider */}
                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>OR</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {/* Phone Button */}
                    <TouchableOpacity
                      style={styles.phoneButton}
                      onPress={handlePhoneLoginPress}
                    >
                      <Ionicons name="call-outline" size={20} color="#000000" />
                      <Text style={styles.phoneButtonText}>
                        Continue with Phone Number
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* ========================================================= */}
                {/* PHONE STEP 1 & 2: Temporarily disabled (Coming Soon)     */}
                {/* ========================================================= */}
                {/*
                {mode === "phone" && (
                  <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Mobile Phone Number</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={THEME.colors.textMuted}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        placeholder="+977 98XXXXXXXX"
                        placeholderTextColor={THEME.colors.textMuted}
                        autoFocus
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.primaryActionButton}
                      onPress={handleSendPhoneOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryActionText}>
                          Send Verification Code
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.backLink}
                      onPress={() => setMode("initial")}
                    >
                      <Text style={styles.backLinkText}>
                        ← Choose another method
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {mode === "phone_otp" && (
                  <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>
                      Enter 6-Digit SMS Code
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="keypad-outline"
                        size={20}
                        color={THEME.colors.textMuted}
                      />
                      <TextInput
                        style={[styles.textInput, styles.otpInput]}
                        value={phoneOtp}
                        onChangeText={setPhoneOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholder="••••••"
                        placeholderTextColor={THEME.colors.textMuted}
                        autoFocus
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.primaryActionButton}
                      onPress={handleVerifyPhoneOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryActionText}>
                          Verify & Login
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.resendRow}>
                      {phoneCountdown > 0 ? (
                        <Text style={styles.countdownText}>
                          Resend code in {phoneCountdown}s
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleSendPhoneOtp}>
                          <Text style={styles.resendActionText}>
                            Resend SMS Code
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.backLink}
                      onPress={() => setMode("phone")}
                    >
                      <Text style={styles.backLinkText}>
                        ← Change phone number
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                */}

                {/* ========================================================= */}
                {/* EMAIL STEP 1: Enter Email */}
                {/* ========================================================= */}
                {mode === "email" && (
                  <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={THEME.colors.textMuted}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="name@example.com"
                        placeholderTextColor={THEME.colors.textMuted}
                        autoFocus
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.primaryActionButton}
                      onPress={handleSendEmailOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryActionText}>
                          Send Verification Code
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.backLink}
                      onPress={() => setMode("initial")}
                    >
                      <Text style={styles.backLinkText}>
                        ← Choose another method
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* ========================================================= */}
                {/* EMAIL STEP 2: Verify Email OTP */}
                {/* ========================================================= */}
                {mode === "email_otp" && (
                  <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>
                      Enter 6-Digit Email Code
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="keypad-outline"
                        size={20}
                        color={THEME.colors.textMuted}
                      />
                      <TextInput
                        style={[styles.textInput, styles.otpInput]}
                        value={emailOtp}
                        onChangeText={setEmailOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholder="••••••"
                        placeholderTextColor={THEME.colors.textMuted}
                        autoFocus
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.primaryActionButton}
                      onPress={handleVerifyEmailOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryActionText}>
                          Verify Email
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.resendRow}>
                      {emailCountdown > 0 ? (
                        <Text style={styles.countdownText}>
                          Resend code in {emailCountdown}s
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleSendEmailOtp}>
                          <Text style={styles.resendActionText}>
                            Resend Email Code
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.backLink}
                      onPress={() => setMode("email")}
                    >
                      <Text style={styles.backLinkText}>
                        ← Change email address
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* ========================================================= */}
                {/* EMAIL STEP 3 (New User): Set Password */}
                {/* ========================================================= */}
                {mode === "set_password" && (
                  <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Full Name (Optional)</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={THEME.colors.textMuted}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Your full name"
                        placeholderTextColor={THEME.colors.textMuted}
                      />
                    </View>

                    <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                      Create Password
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={THEME.colors.textMuted}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholder="At least 6 characters"
                        placeholderTextColor={THEME.colors.textMuted}
                      />
                    </View>

                    <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                      Confirm Password
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={20}
                        color={THEME.colors.textMuted}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="Re-enter password"
                        placeholderTextColor={THEME.colors.textMuted}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.primaryActionButton}
                      onPress={handleCompleteEmailRegistration}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryActionText}>
                          Create Account & Sign In
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Terms & Privacy footer */}
                <View style={styles.footerArea}>
                  <Text style={styles.termsText}>
                    By continuing, you agree to DealDoko's{" "}
                    <Text style={styles.termsLink}>Terms of Use</Text> and{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: THEME.colors.backdrop,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radii.xl,
    borderTopRightRadius: THEME.radii.xl,
    maxHeight: "85%",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    ...THEME.shadows.lg,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.colors.border,
    alignSelf: "center",
    marginBottom: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerArea: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 150,
    height: 42,
    marginBottom: 12,
  },
  titleText: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: "700",
    color: THEME.colors.navy,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.dangerLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.radii.md,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.danger,
    flex: 1,
  },
  buttonsContainer: {
    gap: 12,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    height: 48,
    gap: 10,
    ...THEME.shadows.sm,
  },
  googleButtonText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: THEME.radii.md,
    height: 48,
    gap: 10,
  },
  outlineButtonText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    gap: 10,

    // backgroundColor: THEME.colors.primary,
    // borderRadius: THEME.radii.md,
    // ...THEME.shadows.sm,
  },
  phoneButtonText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "500",
    color: "#000000",
    textDecorationLine: "underline",
  },
  formContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: THEME.colors.surface,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: THEME.typography.sizes.base,
    color: THEME.colors.text,
  },
  otpInput: {
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: "700",
  },
  primaryActionButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radii.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    ...THEME.shadows.sm,
  },
  primaryActionText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resendRow: {
    alignItems: "center",
    marginTop: 12,
  },
  countdownText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textMuted,
  },
  resendActionText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  backLink: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 4,
  },
  backLinkText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
  },
  footerArea: {
    marginTop: 24,
    alignItems: "center",
  },
  termsText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: THEME.colors.primary,
    fontWeight: "600",
  },
});
