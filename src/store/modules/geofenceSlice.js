import { createSlice } from '@reduxjs/toolkit';
import { addToDB, editInDB, deleteFromDB, getAllFromDB } from '@utils/indexedDB'; // 假设你有这些 IndexedDB 工具函数
import { createAsyncThunk } from '@reduxjs/toolkit';

// 异步操作：从 IndexedDB 加载数据
export const loadGeofences = createAsyncThunk('geofences/loadGeofences', async () => {
  const geofences = await getAllFromDB();  // 从 IndexedDB 获取所有地理围栏
  return geofences;
});

const geofenceSlice = createSlice({
  name: 'geofences',
  initialState: [],
  reducers: {
    initialState: {
      geofences: [],
      status: 'idle',  // 用于跟踪加载状态
      error: null,
    },

    addGeofence: (state, action) => {
      console.log("state--->",state)
      // debugger
      state.geofences.push(action.payload);  // 添加新的地理围栏
      try {
        addToDB(action.payload);             // 同步添加到 IndexedDB
      } catch (error) {
        console.error("添加地理围栏到 IndexedDB 时出错：", error);
      }
    },
    editGeofence: (state, action) => {
      const { id, newGeofence } = action.payload;
      const index = state.geofences.findIndex(geofence => geofence.id === id);
      if (index !== -1) {
        state.geofences[index] = newGeofence; // 编辑指定的地理围栏
        try {
          editInDB(id, newGeofence);          // 同步编辑到 IndexedDB
        } catch (error) {
          console.error("编辑地理围栏时出错：", error);
        }
      }
    },
    deleteGeofence: (state, action) => {
      const id = action.payload;
      state.geofences = state.geofences.filter(geofence => geofence.id !== id);
      try {
        deleteFromDB(id);                      // 从 IndexedDB 删除地理围栏
      } catch (error) {
        console.error("删除地理围栏时出错：", error);
      }
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(loadGeofences.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadGeofences.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.geofences = action.payload;
      })
      .addCase(loadGeofences.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { addGeofence, editGeofence, deleteGeofence } = geofenceSlice.actions;

export default geofenceSlice.reducer;
