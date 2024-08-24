import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Space, Button, message } from "antd";
import ConfigPop from "@components/configPop";
import "./map.scss";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import {
  addGeofence,
  editGeofence,
  deleteGeofence,
} from "@store/modules/geofenceSlice";
import useGeofences from "@hooks/geoHook"; // 根据你的实际文件路径调整  // 从 Redux 中导入相应的 actions
import { compareJsonArrays } from "@utils/toolkit";
const containerStyle = {
  width: "100%",
  height: "calc(100% - 60px)",
};
const libraries = ["drawing", "marker"];
const mapKey = "AIzaSyAyZ4S3bvIDOyrKYR3IGpjl9YmVPVZn_9M"; // 替换为你的实际API密钥
// const mapKey = 'AIzaSyCYEjZVnDQWY01I6XMdQq5pj8FXsvu2V28'; // 替换为你的实际API密钥
// 中文姓名生成函数
const generateChineseName = () => {
  const familyNames = [
    "赵",
    "钱",
    "孙",
    "李",
    "周",
    "xx",
    "yy",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "t",
  ];
  const givenNames = ["伟", "芳", "娜", "静", "强", "磊", "发", "烦", "和"];

  const familyName =
    familyNames[Math.floor(Math.random() * familyNames.length)];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  return familyName + givenName;
};
/**
 * React 组件，用于渲染带有地理围栏功能的地图。
 * 该组件管理在Google地图上绘制多边形，编辑现有的地理围栏，删除地理围栏以及通过配置弹窗添加新的地理围栏。
 */
const MapComponent = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: mapKey,
    libraries: libraries,
  });
  const dispatch = useDispatch();
  const { geofences } = useGeofences();
  const [map, setMap] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [visiblePop, setVisiblePop] = useState(false);

  const [handleModel, setHandleModel] = useState("add"); // 弹窗模式

  const [geofence, setGeofence] = useState({
    name: generateChineseName(),
    strokeColor: "#289af2",
    fillColor: "#29302c",
    visible: true,
  });

  // -----右键菜单编辑start------
  const [contextMenu, setContextMenu] = useState(null); // 上下文菜单状态

  //  点击右键菜单
  const handlePolygonRightClick = useCallback((event, geo) => {
    const polygon = polygonRefs.current[geo.id];
    if (polygon) {
      const updatedPaths = polygon
        .getPath()
        .getArray()
        .map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
      setSelectedGeofence({ ...geo, paths: updatedPaths });
      setContextMenu({
        position: { x: event.domEvent.clientX, y: event.domEvent.clientY },
        visible: true,
      });
    }
  }, []);

  useEffect(() => {
    if (visiblePop) {
      handleCloseMenu();
    }
  }, [visiblePop]);

  // 隐藏上下文菜单
  const handleCloseMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const polygonRefs = useRef({}); // 存储每个 geofence 的 Polygon 实例引用
  const getUserLocation = useCallback(() => {
    const defaultLocation = { lat: 40.7128, lng: -74.006 };
    const successCallback = (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
    };
    const errorCallback = () => {
      setUserLocation(defaultLocation);
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
      setUserLocation(defaultLocation);
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // 处理地图点击绘制事件(---由点到线再到面---)
  const handleMapClick = useCallback(
    (e) => {
      if (!drawing) return;
      const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setCurrentPolygon((prevPolygon) => [...prevPolygon, newPoint]);
    },
    [drawing]
  );

  // 完成绘制多边形
  const handleCompleteDrawing = useCallback(() => {
    if (currentPolygon.length < 3) {
      message.error("需要至少三个点来形成多边形。");
      return;
    }
    const newGeofence = {
      id: uuidv4(),
      createdTime: new Date().toISOString().replace("T", " ").substring(0, 19),
      ...geofence,
      paths: currentPolygon,
    };
    dispatch(addGeofence(newGeofence));
    setCurrentPolygon([]);
    setDrawing(false);
  }, [currentPolygon, dispatch, geofence]);

  // 点击地理围栏(---选中围栏---)
  const handleGeofenceClick = useCallback(
    (geofenceId) => {
      const selected = geofences.find((geo) => geo.id === geofenceId);
      setSelectedGeofence(selected);
    },
    [geofences]
  );

  /**
   *
   * @returns 删除操作
   */
  const handleDeleteGeofence = useCallback(() => {
    if (!selectedGeofence) {
      message.error("没有选中的地理围栏");
      return;
    }
    dispatch(deleteGeofence(selectedGeofence.id));
    setSelectedGeofence(null);
    setContextMenu(null);
  }, [dispatch, selectedGeofence]);

  /**
   * 增删改查弹框操作
   * @param {*} mode
   */
  const handleModelType = useCallback((mode) => {
    setHandleModel(mode);
    setVisiblePop(true);
  }, []);

  //获取弹框Form组件中的数据
  const getFormDataFromPop = useCallback(
    (formData) => {
      if (handleModel === "add") {
        setGeofence((prev) => ({ ...prev, ...formData }));
      } else if (handleModel === "edit") {
        if (!selectedGeofence) {
          message.error("没有选中的地理围栏");
          return;
        }
        dispatch(
          editGeofence({
            id: selectedGeofence.id,
            newGeofence: { ...formData },
          })
        );
      }
      setVisiblePop(false);
    },
    [dispatch, handleModel, selectedGeofence]
  );

  useEffect(() => {
    console.log("geofences--->", geofences);

    if (map && geofences.length > 0) {
      Object.values(polygonRefs.current).forEach((polygon) => {
        polygon.setMap(null);
      });
      polygonRefs.current = {};
      geofences.forEach((geo) => {
        const polygon = new window.google.maps.Polygon({
          paths: geo.paths,
          fillColor: geo.fillColor,
          strokeColor: geo.strokeColor,
          visible: geo.visible,
          fillOpacity: 0.8,
          strokeWeight: 2,
          editable: true,
          map: map,
        });
        polygonRefs.current[geo.id] = polygon;
        polygon.addListener("click", () => handleGeofenceClick(geo.id));
        polygon.addListener("rightclick", (event) =>
          handlePolygonRightClick(event, geo)
        );
        polygon.addListener("mouseup", () => {
          const updatedPaths = polygon
            .getPath()
            .getArray()
            .map((latLng) => ({
              lat: latLng.lat(),
              lng: latLng.lng(),
            }));
          if (compareJsonArrays(geo.paths, updatedPaths)) return;
          dispatch(
            editGeofence({
              id: geo.id,
              newGeofence: { ...geo, paths: updatedPaths },
            })
          );
        });
      });
    }

    // 清理函数：在组件卸载时清除地图实例、事件监听器等
    return () => {
      if (map) {
        Object.values(polygonRefs.current).forEach((polygon) => {
          polygon.setMap(null); // 清除地图上的多边形
        });
        polygonRefs.current = {}; // 清空多边形引用
      }
    };
  }, [geofences, map, dispatch, handleGeofenceClick]);

  useEffect(() => {
    if (userLocation && map) {
      const markerElement = document.createElement("div");
      markerElement.innerHTML = `<div style="color: blue; font-size: 16px;">您在这里</div>`;
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map: map,
        content: markerElement,
        title: "当前位置",
      });
      // 清理函数：在组件卸载时移除标记
      return () => {
        if (marker) {
          marker.setMap(null); // 移除地图上的用户位置标记
        }
      };
    }
  }, [userLocation, map]);

  if (loadError) {
    return <div>地图加载失败...</div>;
  }

  return isLoaded ? (
    <>
      <div className="map-fence">
        <Space>
          <Button type="primary" onClick={() => handleModelType("add")}>
            添加地理围栏
          </Button>
          <Button type="primary" onClick={() => setDrawing(true)}>
            开始绘制
          </Button>
          <Button type="primary" onClick={handleCompleteDrawing}>
            完成绘制
          </Button>
          <Button danger onClick={handleDeleteGeofence}>
            删除
          </Button>
        </Space>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={12}
        onClick={handleMapClick}
        onLoad={setMap}
        onUnmount={() => {
          setMap(null); // 清除地图实例引用
        }}
      >
        {/* 渲染当前正在绘制的多边形 */}
        {currentPolygon.length > 1 && (
          <Polyline
            path={currentPolygon}
            options={{
              strokeColor: geofence.strokeColor || "#2196F3",
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>

      {/* 添加地理围栏的配置弹窗 */}
      {/* 在配置弹框中 ，填写地理围栏的名称、颜色等信息后，需要通过`dispatch`方法提交到 Redux 中。 */}
      <ConfigPop
        visible={visiblePop}
        mode={handleModel}
        record={selectedGeofence}
        onCancel={() => setVisiblePop(false)}
        onCreate={(formData) => {
          getFormDataFromPop(formData);
        }}
      />
      {/* 上述逻辑会更新 geofence 对象，
      之后在 handleCompleteDrawing 中将新建的地理围栏添加到 Redux。 */}
      {/* 右键菜单 */}
      {contextMenu?.visible && (
        <div
          style={{
            position: "absolute",
            top: `${contextMenu.position.y}px`,
            left: `${contextMenu.position.x}px`,
            backgroundColor: "#fff",
            padding: "10px",
            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderRadius: "5px",
          }}
        >
          <Button
            onClick={() => {
              handleModelType("view");
            }}
          >
            查看信息
          </Button>
          <Button
            onClick={() => {
              handleModelType("edit");
            }}
          >
            编辑
          </Button>
          <Button danger onClick={handleDeleteGeofence}>
            删除
          </Button>
          <Button onClick={handleCloseMenu}>取消</Button>
        </div>
      )}
    </>
  ) : (
    <div>正在加载地图...</div>
  );
};

export default MapComponent;
