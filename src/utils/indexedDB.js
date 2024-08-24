import { message } from "antd";

/**
 * 打开一个数据库：一般在整个应用【或者页面】初始化阶段调用，并全局共享
 *
 * @param dbName 数据库名称
 * @param version 对应的版本号，自定义，整数
 * @param changedCallback 初始化，或者版本号变更情况下的回调函数
 * @param successCallback 打开成功时的回调函数
 * @param errorCallback 打开失败时的回调函数
 * @returns {IDBOpenDBRequest}
 */
export const openDB = (dbName = "GeofenceDB", version = 1, changedCallback) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    // 当数据库版本变化或者数据库首次被创建时，触发此回调
    if (changedCallback) {
      request.onupgradeneeded = changedCallback;
    } else {
      request.onupgradeneeded = (event) => {
        geoDBInit(event); // 初始化数据库
      };
    }

    // 成功打开数据库
    request.onsuccess = (event) => {
      const db = event.target.result;
      window.geoDB = db; // 可以选择在全局存储数据库引用
      window.geoDBName = db.name;
      resolve(db);
    };

    // 打开数据库失败
    request.onerror = (event) => {
      reject("Database error: " + event.target.errorCode);
    };
  });
};

/**
 * 初始化geo业务数据库，比如创建存储对象、索引等
 *
 * @param event
 */
/**
 * Initializes the indexedDB schema for geo information.
 *
 * @param {Event} event - The event object containing the result target.
 * @returns {void}
 */
function geoDBInit(event, storeName = "geofences") {
  // TODO 注意version变大时，考虑业务兼容性处理
  const db = event.target.result;
  if (!db.objectStoreNames.contains(storeName)) {
    const geoInfosObjectStore = db.createObjectStore(storeName, {
      keyPath: "id",
    });
    geoInfosObjectStore.createIndex("createdTime", "createdTime", {
      unique: false,
    });
  }
  // 如果需要根据经纬度查询：可以创建索引
  // geoInfosObjectStore.createIndex("lat_lon", ["latitude", "longitude"], {unique: false});
}

//新增记录
export const addToDB = async (data, storeName = "geofences") => {
  console.log("DB拿到的要添加的数据---->", data);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject("Add failed: " + event.target.errorCode);
    };

    tx.oncomplete = () => {
      message.success("新增成功");
    };

    tx.onerror = (event) => {
      reject("Transaction failed: " + event.target.errorCode);
    };
  });
};

//查询记录(所有)
export const getAllFromDB = async (storeName = "geofences") => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Get all failed: " + event.target.errorCode);
    };
  });
};

/**
 * 根据id查找单条记录
 *
 * @param id 要查找的记录的id
 * @param storeName 数据库中存储对象的名称，默认为 'geofences'
 * @returns {Promise<Object|null>} 返回找到的记录对象，如果没有找到则返回null
 */
export const getByIdFromDB = async (id, storeName = "geofences") => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    const request = store.get(id);

    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result) {
        resolve(result);
      } else {
        resolve(null); // 没有找到记录，返回null
      }
    };

    request.onerror = (event) => {
      reject("Get by ID failed: " + event.target.errorCode);
    };

    tx.oncomplete = () => {
      message.success("查找成功");
    };

    tx.onerror = (event) => {
      reject("Transaction failed: " + event.target.errorCode);
    };
  });
};

/**
 * 删除单个id的记录
 *
 * @param id 要删除的记录的id
 * @param storeName 数据库中存储对象的名称
 * @returns {Promise<boolean>}
 */
export const deleteSingleFromDB = async (id, storeName = "geofences") => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject("Delete single failed: " + event.target.errorCode);
    };

    tx.oncomplete = () => {
      message.success("删除成功");
    };

    tx.onerror = (event) => {
      reject("Transaction failed: " + event.target.errorCode);
    };
  });
};

//删除记录(批量删除)
export const deleteFromDB = async (ids, storeName = "geofences") => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    ids.forEach((id) => {
      const request = store.delete(id);

      request.onerror = (event) => {
        reject("Delete failed: " + event.target.errorCode);
      };
    });

    tx.oncomplete = () => {
      resolve(true);
      message.success("数据已删除")
    };

    tx.onerror = (event) => {
      reject("Transaction failed: " + event.target.errorCode);
    };
  });
};

//编辑记录
export const editInDB = async (id, updatedData, storeName = "geofences") => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const request = store.put({ ...updatedData, id });

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject("Edit failed: " + event.target.errorCode);
    };

    tx.oncomplete = () => {
      message.success("编辑成功");
    };

    tx.onerror = (event) => {
      reject("Transaction failed: " + event.target.errorCode);
    };
  });
};

/**
 * 分页查询
 *
 * @param page 当前页数
 * @param pageSize 每页数据条数
 * @param searchName 查询的名字关键字
 * @returns {Promise<Array>}
 */
export const pageQuery = async (
  page,
  pageSize,
  searchName,
  storeName = "geofences"
) => {
  console.log("page, pageSize, searchName", page, pageSize, searchName);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    let cursorRequest = store.openCursor(); // 直接打开游标

    let count = 0;
    let result = [];

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result;

      if (cursor) {
        const record = cursor.value;
        // 检查当前记录是否匹配搜索名，如果 searchName 存在
        if (
          !searchName ||
          (record.name &&
            record.name.toLowerCase().includes(searchName.toLowerCase()))
        ) {
          if (count >= (page - 1) * pageSize && count < page * pageSize) {
            result.push(record);
          }
          count++;
        }
        cursor.continue();
      } else {
        // 游标完成
        console.log("result---->", result);
        resolve(result);
      }
    };

    cursorRequest.onerror = (event) => {
      reject("Page query failed: " + event.target.errorCode);
    };
  });
};
