import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Polyline } from '@react-google-maps/api';
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
const mapKey = 'AIzaSyAyZ4S3bvIDOyrKYR3IGpjl9YmVPVZn_9M'; // 替换为你的实际API密钥
// const mapKey = 'AIzaSyCYEjZVnDQWY01I6XMdQq5pj8FXsvu2V28'; // 替换为你的实际API密钥
// 中文姓名生成函数
const generateChineseName = () => {
  const familyNames = ['赵', '钱', '孙', '李', '周'];
  const givenNames = ['伟', '芳', '娜', '静', '强', '磊'];

  const familyName = familyNames[Math.floor(Math.random() * familyNames.length)];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  return familyName + givenName;
};
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

  const [handleModel, setHandleModel] = useState('add'); // 弹窗模式

  const [geofence, setGeofence] = useState({
    name: generateChineseName(),
    strokeColor: "#289af2",
    fillColor: "#29302c",
    visible: true
  });

  // -----右键菜单编辑start------
  const [contextMenu, setContextMenu] = useState(null); // 上下文菜单状态

  // 处理右键点击显示菜单
  const handlePolygonRightClick = (event, geo) => {

    const polygon = polygonRefs.current[geo.id];  //获取对应的 Polygon 引用
    if (polygon) {
      const updatedPaths = polygon
        .getPath()
        .getArray()
        .map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));

      // 记录选中的 Polygon
      setSelectedGeofence({ ...geo, paths: updatedPaths })
      console.log("selectedGeofence--->", selectedGeofence)

      setContextMenu({
        position: { x: event.domEvent.clientX, y: event.domEvent.clientY }, // 设置菜单的显示位置
        visible: true,
      });
    };
  }
  // 隐藏上下文菜单
  const handleCloseMenu = () => {
    setContextMenu(null);
  };


  useEffect(() => {
    console.log("selectedGeofence----->设置好了吗", selectedGeofence)
  }, [selectedGeofence])
  // -----右键菜单编辑end------

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


  // 处理地图点击绘制事件(---由点到线再到面---)
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
      createdTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...geofence,
      paths: currentPolygon,
    };

    dispatch(addGeofence(newGeofence));
    setCurrentPolygon([]);
    setDrawing(false);
  };

  // 点击地理围栏(---选中围栏---)
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
    console.log("selectedGeofence----->", selectedGeofence)
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

    console.log("geofences---->", geofences)
    console.log("map---->", map)
    if (map && geofences.length > 0) {
      // Clear existing polygons from the map
      Object.values(polygonRefs.current).forEach(polygon => {
        polygon.setMap(null);
      });

      // 清理旧的 Polygon 引用
      polygonRefs.current = {};

      // 添加新的 Polygon 引用
      geofences.forEach((geo) => {
        const polygon = new window.google.maps.Polygon({
          paths: geo.paths,
          fillColor: geo.fillColor,
          strokeColor: geo.strokeColor,
          visible: geo.visible,
          fillOpacity: 0.8,
          strokeWeight: 2,
          editable: true, // 启用编辑
          map: map,
        });
        console.log("测试有没有polygon实例---", polygon)
        // polygonRefs.current[geo.id] = polygon;
        polygonOnLoad(polygon, geo)

      });
    }
    // 销毁地图实例，避免内存泄漏
    // return () => {
    //   if (map.current) {
    //     map.current.destroy();
    //   }
    // };
  }, [geofences, map]);

  //标记点
  useEffect(() => {
    console.log("User Location:", userLocation);
    if (userLocation && map) {
      console.log("Map loaded:", map);
      // 创建自定义标记的 DOM 元素
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `<div style="color: blue; font-size: 16px;">您在这里</div>`;

      // 创建 AdvancedMarkerElement
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map: map,
        content: markerElement,  // 自定义的标记内容
        title: '当前位置', // 鼠标悬停时显示的标题
      });


      // 将标记添加到地图上
      marker.setMap(map);

      // 清理：当组件卸载时，移除标记
      return () => {
        marker.setMap(null);
      };
    }
  }, [userLocation, map]);

  //注册围栏事件
  const polygonOnLoad = (polygon, geo) => {
    console.log(`Polygon loaded for geo id: ${geo.id}`);
    polygonRefs.current[geo.id] = polygon;
    polygon.addListener('click', () => handleGeofenceClick(geo.id));
    // polygon.addListener('mouseup', () => handleGeofenceEdit(geo.id));
    polygon.addListener('rightclick', (event) => handlePolygonRightClick(event, geo));
    console.log(`Event listeners added for geo id: ${geo.id}`);
    polygon.addListener('mouseup', () => {
      const polygon = polygonRefs.current[geo.id];  //获取对应的 Polygon 引用
      //   console.log("编辑后的---->", polygon)
      if (polygon) {
        const updatedPaths = polygon
          .getPath()
          .getArray()
          .map((latLng) => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));
        dispatch(editGeofence({ id: geo.id, newGeofence: { ...geo, paths: updatedPaths } }));
      }
    });
  }
  /**
   * 增删改查弹框操作
   * @param {*} mode 
   */
  const handleModelType = (mode) => {
    setHandleModel(mode);
    setVisiblePop(true);
  }

  //获取弹框Form组件中的数据
  const getFormDataFromPop = (formData) => {
    if (handleModel === 'add') {
      setGeofence(...geofence, formData);
    } else if (handleModel === 'edit') {
      console.log("打印编辑完的数据---->", selectedGeofence.id, formData)
      dispatch(editGeofence({ id: selectedGeofence.id, newGeofence: { ...formData } }));

    } else if (handleModel === 'view') {
      setVisiblePop(false)
    }
    setVisiblePop(false);
  }

  return (
    <>
      <div className='map-fence'>
        <Space>
          <Button type="primary" onClick={() => handleModelType('add')}>添加地理围栏</Button>
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
          </GoogleMap>
        )}
      </LoadScript>

      {/* 添加地理围栏的配置弹窗 */}
      {/* 在配置弹框中 ，填写地理围栏的名称、颜色等信息后，需要通过`dispatch`方法提交到 Redux 中。 */}
      <ConfigPop
        visible={visiblePop}
        mode={handleModel}
        record={selectedGeofence}
        onCancel={() => setVisiblePop(false)}
        onCreate={(formData) => {
          getFormDataFromPop(formData)
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
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            borderRadius: '5px',

          }}
        >
          <Button onClick={() => { handleModelType('view') }}>查看信息</Button>
          <Button onClick={() => { handleModelType('edit') }}>编辑</Button>
          <Button danger onClick={handleDeleteGeofence}>删除</Button>
          <Button onClick={handleCloseMenu}>取消</Button>
        </div>
      )}


    </>
  );
};

export default MapComponent;
