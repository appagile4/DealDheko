import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../../services/api";

export interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  about?: string;
  city?: string;
  isVerified?: boolean;
  role?: string;
  authProvider?: string;
  createdAt?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authModalVisible: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts true while checking stored session
  error: null,
  authModalVisible: false,
};

// Check local storage for persistent session
export const checkAuthSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("dealdheko_auth_token");
      if (!token) return null;

      // Verify token with backend
      const res = await authApi.getMe();
      if (res.data?.success && res.data?.user) {
        return { token, user: res.data.user };
      }

      // If token invalid, remove
      await AsyncStorage.removeItem("dealdheko_auth_token");
      await AsyncStorage.removeItem("dealdheko_user");
      return null;
    } catch (err: any) {
      await AsyncStorage.removeItem("dealdheko_auth_token");
      await AsyncStorage.removeItem("dealdheko_user");
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  }
);

// Unified Authentication: Login / Register with Google
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (
    payload: {
      credential?: string;
      idToken?: string;
      accessToken?: string;
      code?: string;
      userInfo?: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await authApi.googleAuth(payload);
      const { token, user } = res.data;
      if (token && user) {
        await AsyncStorage.setItem("dealdheko_auth_token", token);
        await AsyncStorage.setItem("dealdheko_user", JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue("Failed to retrieve user data from Google");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Google authentication failed");
    }
  }
);

// Unified Authentication: Verify Phone OTP (Passwordless)
export const verifyPhoneOtpThunk = createAsyncThunk(
  "auth/verifyPhoneOtp",
  async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.verifyPhoneOtp(phone, otp);
      const { token, user } = res.data;
      if (token && user) {
        await AsyncStorage.setItem("dealdheko_auth_token", token);
        await AsyncStorage.setItem("dealdheko_user", JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue("Failed to retrieve authentication token");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Invalid or expired SMS OTP");
    }
  }
);

// Unified Authentication: Verify Email OTP (Existing User)
export const verifyEmailOtpThunk = createAsyncThunk(
  "auth/verifyEmailOtp",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.verifyEmailOtp(email, otp);
      if (res.data?.isNewUser) {
        // Needs password creation
        return { isNewUser: true, email: res.data.email, registrationToken: res.data.registrationToken };
      }
      const { token, user } = res.data;
      if (token && user) {
        await AsyncStorage.setItem("dealdheko_auth_token", token);
        await AsyncStorage.setItem("dealdheko_user", JSON.stringify(user));
        return { token, user, isNewUser: false };
      }
      return rejectWithValue("Verification response incomplete");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Email verification failed");
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("dealdheko_auth_token");
  await AsyncStorage.removeItem("dealdheko_user");
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthModalVisible(state, action: PayloadAction<boolean>) {
      state.authModalVisible = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setAuthenticatedUser(state, action: PayloadAction<{ token: string; user: UserProfile }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.authModalVisible = false;
    },
  },
  extraReducers: (builder) => {
    // Check Session
    builder.addCase(checkAuthSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuthSession.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      } else {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      }
    });
    builder.addCase(checkAuthSession.rejected, (state) => {
      state.isLoading = false;
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    });

    // Google Login
    builder.addCase(loginWithGoogle.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginWithGoogle.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.authModalVisible = false;
    });
    builder.addCase(loginWithGoogle.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Phone OTP
    builder.addCase(verifyPhoneOtpThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyPhoneOtpThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.authModalVisible = false;
    });
    builder.addCase(verifyPhoneOtpThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Email OTP
    builder.addCase(verifyEmailOtpThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyEmailOtpThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      if (!action.payload.isNewUser && action.payload.token) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authModalVisible = false;
      }
    });
    builder.addCase(verifyEmailOtpThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });
  },
});

export const { setAuthModalVisible, clearAuthError, updateUser, setAuthenticatedUser } = authSlice.actions;
export default authSlice.reducer;
