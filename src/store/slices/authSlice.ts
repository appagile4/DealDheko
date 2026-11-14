import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  about?: string;
  city?: string;
  isVerified: boolean;
  isGoogleLinked?: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  // OTP flow states
  otpPendingEmail: string | null;
  otpExpiresIn: number; // in seconds (starts at 60)
  isOtpExpired: boolean;
  isOtpPending: boolean;
  isUploadingAvatar: boolean;
}

// Initial hydration from localStorage - strictly require a valid dealdoko_token
const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("dealdoko_token");
    } catch {
      return null;
    }
  }
  return null;
};

const getInitialUser = (): UserProfile | null => {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("dealdoko_token");
      if (!token) {
        // If not authenticated, ensure cached user profile is cleared
        localStorage.removeItem("deal_dheko_user");
        return null;
      }
      const saved = localStorage.getItem("deal_dheko_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
  isLoading: false,
  error: null,
  successMessage: null,
  otpPendingEmail: null,
  otpExpiresIn: 60,
  isOtpExpired: false,
  isOtpPending: false,
  isUploadingAvatar: false,
};

// 1. Signup Thunk
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (
    payload: { name: string; email: string; password: string; phone?: string; city?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/signup", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to register. Please try again."
      );
    }
  }
);

// 2. Verify OTP Thunk
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/verify-otp", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to verify OTP. Please try again."
      );
    }
  }
);

// 3. Resend OTP Thunk
export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/resend-otp", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to resend OTP."
      );
    }
  }
);

// 4. Login Thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", payload);
      return response.data;
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.requiresVerification) {
        return rejectWithValue({
          message: data.message,
          requiresVerification: true,
          email: data.email,
        });
      }
      return rejectWithValue(
        err.response?.data?.message || "Invalid email or password."
      );
    }
  }
);

// 5. Logout Thunk
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Ignore error on network fail
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("dealdoko_token");
    localStorage.removeItem("deal_dheko_user");
  }
  return true;
});

// 6. Fetch Current User Thunk
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Session invalid");
    }
  }
);

// 7. Update User Profile Thunk
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    payload: {
      name?: string;
      about?: string;
      phone?: string;
      city?: string;
      avatar?: string;
      isGoogleLinked?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put("/auth/profile", payload);
      return response.data.user;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update profile."
      );
    }
  }
);

// 8. Upload User Avatar Thunk (uploads to Cloudinary & saves URL to MongoDB)
export const uploadUserAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/auth/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // { success, message, url, user }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to upload avatar to Cloudinary."
      );
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.successMessage = null;
    },
    setOtpPending: (state, action: PayloadAction<string>) => {
      state.isOtpPending = true;
      state.otpPendingEmail = action.payload;
      state.otpExpiresIn = 60;
      state.isOtpExpired = false;
      state.error = null;
    },
    clearOtpPending: (state) => {
      state.isOtpPending = false;
      state.otpPendingEmail = null;
      state.otpExpiresIn = 60;
      state.isOtpExpired = false;
    },
    decrementTimer: (state) => {
      if (state.otpExpiresIn > 0) {
        state.otpExpiresIn -= 1;
        if (state.otpExpiresIn === 0) {
          state.isOtpExpired = true;
          state.error = "OTP expired after 1 minute. Please click 'Resend OTP'.";
        }
      }
    },
    resetOtpTimer: (state, action: PayloadAction<number | undefined>) => {
      state.otpExpiresIn = action.payload || 60;
      state.isOtpExpired = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOtpPending = true;
        state.otpPendingEmail = action.payload.email;
        state.otpExpiresIn = action.payload.expiresIn || 60;
        state.isOtpExpired = false;
        state.successMessage = action.payload.message;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Registration failed.";
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isOtpPending = false;
        state.otpPendingEmail = null;
        state.successMessage = action.payload.message;

        if (typeof window !== "undefined") {
          localStorage.setItem("dealdoko_token", action.payload.token);
          localStorage.setItem("deal_dheko_user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Invalid OTP code.";
      });

    // Resend OTP
    builder
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpExpiresIn = action.payload.expiresIn || 60;
        state.isOtpExpired = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to resend OTP.";
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isOtpPending = false;
        state.otpPendingEmail = null;
        state.successMessage = action.payload.message;

        if (typeof window !== "undefined") {
          localStorage.setItem("dealdoko_token", action.payload.token);
          localStorage.setItem("deal_dheko_user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.isLoading = false;
        if (action.payload?.requiresVerification) {
          state.isOtpPending = true;
          state.otpPendingEmail = action.payload.email;
          state.otpExpiresIn = 60;
          state.isOtpExpired = false;
          state.error = action.payload.message;
        } else {
          state.error = (action.payload as string) || "Invalid email or password.";
        }
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isOtpPending = false;
      state.otpPendingEmail = null;
      state.error = null;
      state.successMessage = null;
    });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("deal_dheko_user", JSON.stringify(action.payload));
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.successMessage = "Profile updated successfully!";
        if (typeof window !== "undefined") {
          localStorage.setItem("deal_dheko_user", JSON.stringify(action.payload));
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to update profile.";
      });

    // Upload User Avatar (Cloudinary & MongoDB)
    builder
      .addCase(uploadUserAvatar.pending, (state) => {
        state.isUploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.isUploadingAvatar = false;
        state.user = action.payload.user;
        state.successMessage = "Profile picture uploaded to Cloudinary & saved to MongoDB!";
        if (typeof window !== "undefined") {
          localStorage.setItem("deal_dheko_user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.isUploadingAvatar = false;
        state.error = (action.payload as string) || "Failed to upload avatar to Cloudinary.";
      });
  },
});

export const {
  clearAuthError,
  clearAuthSuccess,
  setOtpPending,
  clearOtpPending,
  decrementTimer,
  resetOtpTimer,
} = authSlice.actions;

export default authSlice.reducer;
