import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd'; // 假设您在项目中使用了 Ant Design

const { Option } = Select;

const AddGeofenceModal = ({ visible, onCreate,onCancel }) => {
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
                    name="borderColor"
                    label="Border Color"
                    rules={[{ required: true, message: 'Please select a border color!' }]}
                >
                    <Select>
                        <Option value="red">Red</Option>
                        <Option value="blue">Blue</Option>
                        <Option value="green">Green</Option>
                        {/* 可根据需要添加更多颜色选项 */}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="fillColor"
                    label="Fill Color"
                    rules={[{ required: true, message: 'Please select a fill color!' }]}
                >
                    <Select>
                        <Option value="yellow">Yellow</Option>
                        <Option value="purple">Purple</Option>
                        <Option value="orange">Orange</Option>
                        {/* 可根据需要添加更多颜色选项 */}
                    </Select>
                </Form.Item>
            </Form>

        </Modal>
    );
};

export default AddGeofenceModal;