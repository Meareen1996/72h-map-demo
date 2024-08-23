import { configureStore } from '@reduxjs/toolkit';
import geofenceReducer from './geofenceSlice';

 const store = configureStore({
  reducer: {
    geofences: geofenceReducer,
  },
});

export default store;