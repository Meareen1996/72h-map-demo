import { createSlice } from "@reduxjs/toolkit";
import {
  addToDB,
  editInDB,
  deleteFromDB,
  getAllFromDB,
  deleteSingleFromDB,
  getByIdFromDB,
} from "@utils/indexedDB"; // 假设你有这些 IndexedDB 工具函数
import { createAsyncThunk } from "@reduxjs/toolkit";

// 异步操作：从 IndexedDB 加载数据(所有)
export const loadGeofences = createAsyncThunk(
  "geofences/loadGeofences",
  async () => {
    const geofences = await getAllFromDB(); // 从 IndexedDB 获取所有地理围栏
    return geofences;
  }
);
// 异步操作：根据 ID 查找单个地理围栏
export const fetchGeofenceById = createAsyncThunk(
  "geofences/fetchGeofenceById",
  async (id) => {
    const geofence = await getByIdFromDB(id); // 从 IndexedDB 根据 ID 获取地理围栏
    return geofence;
  }
);

const geofenceSlice = createSlice({
  name: "geofences",
  initialState: {
    geofences: [],
    status: "idle", // 用于跟踪加载状态
    error: null,
    colors: [
      { value: "#FF0000", label: "红色" },
      { value: "#00FF00", label: "绿色" },
      { value: "#0000FF", label: "蓝色" },
      { value: "#FFFF00", label: "黄色" },
      { value: "#FFA500", label: "橙色" },
      { value: "#800080", label: "紫色" },
      { value: "#00FFFF", label: "青色" },
      { value: "#FFC0CB", label: "粉色" },
      { value: "#808080", label: "灰色" },
      { value: "#A52A2A", label: "棕色" },
      { value: "#000000", label: "黑色" },
      { value: "#FFFFFF", label: "白色" },
      { value: "#289af2", label: "默认边框色" },
      { value: "#29302c", label: "默认填充色" },
    ],
  },
  reducers: {
    // 新增单个
    addGeofence: (state, action) => {
      console.log("state.geofences--->", state.geofences);
      state.geofences.push(action.payload); // 添加新的地理围栏
      try {
        addToDB(action.payload); // 同步添加到 IndexedDB
      } catch (error) {
        console.error("添加地理围栏到 IndexedDB 时出错：", error);
      }
    },

    // 修改单个
    editGeofence: (state, action) => {
      const { id, newGeofence } = action.payload;
      const index = state.geofences.findIndex((geofence) => geofence.id === id);
      if (index !== -1) {
        state.geofences[index] = newGeofence; // 编辑指定的地理围栏
        try {
          editInDB(id, newGeofence); // 同步编辑到 IndexedDB
        } catch (error) {
          console.error("编辑地理围栏时出错：", error);
        }
      }
    },

    // 删除单个
    deleteGeofence: (state, action) => {
      const id = action.payload;
      console.log("要删除的id--->", id);
      console.log("state.geofences---->", state.geofences);
      const index = state.geofences.findIndex((geofence) => geofence.id === id);

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
      state.geofences = state.geofences.filter(
        (geofence) => !ids.includes(geofence.id)
      );
      try {
        deleteFromDB(ids); // 从 IndexedDB 批量删除地理围栏
      } catch (error) {
        console.error("批量删除地理围栏时出错：", error);
      }
    }
  },

  // 添加了一个 loadGeofences 的 extraReducers case，
  // 这样当 loadGeofences action 被触发时（例如，在应用启动时），
  // 它将调用 getAllFromDB 从 IndexedDB 中加载数据，并更新 Redux 状态中的 geofences。
  extraReducers: (builder) => {
    builder
      .addCase(loadGeofences.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadGeofences.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.geofences = action.payload;
      })
      .addCase(loadGeofences.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // .addCase(setGeofenceVisibility, (state, action) => {
      //   const { geofences } = action.payload;
      //   geofences.forEach((geofence) => {
      //     const index = state.geofences.findIndex(
      //       (item) => item.id === geofence.id
      //     );
      //     if (index !== -1) {
      //       state.geofences[index].isVisible = geofence.visible; // 设置地理围栏的可见性
      //       try {
      //         updateVisibleInDB(geofence.id, geofence.visible); // 同步更新到 IndexedDB
      //       } catch (error) {
      //         console.error("设置地理围栏可见性时出错：", error);
      //       }
      //     }
      //   });
      // });
  },
});

export const {
  addGeofence,
  editGeofence,
  deleteGeofence,
  batchDeleteGeofences,
  // setGeofenceVisibility,
} = geofenceSlice.actions;

export default geofenceSlice.reducer;
