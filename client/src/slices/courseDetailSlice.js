import http from "../helpers/http";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { showError } from "../helpers/alert";

const courseDetailSlice = createSlice({
  name: 'courseDetail',
  initialState: {
    data: null,
    loading: false,
    error: '',  
  },
  reducers: {
    clearError: (state) => {
      state.error = '';
    },
    clearCourseDetail: (state) => {
      state.data = null;
      state.error = '';
    },
  },
  extraReducers: (builder) => { 
    builder
      .addCase(fetchCourseDetail.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchCourseDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCourseDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Show error alert when fetch fails
        showError({ response: { data: { message: action.payload } } });
      });
  },
});

export const courseDetailActions = courseDetailSlice.actions;
export const courseDetailReducer = courseDetailSlice.reducer;
export const fetchCourseDetail = createAsyncThunk('courseDetail/fetchCourseDetail', async (courseId, thunkAPI) => {
  try {
    const {data} = await http({
      method: 'get',
      url: `/courses/${courseId}`,
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
