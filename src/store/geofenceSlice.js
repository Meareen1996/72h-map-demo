import { createSlice } from '@reduxjs/toolkit';

const geofenceSlice = createSlice({
  name: 'geofences',
  initialState: [],
  reducers: {
    addGeofence: (state, action) => {
      state.push(action.payload);  // 添加新的地理围栏
    },
    editGeofence: (state, action) => {
      const { id, newGeofence } = action.payload;
      const index = state.findIndex(geofence => geofence.id === id);
      if (index !== -1) {
        state[index] = newGeofence; // 编辑指定的地理围栏
      }
    },
    deleteGeofence: (state, action) => {
      return state.filter(geofence => geofence.id !== action.payload); // 删除地理围栏
    },
  },
});

export const { addGeofence, editGeofence, deleteGeofence } = geofenceSlice.actions;

export default geofenceSlice.reducer;
