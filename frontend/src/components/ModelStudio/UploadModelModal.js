// src/components/ModelStudio/UploadModelModal.js
import React from 'react';
import {
    Modal,
    Form,
    Input,
    //  Select,
    Typography,
    Switch,
    Upload,
    Button,
    message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

//const { Option } = Select;

const UploadModelModal = ({ visible, onCancel, onUpload, problem }) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {

        if (!problem) {
            message.error('当前无可用任务，无法上传模型。');
            return;
        }
        const newModel = {
            id: Date.now(), // mock ID
            name: values.name,
            task: problem.title,
            taskId: problem.id, // ✅ 用于后端存储时绑定问题
            createdAt: new Date().toISOString().split('T')[0],
            isPublic: values.isPublic || false,
            metrics: {},
            file: values.file?.file?.name || 'mock_model.pkl',
        };

        onUpload(newModel);
        //message.success('模型上传成功（模拟）');
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="上传新模型"
            visible={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText="上传"
            cancelText="取消"
            destroyOnClose
        >
            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Form.Item label="当前任务">
                    <Typography.Text strong>{problem?.title || '无'}</Typography.Text>
                </Form.Item>
                <Form.Item
                    name="name"
                    label="模型名称"
                    rules={[{ required: true, message: '请输入模型名称' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="file"
                    label="上传文件"
                    rules={[{ required: true, message: '请上传模型文件' }]}
                    valuePropName="file"
                >
                    <Upload beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                </Form.Item>

                <Form.Item name="isPublic" label="是否公开" valuePropName="checked">
                    <Switch checkedChildren="公开" unCheckedChildren="私有" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UploadModelModal;
