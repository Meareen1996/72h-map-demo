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
function openDB(dbName, version, changedCallback, successCallback, errorCallback) {
    version = version ? version : 1;
    var openDBReq = indexedDB.open(dbName, version);

    if (changedCallback) {
        //如果数据库不存在，版本更新时，open 操作会创建该数据库，然后触发onupgradeneeded事件
        openDBReq.onupgradeneeded = changedCallback;
    }

    // 设置打开数据库失败时的回调逻辑
    if (errorCallback) {
        openDBReq.onerror = errorCallback;
    } else {
        openDBReq.onerror = (event) => {
            // TODO 默认错误处理逻辑
            console.error("打开数据库出错：", event);
        };
    }

    // 设置打开数据库成功时的回调逻辑
    if (successCallback) {
        openDBReq.onsuccess = successCallback;
    } else {
        openDBReq.onsuccess = (event) => {
            // TODO 默认成功处理逻辑
            console.log("打开数据库成功：", event);
        };
    }

    return openDBReq;
}

/**
 * 关闭数据库：一般在整个应用退出【页面关闭】时调用
 *
 * @param db IndexDB数据库对象
 */
function closeDB(db) {
    db.close();
}


/**
 * 开启事务上下文
 *
 * @param db IndexDB数据库对象
 * @param objectStores 事务中待操作的 存储对象数组【类似表】
 * @param mode 模式：【"readonly";    // 0】【"readwrite";    // 1】
 * @returns {IDBTransaction}
 */
function startTransaction(db, objectStores, mode) {
    /*if(!mode){
        mode = TRAN_MODE_READONLY;
    }*/
    return db.transaction(objectStores, mode);
}

/**
 * 结束事务上下文
 *
 * @param transaction IndexDB事务对象
 * @param completeCallBack 事务完成回调函数
 * @param errorCallBack 事务出错回调函数
 */
function endTransaction(transaction, completeCallback, errorCallback) {
    // 事务完成回调，默认不处理
    if (completeCallback) {
        transaction.oncomplete = completeCallback;
    } else {
        transaction.oncomplete = function () { };
    }
    // 事务错误回调，默认不处理
    if (errorCallback) {
        transaction.onerror = errorCallback;
    } else {
        transaction.onerror = function () { };
    }
}


/**
 * 初始化geo业务数据库，比如创建存储对象、索引等
 *
 * @param event
 */
function geoDBInit(event) {
    // TODO 注意version变大时，考虑业务兼容性处理
    var db = event.target.result;

    // 创建对象存储（表）：简单起见只使用一张表，也可拆分为两张表
    // geoInfos【geo列表】字段描述 -> id：自增ID主键【新增的数据无需赋值】、name：名字、borderColor: 边框颜色【RGB整数值】, fillColor: 填充颜色【RGB整数值】, geoType: 坐标类型, createdTime：创建时间，geoPoints:坐标对象数组，参考geoPoints
    // 示例数据：{"id": 1, "name": "", "borderColor": 0xFF000000, "fillColor": 0xFF000000, "geoType": 0, "geoPoints":[{...}], "createdTime": new Date()}
    // geoPoints【geo坐标】字段描述 -> id：自增ID主键【新增的数据无需赋值】、geoInfoId：所属geoInfos的主键ID【单表情况下删除该字段】, "longitude": 经度,"latitude": 维度, seqNo: 顺序序号
    // 示例数据：{"id": 1, "geoInfoId": 1, "longitude": 32.63,"latitude": 31.72, "seqNo": 1}
    var geoInfosObjectStore;
    if (!db.objectStoreNames.contains('geoInfosObjectStore')) {
        geoInfosObjectStore = db.createObjectStore("geoInfosObjectStore", { keyPath: "id", autoIncrement: true });
        geoInfosObjectStore.createIndex("createdTime", ["createdTime"], { unique: false });
        // 如果需要根据经纬度查询：可以创建索引
        // geoInfosObjectStore.createIndex("lat_lon", ["latitude", "longitude"], {unique: false});
        //geoInfosObjectStore.createIndex("geoInfoId", "geoInfoId", {unique: false});
        // geoPointsObjectStore = db.createObjectStore("geoPointsObjectStore", {keyPath: "id", autoIncrement: true});
    }
}

/**
 * 数据库准备好以后的逻辑
 *
 * @param event
 */
function geoDBReady(event) {
    // TODO 将数据库对象保存起来
    window.geoDB = event.target.result;
    window.geoDBName = geoDB.name;
    window.TRAN_MODE_READONLY = "readonly"; 	// 0
    window.TRAN_MODE_READWRITE = "readwrite"; 	// 1
    //return geoDB;
}




// --------------以下是业务逻辑----------------------------

/**
 * 添加新数据：构造一个json对象，新增的数据不需要设置ID，数据库默认会赋值，添加成功后返回ID
 *
 * @param geoInfoObj geoInfoObj + geoPointObjs 可合并成一个，也可拆分成两张表
 * @param geoPointObjs geoInfoObj + geoPointObjs 可合并成一个，也可拆分成两张表
 */
function insertData(geoInfoObj, geoPointObjs) {

    // 根据业务需要去重判断：查看是否已经在表里存在，比如名字冲突

    // 构造测试数据开始-----------------------：比如可通过监听onclick等事件获取表单数据构造
    currTime = currTime + 1000
    geoInfoObj = { "name": "myGeoName-" + Math.floor(Math.random() * 10000), "borderColor": 0xFF000000, "fillColor": 0xFFFFFFFF, "geoType": 0, "createdTime": new Date(currTime) };
    geoPointObjs = [];
    for (var i = 1; i <= 10; i++) {
        geoPointObjs.push({ "id": i, "geoInfoId": geoInfoObj.id, "longitude": Math.floor(Math.random() * 10000) / 100, "latitude": Math.floor(Math.random() * 10000) / 100, "seqNo": i });
    }
    geoInfoObj.geoPoints = geoPointObjs;
    // 构造测试数据结束-------------------------------------------------------------------

    // 开启事务，事务的上下文在此处开始
    var transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READWRITE);
    var geoInfosObjectStore = transaction.objectStore("geoInfosObjectStore");
    //var geoPointsObjectStore = transaction.objectStore("geoPointsObjectStore");

    // 写入数据库
    var request1 = geoInfosObjectStore.add(geoInfoObj);
    request1.onsuccess = function (event) {
        // 获取主键ID：this.result，开始插入第二张表
        console.log("geoInfo信息添加成功：", this.result);
    };
    request1.onerror = function (event) {
        console.error("geoInfo信息添加失败：", event);
    }

    /*
    geoPointObjs.forEach(function(data) {
        var r = geoPointsObjectStore.put(data);
        r.onsuccess = function(event) {
            console.log("geoPoint信息添加成功：", event);
        };
        r.onerror = function(event) {
            console.error("geoPoint信息添加失败：", event);
        }
    });*/

    endTransaction(transaction, function (event) {
        console.log("事务完成：", event);
    }, function (event) {
        console.error("事务出错：", event);
    });
}

/**
 * 根据ID删除对应的数据
 *
 * @param id 待删除数据的ID值
 */
function deleteData(id) {

    // 开启事务，事务的上下文在此处开始
    var transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READWRITE);
    var geoInfosObjectStore = transaction.objectStore("geoInfosObjectStore");
    //var geoPointsObjectStore = transaction.objectStore("geoPointsObjectStore");

    // 删除操作
    var request1 = geoInfosObjectStore.delete(id);
    request1.onsuccess = function (event) {
        console.log("geoInfo信息删除成功：", this.result);
    };
    request1.onerror = function (event) {
        console.error("geoInfo信息删除失败：", event);
    }

    endTransaction(transaction, function (event) {
        console.log("事务完成", event);
    }, function (event) {
        console.error("事务出错：", event);
    });

}

/**
 * 修改数据：构造一个新的json对象，必须指定ID【即旧数据的ID】，使用新的json数据，覆盖旧的json数据
 *
 * @param id 待修改数据的ID主键值
 * @param geoInfoObj geoInfoObj + geoPointObjs 可合并成一个，也可拆分成两张表
 * @param geoPointObjs geoInfoObj + geoPointObjs 可合并成一个，也可拆分成两张表
 */
function updateData(id, geoInfoObj, geoPointObjs) {

    // 构造测试数据开始-----------------------：比如可通过监听onclick等事件获取表单数据构造
    geoInfoObj = { "id": id, "name": "updatedGeoName-" + Math.floor(Math.random() * 10000), "borderColor": 0xFF000000, "fillColor": 0xFFFFFFFF, "geoType": 0, "createdTime": new Date() };
    geoPointObjs = [];
    for (var i = 1; i <= 10; i++) {
        geoPointObjs.push({ "id": i, "geoInfoId": geoInfoObj.id, "longitude": Math.floor(Math.random() * 10000) / 100, "latitude": Math.floor(Math.random() * 10000) / 100, "seqNo": i });
    }
    geoInfoObj.geoPoints = geoPointObjs;
    // 构造测试数据结束-------------------------------------------------------------------

    // 开启事务，事务的上下文在此处开始
    var transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READWRITE);

    var geoInfosObjectStore = transaction.objectStore("geoInfosObjectStore");
    //var geoPointsObjectStore = transaction.objectStore("geoPointsObjectStore");

    // 修改操作：直接覆盖旧值
    var request1 = geoInfosObjectStore.put(geoInfoObj);
    request1.onsuccess = function (event) {
        // 获取主键ID：this.result，开始插入第二张表
        console.log("geoInfo信息修改成功：", this.result);

    };
    request1.onerror = function (event) {
        console.error("geoInfo信息修改失败：", event);
    }

    endTransaction(transaction, function (event) {
        console.log("事务完成", event);
    }, function (event) {
        console.error("事务出错：", event);
    });
}


/**
 * 分页查询
 *
 * @param currentPage 当前页码
 * @param pageSize 页大小
 * @param lastKey
 */
/**
 * Fetches paginated data from the geoInfosObjectStore based on the provided name, current page, page size, and last key.
 * 
 * @param {string} name - The name to filter the geoInfos by, if provided.
 * @param {number} currentPage - The current page number for pagination.
 * @param {number} pageSize - The number of items to return per page.
 * @param {string} lastKey - The last key of the previous page to start the cursor from.
 * @param {function} resultsHandler - The callback function to handle the results.
 * @returns {void}
 */
function listPageData(name, currentPage, pageSize, lastKey, resultsHandler) {
    currentPage = currentPage <= 0 ? 1 : currentPage;
    pageSize = pageSize <= 0 ? 10 : pageSize;

    var regExp = null;
    if (name) {
        name = name.trim();
        if (name.length > 0) {
            regTxt = ".*"
            for (var i = 0; i < name.length; i++) {
                regTxt = regTxt + name.charAt(i) + ".*";
            }
            regExp = new RegExp(regTxt);
        }
    }

    var transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READWRITE);
    var geoInfosObjectStore = transaction.objectStore("geoInfosObjectStore");
    var objectIndex = geoInfosObjectStore.index('createdTime')
    var request = objectIndex.openCursor(null, "prev");//降序
    //var request = geoInfosObjectStore.openCursor();

    // var range = lastKey ? IDBKeyRange.lowerBound(lastKey, true) : null;
    var results = [];
    var offset = (currentPage - 1) * pageSize;
    var skipFlag = true;
    var counter = 0;

    request.onsuccess = function (event) {
        var cursor = event.target.result;

        // 需要正则表达式模糊匹配
        if (regExp) {
            if (cursor) {
                if (regExp.test(cursor.value.name)) {
                    counter++;
                    if (counter < offset + 1) {
                        // 继续遍历下一个记录
                        cursor.continue();
                        return;
                    } else {
                        results.push(cursor.value);
                        if (results.length < pageSize) {
                            // 继续遍历下一个记录
                            cursor.continue();
                            return;
                        } else {
                            // 手动停止游标，不再继续调用 cursor.continue()
                            resultsHandler(results);
                            return;
                        }
                    }
                } else {
                    // 继续遍历下一个记录
                    cursor.continue();
                    return;
                }
            } else {
                resultsHandler(results);
            }
        } else {
            if (offset > 0 && skipFlag) {
                skipFlag = false;
                // 跳过多少条
                cursor.advance(offset);
                return;
            }
            if (cursor) {
                results.push(cursor.value);
                if (results.length < pageSize) {
                    // 继续遍历下一个记录
                    cursor.continue();
                } else {
                    // 手动停止游标，不再继续调用 cursor.continue()
                    resultsHandler(results);
                    return;
                }
            } else {
                resultsHandler(results);
            }
        }
    }

    request.onerror = function (event) {
        console.error("分页查询出错：currentPage=" + currentPage + ": " + event.target.error)
    }
}

/**
 * 查询所有数据
 */
function listAllData() {

    var transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READONLY);

    var geoInfosObjectStore = transaction.objectStore('geoInfosObjectStore');
    var getReq = geoInfosObjectStore.getAll();
    getReq.onsuccess = function () {
        console.log('读取数据成功: ', this.result);
    }
    getReq.onerror = function (event) {
        console.error('读取数据失败', event);
    }

    endTransaction(transaction, function (event) {
        console.log("事务完成", event);
    }, function (event) {
        console.error("事务出错：", event);
    });
}

/**
 * 根据ID主键，查询单条数据详情
 * @param id
 */
function findData(id) {

    var transaction = startTransaction(geoDB, ["geoInfosObjectStore"], TRAN_MODE_READONLY);

    var geoInfosObjectStore = transaction.objectStore('geoInfosObjectStore');
    var getReq = geoInfosObjectStore.get(id);
    getReq.onsuccess = function () {
        console.log('读取数据成功: ', this.result);
    }
    getReq.onerror = function (event) {
        console.error('读取数据失败', event);
    }

    endTransaction(transaction, function (event) {
        console.log("事务完成", event);
    }, function (event) {
        console.error("事务出错：", event);
    });
}


// -------------------- 以下是测试 【F12 控制台 有日志打印】--------------------------------------
// 删除数据库
//indexedDB.deleteDatabase("geoDB");


var abc;
openDB("geoDB", abc, geoDBInit, geoDBReady, function (event) {
    console.error("打开数据库失败：", event);
});

function doTest() {

    // 模拟时间
    currTime = new Date().getTime();

    // 插入数据：内部模拟随机数据
    for (var i = 0; i < 30; i++) {
        //insertData();
    }

    // 根据ID查询数据
    findData(3);

    // 更新id=3的数据：内部模拟随机数据
    updateData(3);

    // 查找id=3的数据
    findData(3);

    // 获取所有数据
    listAllData();

    // 分页查询
    listPageData('Name77', 2, 10, null, function (data) {
        console.log("分页查询结果：", data);
    });
}

setTimeout(doTest, 1000);