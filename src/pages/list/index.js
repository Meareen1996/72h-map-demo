import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Input, Checkbox } from 'antd';
import { deleteGeofence } from '@store/modules/geofenceSlice';

const ListComponent = () => {
  const dispatch = useDispatch();
  const geofences = useSelector(state => state.geofences.geofences);
  const [filteredGeofences, setFilteredGeofences] = useState(geofences);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setFilteredGeofences(geofences);  // 每次 Redux 中数据更新时，更新列表
  }, [geofences]);

  // 搜索过滤功能
  const handleSearch = (value) => {
    setSearchValue(value);
    const filtered = geofences.filter((geofence) =>
      geofence.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredGeofences(filtered);
  };

  // 批量删除
  const handleDelete = (ids) => {
    ids.forEach(id => {
      dispatch(deleteGeofence(id));
    });
  };

  // 列定义
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Border Color', dataIndex: 'strokeColor', key: 'strokeColor' },
    { title: 'Fill Color', dataIndex: 'fillColor', key: 'fillColor' },
    { title: 'Date Added', dataIndex: 'dateAdded', key: 'dateAdded' },
    { title: 'Coordinates', dataIndex: 'paths', key: 'paths', render: paths => JSON.stringify(paths) },
    { title: 'Visible', key: 'visible', render: (_, record) => (
      <Checkbox checked={record.visible} />
    )},
    { title: 'Action', key: 'action', render: (_, record) => (
      <Button onClick={() => handleDelete([record.id])}>Delete</Button>
    )},
  ];

  return (
    <>
      <Input.Search
        placeholder="Search by geofence name"
        onSearch={handleSearch}
        enterButton
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: 20 }}
      />
      <Table
        columns={columns}
        dataSource={filteredGeofences}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </>
  );
};

export default ListComponent;
