import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd'; // 假设您在项目中使用了 Ant Design

const { Option } = Select;

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

const AddGeofenceModal = ({ visible, onCreate, onCancel }) => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        onCreate(values);
        form.resetFields();
    };

    return (
        <Modal
            open={visible}
            title="Add Geofence"
            okText="Add"
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
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter the name of the geofence!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="strokeColor"
                    label="Border Color"
                    rules={[{ required: true, message: 'Please select a border color!' }]}
                >
                    <Select
                        defaultValue="#0000FF"
                        options={colors}
                    />

                </Form.Item>
                <Form.Item
                    name="fillColor"
                    label="Fill Color"
                    rules={[{ required: true, message: 'Please select a fill color!' }]}
                >
                    <Select
                        defaultValue="#0000FF"
                        options={colors}
                    />
                </Form.Item>
            </Form>

        </Modal>
    );
};

export default AddGeofenceModal;