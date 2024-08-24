import React from "react";
import { Modal, Form, Input, Select, Checkbox } from "antd"; // 假设您在项目中使用了 Ant Design
import PropTypes from "prop-types"; // 引入 PropTypes 库
import { useSelector } from "react-redux";

const titleName = {
  add: "Add Geofence",
  edit: "Edit Geofence",
  view: "View Geofence",
};
const titleBtnName = {
  add: "Add",
  edit: "Save",
  view: "Close",
};

const AddGeofenceModal = ({ visible, onCreate, onCancel, mode, record }) => {
  // 从 Redux 中获取颜色数据
  const { colors } = useSelector((state) => state.geofences);
  const [form] = Form.useForm();
  const {
    name,
    strokeColor,
    fillColor,
    paths,
    createdTime,
    visible: isVisible,
  } = record || {};

  const initialValues = {
    name: name || "",
    strokeColor: strokeColor || "",
    fillColor: fillColor || "",
    paths: JSON.stringify(paths, null, 2) || "[]", // 将 paths 转换为 JSON 字符串，格式化显示
    createdTime:
      createdTime ||
      new Date().toISOString().replace("T", " ").substring(0, 19),
    visible: isVisible || true,
  };

  const onFinish = (values) => {
    // 将 paths 从 JSON 字符串解析为数组
    const { paths, ...restValues } = values;
    onCreate({
      ...restValues,
      paths: JSON.parse(paths || "[]"),
    });
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={visible}
      title={titleName[mode]}
      okText={titleBtnName[mode]}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          onFinish(values);
        });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="geofence_form"
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: "Please enter the name of the geofence!",
            },
          ]}
        >
          <Input disabled={mode === "view"} />
        </Form.Item>
        <Form.Item
          name="strokeColor"
          label="Border Color"
          rules={[{ required: true, message: "Please select a border color!" }]}
        >
          <Select options={colors} disabled={mode === "view"} />
        </Form.Item>
        <Form.Item
          name="fillColor"
          label="Fill Color"
          rules={[{ required: true, message: "Please select a fill color!" }]}
        >
          <Select options={colors} disabled={mode === "view"} />
        </Form.Item>

        {(mode === "edit" || mode === "view") && (
          <>
            <Form.Item
              name="paths"
              label="paths"
              rules={[{ required: true, message: "Please enter the paths!" }]}
            >
              <Input.TextArea
                placeholder="Enter JSON array of paths"
                disabled={mode === "view"}
                autoSize={{ minRows: 3, maxRows: 6 }} 
                value={initialValues.paths} // 显示 JSON 格式化字符串
              />
            </Form.Item>

            <Form.Item
              name="createdTime"
              label="Created Time"
              rules={[
                { required: true, message: "Please enter the created time!" },
              ]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item name="visible" label="Visible">
              <Checkbox
                checked={initialValues.visible}
                disabled={mode === "view"}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

// 添加 propTypes 验证
AddGeofenceModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  record: PropTypes.shape({
    name: PropTypes.string,
    strokeColor: PropTypes.string,
    fillColor: PropTypes.string,
    paths: PropTypes.array,
    createdTime: PropTypes.string,
    visible: PropTypes.bool,
  }),
};
export default AddGeofenceModal;
