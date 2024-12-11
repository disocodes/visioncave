import { configureStore } from '@reduxjs/toolkit';
import widgetDataReducer from './slices/widgetDataSlice';

export const store = configureStore({
  reducer: {
    widgetData: widgetDataReducer,
  },
});

export default store;
