const dbName = 'GeofenceDB';
const storeName = 'geofences';

/**
 * Opens a connection to the indexedDB database.
 * @returns {Promise<IDBDatabase>} A Promise that resolves with the opened IDBDatabase instance.
 *                               Rejects with an error message on failure.
 */
export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject('Database error: ' + event.target.errorCode);
    };
  });
};

export const addToDB = async (data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject('Add failed: ' + event.target.errorCode);
    };

    tx.oncomplete = () => {
      console.log('Transaction completed');
    };

    tx.onerror = (event) => {
      reject('Transaction failed: ' + event.target.errorCode);
    };
  });
};

export const getAllFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject('Get all failed: ' + event.target.errorCode);
    };
  });
};

export const deleteFromDB = async (ids) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    ids.forEach(id => {
      const request = store.delete(id);

      request.onerror = (event) => {
        reject('Delete failed: ' + event.target.errorCode);
      };
    });

    tx.oncomplete = () => {
      resolve(true);
    };

    tx.onerror = (event) => {
      reject('Transaction failed: ' + event.target.errorCode);
    };
  });
};

export const editInDB = async (id, updatedData) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    const request = store.put({ ...updatedData, id });

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject('Edit failed: ' + event.target.errorCode);
    };

    tx.oncomplete = () => {
      console.log('Transaction completed');
    };

    tx.onerror = (event) => {
      reject('Transaction failed: ' + event.target.errorCode);
    };
  });
};