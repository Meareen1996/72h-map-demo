import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Polygon, Marker, Polyline } from '@react-google-maps/api';
import { Space, Button, message } from 'antd';
import ConfigPop from '@components/configPop';
import './map.scss';
import { v4 as uuidv4 } from 'uuid';

const containerStyle = {
  width: '100%',
  height: 'calc(100% - 60px)'
};

/**
 * React 组件，用于渲染带有地理围栏功能的地图。
 * 该组件管理在Google地图上绘制多边形，编辑现有的地理围栏，删除地理围栏以及通过配置弹窗添加新的地理围栏。
 */
const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [visiblePop, setVisiblePop] = useState(false);
  const [geofence, setGeofence] = useState({
    name: "",
    strokeColor: "",
    fillColor: "",
    visible:true
  });

  const libraries = ["drawing"];
  const mapKey = 'AIzaSyAyZ4S3bvIDOyrKYR3IGpjl9YmVPVZn_9M'; // 替换为你的实际API密钥

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
    setGeofences([...geofences, newGeofence]);
    setCurrentPolygon([]);
    setDrawing(false);
  };

  // 编辑地理围栏
  const handleGeofenceEdit = (polygon, geofenceId) => {
    const paths = polygon.getPath().getArray().map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));
    setGeofences((prevGeofences) =>
      prevGeofences.map((gf) => (gf.id === geofenceId ? { ...gf, paths } : gf))
    );
  };

  // 点击地理围栏
  const handleGeofenceClick = (geofenceId) => {
    const selected = geofences.find((geo) => geo.id === geofenceId);
    setSelectedGeofence(selected);
  };

  // 删除地理围栏
  const handleDeleteGeofence = () => {
    if (selectedGeofence) {
      setGeofences(geofences.filter((gf) => gf.id !== selectedGeofence.id));
      setSelectedGeofence(null);
    }
  };

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
            {geofences && geofences.map((geo, index) => (
              <Polygon
                key={geo.id}
                paths={geo.paths}
                options={{
                  fillColor: geo.fillColor,
                  strokeColor: geo.strokeColor,
                  visible:geo.visible,
                  fillOpacity: 0.6,
                  strokeWeight: 2,
                  editable: true, // 启用编辑
                  draggable: true,
                }}
                onClick={() => handleGeofenceClick(geo.id)}
                onMouseUp={(e) => handleGeofenceEdit(e, geo.id)}
              />
            ))}

            <Marker
              position={userLocation}
              label="您在这里"
              animation={window.google.maps.Animation.BOUNCE}
            />
          </GoogleMap>
        )}
      </LoadScript>

      {/* 添加地理围栏的配置弹窗 */}
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
    </>
  );
};

export default MapComponent;
