import React, { useState } from 'react';
import { Table, Input } from 'antd';

const MyTableComponent = ({ initialData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(initialData);

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    const lowercasedValue = value.toLowerCase();
    const filtered = initialData.filter(item =>
      item.name.toLowerCase().includes(lowercasedValue)
    );
    setFilteredData(filtered);
  };

  return (
    <div>
      <Input
        placeholder="Search by name"
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Border Color', dataIndex: 'borderColor', key: 'borderColor' },
          { title: 'Fill Color', dataIndex: 'fillColor', key: 'fillColor' },
          { title: 'Added Date', dataIndex: 'addedDate', key: 'addedDate' },
          { title: 'Coordinates', dataIndex: 'coordinates', key: 'coordinates' },
        ]}
        dataSource={filteredData}
      />
    </div>
  );
};

export default MyTableComponent;
