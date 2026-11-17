import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { listingsApi } from "../../services/api";

export interface AdvertisementItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  condition: "New" | "Used";
  images: Array<{ url: string; publicId?: string }>;
  location: {
    state?: string;
    city: string;
    area?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
  seller: {
    _id: string;
    name: string;
    avatar?: string;
    city?: string;
    phone?: string;
    email?: string;
    isVerified?: boolean;
    createdAt?: string;
    about?: string;
  };
  sellerContact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  status: "pending" | "approved" | "rejected" | "sold";
  isFeatured: boolean;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ListingsState {
  approvedAds: AdvertisementItem[];
  featuredAds: AdvertisementItem[];
  searchResults: AdvertisementItem[];
  currentAd: AdvertisementItem | null;
  relatedAds: AdvertisementItem[];
  
  // Filters
  selectedCategory: string;
  selectedCity: string;
  selectedCondition: string;
  sortBy: string;
  minPrice?: number;
  maxPrice?: number;

  // Pagination & Loading
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isSearching: boolean;
  error: string | null;
}

const initialState: ListingsState = {
  approvedAds: [],
  featuredAds: [],
  searchResults: [],
  currentAd: null,
  relatedAds: [],

  selectedCategory: "all",
  selectedCity: "All Nepal",
  selectedCondition: "All",
  sortBy: "newest",

  page: 1,
  totalPages: 1,
  totalCount: 0,
  isLoading: false,
  isRefreshing: false,
  isSearching: false,
  error: null,
};

// Fetch Approved Listings (Paginated)
export const fetchApprovedListings = createAsyncThunk(
  "listings/fetchApproved",
  async (
    params: {
      category?: string;
      city?: string;
      minPrice?: number;
      maxPrice?: number;
      condition?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
      refresh?: boolean;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await listingsApi.getApproved({
        category: params.category && params.category !== "all" ? params.category : undefined,
        city: params.city && params.city !== "All Nepal" ? params.city : undefined,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        condition: params.condition && params.condition !== "All" ? params.condition : undefined,
        sortBy: params.sortBy,
        page: params.page || 1,
        limit: params.limit || 16,
      });

      return {
        ads: res.data.advertisements || [],
        total: res.data.total || 0,
        page: res.data.page || 1,
        pages: res.data.pages || 1,
        isRefresh: Boolean(params.refresh || params.page === 1),
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load listings");
    }
  }
);

// Fetch Featured Listings
export const fetchFeaturedListings = createAsyncThunk(
  "listings/fetchFeatured",
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const res = await listingsApi.getFeatured(limit);
      return res.data.advertisements || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load featured ads");
    }
  }
);

// Search Listings
export const searchListingsThunk = createAsyncThunk(
  "listings/search",
  async (
    params: { q?: string; city?: string; category?: string; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await listingsApi.search({
        q: params.q,
        city: params.city && params.city !== "All Nepal" ? params.city : undefined,
        category: params.category && params.category !== "all" ? params.category : undefined,
        page: params.page || 1,
      });
      return {
        results: res.data.advertisements || [],
        total: res.data.total || 0,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Search failed");
    }
  }
);

// Fetch Single Listing by Slug
export const fetchListingBySlug = createAsyncThunk(
  "listings/fetchBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const res = await listingsApi.getBySlug(slug);
      return res.data.advertisement;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load advertisement");
    }
  }
);

// Fetch Related Listings
export const fetchRelatedListings = createAsyncThunk(
  "listings/fetchRelated",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await listingsApi.getRelated(id);
      return res.data.advertisements || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load related ads");
    }
  }
);

const listingsSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
      state.page = 1;
    },
    setSelectedCity(state, action: PayloadAction<string>) {
      state.selectedCity = action.payload;
      state.page = 1;
    },
    setSelectedCondition(state, action: PayloadAction<string>) {
      state.selectedCondition = action.payload;
      state.page = 1;
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setPriceFilter(state, action: PayloadAction<{ min?: number; max?: number }>) {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
      state.page = 1;
    },
    clearFilters(state) {
      state.selectedCategory = "all";
      state.selectedCity = "All Nepal";
      state.selectedCondition = "All";
      state.sortBy = "newest";
      state.minPrice = undefined;
      state.maxPrice = undefined;
      state.page = 1;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Approved Listings
    builder.addCase(fetchApprovedListings.pending, (state, action) => {
      if (action.meta.arg?.refresh || action.meta.arg?.page === 1) {
        state.isRefreshing = true;
      } else {
        state.isLoading = true;
      }
      state.error = null;
    });
    builder.addCase(fetchApprovedListings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.totalCount = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.pages;

      if (action.payload.isRefresh) {
        state.approvedAds = action.payload.ads;
      } else {
        // Append unique items
        const existingIds = new Set(state.approvedAds.map((a) => a._id));
        const newItems = action.payload.ads.filter((a: AdvertisementItem) => !existingIds.has(a._id));
        state.approvedAds = [...state.approvedAds, ...newItems];
      }
    });
    builder.addCase(fetchApprovedListings.rejected, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = action.payload as string;
    });

    // Featured Listings
    builder.addCase(fetchFeaturedListings.fulfilled, (state, action) => {
      state.featuredAds = action.payload;
    });

    // Search
    builder.addCase(searchListingsThunk.pending, (state) => {
      state.isSearching = true;
    });
    builder.addCase(searchListingsThunk.fulfilled, (state, action) => {
      state.isSearching = false;
      state.searchResults = action.payload.results;
    });
    builder.addCase(searchListingsThunk.rejected, (state) => {
      state.isSearching = false;
    });

    // Single by Slug
    builder.addCase(fetchListingBySlug.pending, (state) => {
      state.isLoading = true;
      state.currentAd = null;
    });
    builder.addCase(fetchListingBySlug.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentAd = action.payload;
    });
    builder.addCase(fetchListingBySlug.rejected, (state) => {
      state.isLoading = false;
    });

    // Related
    builder.addCase(fetchRelatedListings.fulfilled, (state, action) => {
      state.relatedAds = action.payload;
    });
  },
});

export const {
  setSelectedCategory,
  setSelectedCity,
  setSelectedCondition,
  setSortBy,
  setPriceFilter,
  clearFilters,
  clearSearchResults,
} = listingsSlice.actions;

export default listingsSlice.reducer;
