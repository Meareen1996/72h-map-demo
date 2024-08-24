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
    paths: paths || "[]",
    createdTime:
      createdTime ||
      new Date().toISOString().replace("T", " ").substring(0, 19),
    visible: isVisible || true,
  };

  const onFinish = (values) => {
    onCreate(values);
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
          initialValue={initialValues.name}
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
          initialValue={initialValues.strokeColor}
          rules={[{ required: true, message: "Please select a border color!" }]}
        >
          <Select options={colors} disabled={mode === "view"} />
        </Form.Item>
        <Form.Item
          name="fillColor"
          label="Fill Color"
          initialValue={initialValues.fillColor}
          rules={[{ required: true, message: "Please select a fill color!" }]}
        >
          <Select options={colors} disabled={mode === "view"} />
        </Form.Item>

        {(mode === "edit" || mode === "view") && (
          <>
            <Form.Item
              name="paths"
              label="Paths"
              initialValue={initialValues.placeholderaths}
              rules={[{ required: true, message: "Please enter the paths!" }]}
            >
              <Input.TextArea
                placeholder="Enter JSON array of paths"
                disabled={mode === "view"}
                autoSize={{ minRows: 3, maxRows: 6 }} // Adjust rows based on content length
                value={JSON.stringify(initialValues.paths, null, 2)} // Display paths array as formatted JSON
              />
            </Form.Item>

            <Form.Item
              name="createdTime"
              label="Created Time"
              initialValue={initialValues.createdTime}
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
