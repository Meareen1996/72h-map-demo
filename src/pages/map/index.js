import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Polygon, Marker, Polyline } from '@react-google-maps/api';
import { Space, Button, message } from 'antd';
import ConfigPop from '@components/configPop';
import './map.scss';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { addGeofence, editGeofence, deleteGeofence, loadGeofences } from '@store/modules/geofenceSlice';  // 从 Redux 中导入相应的 actions
const containerStyle = {
  width: '100%',
  height: 'calc(100% - 60px)'
};
const libraries = ['drawing', 'marker'];
// const mapKey = 'AIzaSyAyZ4S3bvIDOyrKYR3IGpjl9YmVPVZn_9M'; // 替换为你的实际API密钥
const mapKey = 'AIzaSyCYEjZVnDQWY01I6XMdQq5pj8FXsvu2V28'; // 替换为你的实际API密钥

/**
 * React 组件，用于渲染带有地理围栏功能的地图。
 * 该组件管理在Google地图上绘制多边形，编辑现有的地理围栏，删除地理围栏以及通过配置弹窗添加新的地理围栏。
 */
const MapComponent = () => {
  const dispatch = useDispatch();
  // 从 Redux 中获取地理围栏数据
  const { geofences, status } = useSelector(state => state.geofences);
 
  useEffect(() => {
    // 页面加载时，从 IndexedDB 加载地理围栏数据
    if (status === 'idle') {
      dispatch(loadGeofences());
    }

  }, [dispatch, status]);

 
  const [map, setMap] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [visiblePop, setVisiblePop] = useState(false);
  const [geofence, setGeofence] = useState({
    name: "",
    strokeColor: "",
    fillColor: "",
    visible: true
  });

  const polygonRefs = useRef({});  // 存储每个 geofence 的 Polygon 实例引用

  // 获取用户位置以便居中地图
  const getUserLocation = () => {
    const defaultLocation = { lat: 40.7128, lng: -74.006 };

    const successCallback = (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
    };

    const errorCallback = (error) => {
      console.error('获取用户位置出错:', error);
      setUserLocation(defaultLocation); // 如果获取地理位置失败，则回退到默认位置
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
      setUserLocation(defaultLocation);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // 处理地图点击事件
  const handleMapClick = (e) => {
    if (!drawing) return;

    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setCurrentPolygon((prevPolygon) => [...prevPolygon, newPoint]);
  };

  // 完成绘制多边形
  const handleCompleteDrawing = () => {

    console.log("currentPolygon--->", currentPolygon)

    if (currentPolygon.length < 3) {
      message.error("需要至少三个点来形成多边形。");
      return;
    }

    const newGeofence = {
      id: uuidv4(),
      ...geofence,
      paths: currentPolygon,
    };
    dispatch(addGeofence(newGeofence));
    setCurrentPolygon([]);
    setDrawing(false);
  };

  // 更新 geofence 的路径数据
  // 当前的编辑逻辑是在拖动或修改围栏时，获取`polygon`的`getPath`数据并更新多边形
  // 为了与redux结合，需要在编辑完成后派发一个`updateGeofense`动作
  const handleGeofenceEdit = (geofenceId) => {
    const polygon = polygonRefs.current[geofenceId];  // 获取对应的 Polygon 引用
    console.log("编辑后的---->", polygon)
    if (polygon) {
      const updatedPaths = polygon
        .getPath()
        .getArray()
        .map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));

      // 派发 Redux 动作，更新地理围栏
      dispatch(editGeofence({ id: geofenceId, newGeofence: { ...selectedGeofence, paths: updatedPaths } }));
    }
  };

  // 点击地理围栏(选中围栏)
  const handleGeofenceClick = (geofenceId) => {
    const selected = geofences.find((geo) => geo.id === geofenceId);
    console.log("selected---->", selected);
    setSelectedGeofence(selected);
  };

  /**
   * 
   * @returns 删除操作
   */
  const handleDeleteGeofence = () => {
    if (!selectedGeofence) {
      message.error("没有选中的地理围栏");
      return;
    }
    // 派发 Redux 动作，删除地理围栏
    dispatch(deleteGeofence(selectedGeofence.id));

    // 清空当前选中的地理围栏
    setSelectedGeofence(null);
  };

  // useEffect 监控 geofences 变化
  useEffect(() => {
    console.log('Updated geofences after deletion:', geofences);
    if (selectedGeofence && !geofences.some(gf => gf.id === selectedGeofence.id)) {
      setSelectedGeofence(null); // 清除已删除的选中状态
    }
  }, [geofences]);

  //标记点
  useEffect(() => {
    if (userLocation && map) {
      // 创建自定义标记的 DOM 元素
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `<div style="color: blue; font-size: 16px;">您在这里</div>`;

      // 创建 AdvancedMarkerElement
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map: map,
        content: markerElement,  // 自定义的标记内容
      });

    }
  }, [userLocation, map]);


  return (
    <>
      <div className='map-fence'>
        <Space>
          <Button type="primary" onClick={() => setVisiblePop(true)}>添加地理围栏</Button>
          <Button type="primary" onClick={() => setDrawing(true)}>开始绘制</Button>
          <Button type="primary" onClick={handleCompleteDrawing}>完成绘制</Button>
          <Button danger onClick={handleDeleteGeofence}>删除</Button>
        </Space>
      </div>

      <LoadScript googleMapsApiKey={mapKey} libraries={libraries}>
        {userLocation && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation}
            zoom={10}
            onClick={handleMapClick}
            onLoad={setMap}
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

            {/* 渲染地理围栏 */}
            {geofences && geofences?.length > 0 && geofences.map((geo, index) => (
              <Polygon
                key={geo.id}
                paths={geo.paths}
                options={{
                  fillColor: geo.fillColor,
                  strokeColor: geo.strokeColor,
                  visible: geo.visible,
                  fillOpacity: 0.6,
                  strokeWeight: 2,
                  editable: true, // 启用编辑

                }}
                onLoad={(polygon) => (polygonRefs.current[geo.id] = polygon)}
                onClick={() => handleGeofenceClick(geo.id)}
                onMouseUp={() => handleGeofenceEdit(geo.id)}
              />
            ))}


          </GoogleMap>
        )}
      </LoadScript>

      {/* 添加地理围栏的配置弹窗 */}
      {/* 在配置弹框中 ，填写地理围栏的名称、颜色等信息后，需要通过`dispatch`方法提交到 Redux 中。 */}
      <ConfigPop
        visible={visiblePop}
        onCancel={() => setVisiblePop(false)}
        onCreate={(formData) => {
          setGeofence({
            ...geofence,
            ...formData,
          });
          setVisiblePop(false);
        }}
      />
      {/* 上述逻辑会更新 geofence 对象，
      之后在 handleCompleteDrawing 中将新建的地理围栏添加到 Redux。 */}
    </>
  );
};

export default MapComponent;
