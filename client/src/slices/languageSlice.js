import http from "../helpers/http";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { showError } from "../helpers/alert";

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    data: [],
    loading: false,
    error: '',  
  },
  reducers: {
    clearError: (state) => {
      state.error = '';
    },
  },
  extraReducers: (builder) => { 
    builder
      .addCase(fetchLanguage.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchLanguage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLanguage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Show error alert when fetch fails
        showError({ response: { data: { message: action.payload } } });
      });
  },
});

export const languageActions = languageSlice.actions;
export const languageReducer = languageSlice.reducer;
export const fetchLanguage = createAsyncThunk('language/fetchLanguage', async (_, thunkAPI) => {
  try {
    const {data} = await http({
      method: 'get',
      url: `/languages`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    })
    return data;
  }
  catch (error) { 
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  } 
});
