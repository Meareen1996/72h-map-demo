import { configureStore } from '@reduxjs/toolkit';
import geofenceReducer from './modules/geofenceSlice'; //从geofenceSlice 导入reducer

 const store = configureStore({
  reducer: {
    geofences: geofenceReducer,//确保在reducer中注册geofenceReducer
  },
});

export default store;