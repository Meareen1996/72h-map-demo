// 封装事务处理逻辑
function handleTransaction(objectStore, request, successCallback, errorCallback) {
    request.onsuccess = function(event) {
        if (typeof successCallback === "function") {
            successCallback(event.target.result);
        }
    };

    request.onerror = function(event) {
        console.error("操作失败：", event.target.error);
        if (typeof errorCallback === "function") {
            errorCallback(event);
        }
    };
}

// 封装事务结束处理逻辑
function endTransactionWithLog(transaction, successMsg, errorMsg) {
    endTransaction(transaction, function(event) {
        console.log(successMsg, event);
    }, function(event) {
        console.error(errorMsg, event.target.error);
    });
}

// 修改数据
function updateData(id, geoInfoObj, geoPointObjs) {
    if (!id) {
        alert("id值不能为空");
        return;
    }

    // 初始化数据
    geoInfoObj = geoInfoObj || {
        id: id,
        name: "updatedGeoName-" + Math.floor(Math.random() * 10000),
        borderColor: 0xFF000000,
        fillColor: 0xFFFFFFFF,
        geoType: 0,
        createdTime: new Date()
    };

    geoPointObjs = geoPointObjs || [];
    for (let i = 1; i <= 10; i++) {
        geoPointObjs.push({
            id: i,
            geoInfoId: geoInfoObj.id,
            longitude: Math.random() * 100,
            latitude: Math.random() * 100,
            seqNo: i
        });
    }
    geoInfoObj.geoPoints = geoPointObjs;

    // 开启事务并处理更新
    const transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READWRITE);
    const geoInfosObjectStore = transaction.objectStore("geoInfosObjectStore");
    const updateRequest = geoInfosObjectStore.put(geoInfoObj);

    handleTransaction(geoInfosObjectStore, updateRequest, function() {
        endTransactionWithLog(transaction, "操作成功：【修改】【id=" + geoInfoObj.id + "】", "操作失败：【修改】【id=" + geoInfoObj.id + "】");
    });
}

// 分页查询
function listPageData(name, currentPage = 1, pageSize = 10, lastKey, resultsHandler) {
    const transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READWRITE);
    const geoInfosObjectStore = transaction.objectStore("geoInfosObjectStore");
    const objectIndex = geoInfosObjectStore.index('createdTime');
    const listPageRequest = objectIndex.openCursor(null, "prev");

    let results = [];
    const offset = (currentPage - 1) * pageSize;
    let counter = 0;

    listPageRequest.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            if (name && new RegExp(name.split("").join(".*")).test(cursor.value.name)) {
                counter++;
                if (counter > offset) {
                    results.push(cursor.value);
                    if (results.length === pageSize) {
                        resultsHandler(results);
                        return;
                    }
                }
            }
            cursor.continue();
        } else {
            resultsHandler(results);
        }
    };

    listPageRequest.onerror = function(event) {
        console.error("操作失败：【分页查询】【第" + currentPage + "页】", event.target.error);
    };
}

// 查询所有数据
function listAllData(resultsHandler) {
    const transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READONLY);
    const geoInfosObjectStore = transaction.objectStore('geoInfosObjectStore');
    const listAllRequest = geoInfosObjectStore.getAll();

    handleTransaction(geoInfosObjectStore, listAllRequest, function(result) {
        endTransactionWithLog(transaction, "操作成功：【查询全部】", "操作失败：【查询全部】");
        if (typeof resultsHandler === "function") {
            resultsHandler(result);
        }
    });
}

// 根据ID主键，查询单条数据详情
function findData(id, resultsHandler) {
    if (!id) {
        alert("id值不能为空");
        return;
    }

    const transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READONLY);
    const geoInfosObjectStore = transaction.objectStore('geoInfosObjectStore');
    const findRequest = geoInfosObjectStore.get(id);

    handleTransaction(geoInfosObjectStore, findRequest, function(result) {
        endTransactionWithLog(transaction, "操作成功：【查询】【id=" + id + "】", "操作失败：【查询】");
        if (typeof resultsHandler === "function") {
            resultsHandler(result);
        }
    });
}

// 退出时关闭数据库
window.addEventListener('unload', function () {
    alert("关闭数据库");
    closeDB(geoDB);
});