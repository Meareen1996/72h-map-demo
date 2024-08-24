import React from 'react';
import { Modal, Form, Input, Select, Checkbox } from 'antd'; // 假设您在项目中使用了 Ant Design
import PropTypes from 'prop-types'; // 引入 PropTypes 库

const colors = [
    { value: '#FF0000', label: '红色' },
    { value: '#00FF00', label: '绿色' },
    { value: '#0000FF', label: '蓝色' },
    { value: '#FFFF00', label: '黄色' },
    { value: '#FFA500', label: '橙色' },
    { value: '#800080', label: '紫色' },
    { value: '#00FFFF', label: '青色' },
    { value: '#FFC0CB', label: '粉色' },
    { value: '#808080', label: '灰色' },
    { value: '#A52A2A', label: '棕色' },
    { value: '#000000', label: '黑色' },
    { value: '#FFFFFF', label: '白色' }
]
const titleName = {
    add: "Add Geofence",
    edit: "Edit Geofence",
    view: "View Geofence"
}
const titleBtnName = {
    add: "Add",
    edit: "Save",
    view: "Close"
}

const AddGeofenceModal = ({ visible, onCreate, onCancel, mode, record }) => {
    const [form] = Form.useForm();
    const { name, strokeColor, fillColor, paths, createdTime, visible: isVisible } = record || {};

    const initialValues = {
        name: name || '',
        strokeColor: strokeColor || '',
        fillColor: fillColor || '',
        paths: paths || '[]',
        createdTime: createdTime || new Date().toISOString().replace('T', ' ').substring(0, 19),
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
                    rules={[{ required: true, message: 'Please enter the name of the geofence!' }]}
                >
                    <Input disabled={mode === 'view'} />
                </Form.Item>
                <Form.Item
                    name="strokeColor"
                    label="Border Color"
                    rules={[{ required: true, message: 'Please select a border color!' }]}
                >
                    <Select
                        options={colors}
                        disabled={mode === 'view'}
                    />

                </Form.Item>
                <Form.Item
                    name="fillColor"
                    label="Fill Color"
                    rules={[{ required: true, message: 'Please select a fill color!' }]}
                >
                    <Select
                        options={colors}
                        disabled={mode === 'view'}
                    />
                </Form.Item>

                {(mode === 'edit' || mode === 'view') && (
                    <>
                        <Form.Item
                            name="paths"
                            label="Paths"
                            rules={[{ required: true, message: 'Please enter the paths!' }]}
                        >
                            <Input.TextArea placeholder="Enter JSON array of paths" disabled={mode === 'view'} />
                        </Form.Item>

                        <Form.Item
                            name="createdTime"
                            label="Created Time"
                            initialValue={initialValues.createdTime}
                            rules={[{ required: true, message: 'Please enter the created time!' }]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name="visible"
                            label="Visible"
                        >
                            <Checkbox checked={initialValues.visible} disabled={mode === 'view'} />
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
    mode: PropTypes.oneOf(['add', 'edit', 'view']).isRequired,
    record: PropTypes.shape({
        name: PropTypes.string,
        strokeColor: PropTypes.string,
        fillColor: PropTypes.string,
        paths: PropTypes.string,
        createdTime: PropTypes.string,
        visible: PropTypes.bool,
    }),
};
export default AddGeofenceModal;