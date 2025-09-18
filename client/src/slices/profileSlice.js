import http from "../helpers/http";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: '',
    uploading: false,
  },  
  reducers: {
    clearError: (state) => {
      state.error = '';
    },
    setUploading: (state, action) => {
      state.uploading = action.payload;
    }
  },
  extraReducers: (builder) => { 
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const profileActions = profileSlice.actions;

export const profileReducer = profileSlice.reducer;

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (userId, thunkAPI) => {
  try {
    const {data} = await http({
      method: 'get',
      url: `/user/${userId}/profile`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    });
    return data;
  } catch (error) {
    // Don't show error here, let component handle it
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('profile/updateProfile', async ({userId, data}, thunkAPI) => {
  try {
    const response = await http({
      method: 'put',
      url: `/user/${userId}/profile`,
      data: data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    });
    // Return the data from the response (now includes user data)
    return response.data?.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to update profile');
  }
});
