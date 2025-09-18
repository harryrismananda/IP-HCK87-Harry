import { configureStore } from '@reduxjs/toolkit';
import { profileReducer } from "../slices/profileSlice";
import { courseDetailReducer } from '../slices/courseDetailSlice';
import { languageReducer } from '../slices/languageSlice';


export const store = configureStore({
  reducer: {
    profile: profileReducer,
    courseDetail: courseDetailReducer,
    language: languageReducer
  },
})