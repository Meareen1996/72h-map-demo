import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  Button,
  Input,
  Checkbox,
  Tooltip,
  Pagination,
  Modal,
} from "antd";
import {
  batchDeleteGeofences,
  editGeofence,
} from "@store/modules/geofenceSlice";
import { pageQuery } from "@utils/indexedDB";
import useGeofences from "@hooks/geoHook";
import "./index.scss";
import debounce from "lodash/debounce";

const ListComponent = () => {
  const dispatch = useDispatch();
  const { colors } = useSelector((state) => state.geofences);
  const { geofences } = useGeofences();
  const [searchName, setSearchName] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState(geofences);
  const [selectedKeys, setSelectedKeys] = useState([]); //选中要删除的项
  const [deleting, setDeleting] = useState(false);

  const debounceSearch= useCallback(
    debounce((value) => setSearchName(value), 500),
    []
  );

  useEffect(() => {
    setTableData(geofences); // 每次 Redux 中数据更新时，更新列表
    setTotal(geofences.length);
  }, [geofences]);

  //分页查询数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pageQuery(page, pageSize, searchName);
      setTableData(data);
    } catch (error) {
      console.error("Error fetching geofences:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchName]);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchName, fetchData]);

  // 列定义
  const columns = useMemo(
    () => [
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
          return colors.find((color) => color.value === record.fillColor)
            ?.label;
        },
      },
      { title: "Created Time", dataIndex: "createdTime", key: "createdTime" },
      {
        title: "Coordinates",
        dataIndex: "paths",
        key: "paths",
        width: 400,
        render: (paths) => (
          <Tooltip title={JSON.stringify(paths)}>
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
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
        render: (_, record) => (
          <Checkbox
            checked={record.visible}
            onChange={(e) => {
              const updatedRecord = { ...record, visible: e.target.checked };
              dispatch(
                editGeofence({ id: record.id, newGeofence: updatedRecord })
              );
            }}
          />
        ),
      },
    ],
    [colors, dispatch]
  );

  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.length === 0) return;
    Modal.confirm({
      title: "Confirm Batch Delete",
      content: `Are you sure you want to delete ${selectedKeys.length} geofence(s)?`,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        setDeleting(true);
        try {
          await dispatch(batchDeleteGeofences(selectedKeys));
          setSelectedKeys([]);
        } catch (error) {
          console.error("Error deleting geofences:", error);
        } finally {
          setDeleting(false);
        }
      },
    });
  }, [selectedKeys, dispatch]);
  
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Input.Search
        placeholder="Search by geofence name"
        enterButton
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        style={{ marginBottom: 20 }}
        onSearch={debounceSearch}
        allowClear
      />
      <Button
        type="primary"
        loading={deleting}
        onClick={handleBatchDelete}
        style={{ marginBottom: 10, width: "120px" }}
      >
        Batch Delete
      </Button>
      <div
        style={{ flex: 1, overflow: "auto", maxHeight: "calc(100vh - 200px)" }}
      >
        <Table
          columns={columns}
          dataSource={tableData}
          rowSelection={{
            type: "checkbox",
            onChange: (selectedRowKeys) => {
              console.log("selectedRowKeys---->", selectedRowKeys);
              setSelectedKeys(selectedRowKeys);
            },
          }}
          pagination={false}
          rowKey="id"
          loading={loading}
          sticky
        />
      </div>

      <div>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `Total ${total} items`}
        />
      </div>
    </div>
  );
};

export default ListComponent;
