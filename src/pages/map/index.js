import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DrawingManager, Polygon, Marker } from '@react-google-maps/api';
import { Space, Button } from 'antd';
import ConfigPop from '@components/configPop';

import './map.scss';
const containerStyle = {
  width: '100%',
  height: 'calc(100% - 60px)'
};

const MapComponent = () => {
  const [map, setMap] = useState(null);
  // const [geofences, setGeofences] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const drawingManagerRef = useRef(null);
  const [visiblePop, setVisiblePop] = useState(false); //配置弹框状态
  const [geofence, setGeofence] = useState({ name: "", borderColor: "", fillColor: "", geoJson: [] }) //栅栏数据

  const libraries = ["drawing"];
  // const mapKey = "AIzaSyD0D5y5rRnqCfGZc9Q5HlR7FkQJp6S6uB0";
  const mapKey = "AIzaSyAyZ4S3bvIDOyrKYR3IGpjl9YmVPVZn_9M";


  const [geofences, setGeofences] = useState([]); // 存储地理围栏
  const [selectedGeofence, setSelectedGeofence] = useState(null); // 当前选中的地理围栏

  //获取用户的定位-->Display the map, default to show the city of the user’s current location.
  const getUserLocation = () => {
    const defaultLocation = { lat: 40.7128, lng: -74.006 };

    const successCallback = (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
    };

    const errorCallback = (error) => {
      console.error('Error getting user location:', error);
      // Handle error fetching user location
      setUserLocation(defaultLocation); // Set default location if geolocation fails
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        } else {
          console.error('Geolocation permission denied.');
          setUserLocation(defaultLocation); // Set default location if permission denied
        }
      }).catch((error) => {
        console.error('Error querying geolocation permission:', error);
        setUserLocation(defaultLocation); // Set default location on permission query error
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
      console.error('Geolocation is not supported by this browser.');
      setUserLocation(defaultLocation); // Fallback to default location if geolocation is not supported
    }
  };

  useEffect(() => {
    getUserLocation()
  }, []);

  // 地图初始化
  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  //   1.Click “Add geofence” button, display a popup view. 
  //   2.There are some fileds for user to enter or select to 
  //     set the properties of the adding geofence: name,border color, fill color. 
  //   3.After user set these properties, they click the "Start to draw" button.
  //   4. Then they can draw the geofence by clicking on the map, the points will connect together. 
  //   5.And if user finish selecting the geofence's point, they can click the “Complete” button, the geofence will connect the last
  //   point and the first point to close the geofence

  //地图绘制
  const handleDrawing = () => {
    setDrawing(true);
  };
  const onUnmount = () => {
    setMap(null);
  };

  // 绘制完成后处理多边形
  const handleOverlayComplete = (e) => {
    const newGeofence = {
      id: new Date().getTime(),
      type: e.type,
      overlay: e.overlay,
      paths: e.overlay.getPath().getArray().map((latLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      })),
    };
    setGeofences([...geofences, newGeofence]);

    // 删除图形，避免重复显示
    e.overlay.setMap(null);
  };

  // 编辑地理围栏的路径
  const handleGeofenceEdit = (polygon, geofenceId) => {
    const paths = polygon.getPath().getArray().map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));
    setGeofences((prevGeofences) =>
      prevGeofences.map((gf) =>
        gf.id === geofenceId ? { ...gf, paths } : gf
      )
    );
  };

  // 点击地理围栏，选中或编辑
  const handleGeofenceClick = (geofenceId) => {
    const geofence = geofences.find((gf) => gf.id === geofenceId);
    setSelectedGeofence(geofence);
    // 可以在这里弹出编辑框或展示地理围栏的详细信息
  };

  // 删除选中的地理围栏
  const handleDeleteGeofence = () => {
    if (selectedGeofence) {
      setGeofences(geofences.filter((gf) => gf.id !== selectedGeofence.id));
      setSelectedGeofence(null); // 清除选中状态
    }
  };
  //绘制完成
  // const handlePolygonComplete = (polygon) => {
  //   const path = polygon.getPath().getArray().map(latLng => ({
  //     lat: latLng.lat(),
  //     lng: latLng.lng()
  //   }));
  //   setGeofences([...geofences, { path, id: Date.now() }]);
  //   setDrawing(false);
  //   setCurrentPolygon(null);
  // };

  //监听鼠标事件
  // const handlePolygonMouseUp = (polygon) => {
  //   const path = polygon.getPath().getArray().map(latLng => ({
  //     lat: latLng.lat(),
  //     lng: latLng.lng()
  //   }));
  //   setCurrentPolygon({ ...currentPolygon, path });
  // };
  //点击出现配置弹框
  const showConfiguration = () => {
    setVisiblePop(true)
  }

  //监听栅栏数据的变化
  useEffect(() => {
    console.log("最新的geofence-->", geofence)
  }, [geofence])

  return (
    <>
      <div className='map-fence'>
        <Space>
          <Button type="primary" onClick={showConfiguration}>Add geofence</Button>
          <Button type="primary" onClick={handleDrawing}>Start to draw</Button>
          <Button type="primary" >Complete</Button>
          <Button onClick={() => setCurrentPolygon(null)}>Edit</Button>
          <Button danger onClick={handleDeleteGeofence}>Delete</Button>
        </Space>
      </div>

      <LoadScript
        googleMapsApiKey='AIzaSyAyZ4S3bvIDOyrKYR3IGpjl9YmVPVZn_9M' // Google Maps API key
        libraries={libraries}
      >
        {userLocation && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation}
            zoom={10}
            onLoad={handleMapLoad}
            onUnmount={onUnmount}
          >
            {geofences.map(geo => (
              <Polygon
                key={geo.id}
                paths={geo.path}
                options={{
                  fillColor: '#FF0000',
                  fillOpacity: 0.1,
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2
                }}
              />
            ))}

            {/* 绘图工具 */}
            {drawing && (
              <DrawingManager>
                ref={drawingManagerRef}
                onOverlayComplete={handleOverlayComplete}
                options={{
                  drawingControl: true,
                  drawingControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                      window.google.maps.drawing.OverlayType.POLYGON,
                    ],
                  },
                  polygonOptions: {
                    fillColor: "#2196F3",
                    fillOpacity: 0.6,
                    strokeWeight: 2,
                    clickable: true,
                    editable: true, // 启用编辑模式
                    draggable: true, // 启用拖动
                  },
                }}
              </DrawingManager>
            )}

            {/* 渲染已绘制的地理围栏 */}
            {geofences.map((geofence) => (
              <Polygon
                key={geofence.id}
                paths={geofence.paths}
                options={{
                  fillColor: geofence.id === selectedGeofence?.id ? "#FF0000" : "#2196F3",
                  fillOpacity: 0.6,
                  strokeWeight: 2,
                  editable: true,
                  draggable: true,
                }}
                onMouseUp={(e) => handleGeofenceEdit(e, geofence.id)}
                onClick={() => handleGeofenceClick(geofence.id)}
              />
            ))}

            {/* 简单的删除按钮（可以使用其他方式显示） */}
            {/* {selectedGeofence && (
              <button onClick={handleDeleteGeofence}>
                删除地理围栏
              </button>
            )} */}
            <Marker
              position={userLocation}
              label="你当前的位置"
              animation={window.google.maps.Animation.BOUNCE} // Makes the marker bounce
            />

          </GoogleMap>
        )}
      </LoadScript>

      {/* ConfigPop component with onCancel and onCreate handlers */}
      <ConfigPop
        visible={visiblePop}
        onCancel={() => { setVisiblePop(false) }}
        onCreate={(formData) => {
          // Handle form data as needed
          console.log('Form data:', formData);
          setGeofence({
            ...geofence,
            ...Object.keys(formData).reduce((acc, key) => {
              acc[key] = formData[key];
              return acc;
            }, {})
          })
          setVisiblePop(false); // Close the modal after handling form submission
        }}
      />
    </>
  );
};

export default MapComponent;
