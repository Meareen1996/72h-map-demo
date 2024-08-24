import { createSlice } from '@reduxjs/toolkit';
import { addToDB, editInDB, deleteFromDB, getAllFromDB, deleteSingleFromDB, updateVisibleInDB, getByIdFromDB } from '@utils/indexedDB'; // 假设你有这些 IndexedDB 工具函数
import { createAsyncThunk } from '@reduxjs/toolkit';

// 异步操作：从 IndexedDB 加载数据(所有)
export const loadGeofences = createAsyncThunk('geofences/loadGeofences', async () => {
  const geofences = await getAllFromDB();  // 从 IndexedDB 获取所有地理围栏
  return geofences;
});
// 异步操作：根据 ID 查找单个地理围栏
export const fetchGeofenceById = createAsyncThunk('geofences/fetchGeofenceById', async (id) => {
  const geofence = await getByIdFromDB(id);  // 从 IndexedDB 根据 ID 获取地理围栏
  return geofence;
});

const geofenceSlice = createSlice({
  name: 'geofences',
  initialState: {
    geofences: [],
    status: 'idle',  // 用于跟踪加载状态
    error: null,
  },
  reducers: {
    // 新增单个
    addGeofence: (state, action) => {
      console.log("state--->", state)
      // debugger
      state.geofences.push(action.payload);  // 添加新的地理围栏
      try {
        addToDB(action.payload);             // 同步添加到 IndexedDB
      } catch (error) {
        console.error("添加地理围栏到 IndexedDB 时出错：", error);
      }
    },

    // 修改单个
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

    // 删除单个
    deleteGeofence: (state, action) => {
      const id = action.payload;
      console.log("要删除的id--->", id);

      
      const index = state.geofences.findIndex(geofence => geofence.id === id);
      if (index !== -1) {
        state.geofences.splice(index, 1); // 从状态中删除指定ID的地理围栏
        try {
          deleteSingleFromDB(id); // 同步从 IndexedDB 删除地理围栏
        } catch (error) {
          console.error("删除地理围栏时出错：", error);
        }
      }
    },
    // 批量删除
    batchDeleteGeofences: (state, action) => {
      const ids = action.payload;
      state.geofences = state.geofences.filter(geofence => !ids.includes(geofence.id));
      try {
        deleteFromDB(ids);                      // 从 IndexedDB 批量删除地理围栏
      } catch (error) {
        console.error("批量删除地理围栏时出错：", error);
      }
    },

    // 批量更新围栏可见与不可见
    setGeofenceVisibility: (state, action) => {
      const { geofences } = action.payload;
      const updatedGeofences = geofences.map(geofence => {
        const index = state.geofences.findIndex(item => item.id === geofence.id);
        if (index !== -1) {
          state.geofences[index].isVisible = geofence.visible; // 设置地理围栏的可见性
          return geofence; // 返回更新后的地理围栏对象
        }
        return null; // 如果没有找到匹配的地理围栏，返回null
      }).filter(item => item !== null); // 过滤掉null值，只保留更新后的地理围栏对象

      try {
        updateVisibleInDB(updatedGeofences); // 使用更新后的数组同步更新到 IndexedDB
      } catch (error) {
        console.error("批量更新地理围栏可见性时出错：", error);
      }
    }
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
      })
      .addCase(setGeofenceVisibility, (state, action) => {
        const { geofences } = action.payload;
        geofences.forEach(geofence => {
          const index = state.geofences.findIndex(item => item.id === geofence.id);
          if (index !== -1) {
            state.geofences[index].isVisible = geofence.visible; // 设置地理围栏的可见性
            try {
              updateVisibleInDB(geofence.id, geofence.visible); // 同步更新到 IndexedDB
            } catch (error) {
              console.error("设置地理围栏可见性时出错：", error);
            }
          }
        });
      });
  },
});



export const { addGeofence, editGeofence, deleteGeofence, batchDeleteGeofences, setGeofenceVisibility } = geofenceSlice.actions;

export default geofenceSlice.reducer;
