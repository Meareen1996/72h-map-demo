import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Button, Input, Checkbox, Tooltip } from "antd";
import { deleteGeofence } from "@store/modules/geofenceSlice";
import { pageQuery } from "@utils/indexedDB";
import useGeofences from "@hooks/geoHook";

const ListComponent = () => {
  const dispatch = useDispatch();
  // 从 Redux 中获取地理围栏数据
  const { colors } = useSelector((state) => state.geofences);
  const { geofences } = useGeofences();
  // const [filteredGeofences, setFilteredGeofences] = useState(geofences);
  const [searchName, setSearchName] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState(geofences);

  useEffect(() => {
    setTableData(geofences); // 每次 Redux 中数据更新时，更新列表
    setTotal(geofences.length);

    console.log("geofences.length--->", geofences);
  }, [geofences]);

  //分页查询数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await pageQuery(page, pageSize, searchName);

      console.log("查询所有的数据----->表格", data);
      setTableData(data);
    } catch (error) {
      console.error("Error fetching geofences:", error);
    } finally {
      setLoading(false);
    }
  };

  // //查询总条数
  // const fetchTotal=async ()=>{
  //   try {
  //     const total = await countRecords();
  //     console.log("查询总条数----->表格", total)
  //     setTotal(total)
  //   } catch (error) {
  //     console.error('Error fetching geofences:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // // 搜索过滤功能
  // const handleSearch = (value) => {
  //   setsearchName(value);
  //   const filtered = geofences.filter((geofence) =>
  //     geofence.name.toLowerCase().includes(value.toLowerCase())
  //   );
  //   setFilteredGeofences(filtered);
  // };
  useEffect(() => {
    fetchData();
    // fetchTotal()
  }, [page, pageSize, searchName]);

  // 批量删除
  const handleDelete = (ids) => {
    ids.forEach((id) => {
      dispatch(deleteGeofence(id));
    });
  };

  useEffect(() => {
    console.log("total---->", total);
  }, [total]);

  // 列定义
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Border Color",
      dataIndex: "strokeColor",
      key: "strokeColor",
      render: (_, record) => {
        return colors.find((color) => color.value === record.strokeColor)
          ?.label;
      },
    },
    {
      title: "Fill Color",
      dataIndex: "fillColor",
      key: "fillColor",
      render: (_, record) => {
        return colors.find((color) => color.value === record.fillColor)?.label;
      },
    },
    { title: "Created Time", dataIndex: "createdTime", key: "dateAdded" },
    {
      title: "Coordinates",
      dataIndex: "paths",
      key: "paths",
      width: 400, // 设置列的宽度
      render: (paths) => (
        <Tooltip title={JSON.stringify(paths)}>
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "200px", // 限制单元格的最大宽度
            }}
          >
            {JSON.stringify(paths)}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Visible",
      key: "visible",
      render: (_, record) => <Checkbox checked={record.visible} />,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button onClick={() => handleDelete([record.id])}>Delete</Button>
      ),
    },
  ];

  return (
    <>
      <Input.Search
        placeholder="Search by geofence name"
        enterButton
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
          showSizeChanger: true, // 确保 showSizeChanger 为布尔值
          showQuickJumper: true, // 确保 showQuickJumper 为布尔值
          showTotal: (total) => `Total ${total} items`,
        }}
        scroll={{
          x: 1500,
        }}
        rowKey="id"
        loading={loading}
        // antd site header height
        sticky={{
          offsetHeader: 64,
        }}
      />
    </>
  );
};

export default ListComponent;
