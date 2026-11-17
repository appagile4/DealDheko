import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LocationState {
  selectedCity: string;
  locationModalVisible: boolean;
}

const initialState: LocationState = {
  selectedCity: "Kathmandu",
  locationModalVisible: false,
};

// Load saved city
export const loadSavedCity = createAsyncThunk("location/loadSaved", async () => {
  try {
    const saved = await AsyncStorage.getItem("dealdheko_selected_city");
    return saved || "Kathmandu";
  } catch {
    return "Kathmandu";
  }
});

// Set and persist city
export const setCityAndPersist = createAsyncThunk(
  "location/setCityAndPersist",
  async (city: string) => {
    await AsyncStorage.setItem("dealdheko_selected_city", city);
    return city;
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocationModalVisible(state, action: PayloadAction<boolean>) {
      state.locationModalVisible = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSavedCity.fulfilled, (state, action) => {
      state.selectedCity = action.payload;
    });
    builder.addCase(setCityAndPersist.fulfilled, (state, action) => {
      state.selectedCity = action.payload;
      state.locationModalVisible = false;
    });
  },
});

export const { setLocationModalVisible } = locationSlice.actions;
export default locationSlice.reducer;
