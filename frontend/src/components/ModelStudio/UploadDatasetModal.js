// src/components/ModelStudio/UploadDatasetModal.js
import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Switch, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const UploadDatasetModal = ({ visible, onCancel, onUpload }) => {
  const [form] = Form.useForm();
  const [fileObj, setFileObj] = useState(null);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!fileObj) {
        message.warning('请上传数据集文件');
        return;
      }

      const datasetData = {
        ...values,
        fileObj,
      };

      await onUpload(datasetData);
      form.resetFields();
      setFileObj(null);
      onCancel();
    } catch (err) {
      console.log('验证失败:', err);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setFileObj(file);
      return false; // 防止自动上传
    },
    multiple: false,
    showUploadList: true,
  };

  return (
    <Modal
      open={visible}
      title="上传数据集"
      onCancel={() => {
        form.resetFields();
        setFileObj(null);
        onCancel();
      }}
      onOk={handleOk}
      okText="上传"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="数据集名称"
          rules={[{ required: true, message: '请输入数据集名称' }]}
        >
          <Input placeholder="如 MNIST Test Set" />
        </Form.Item>

        <Form.Item name="description" label="数据集描述">
          <Input.TextArea rows={3} placeholder="可选：简单描述该数据集" />
        </Form.Item>

        <Form.Item
          label="上传文件"
          required
          tooltip="请上传 CSV、ZIP、TXT 等格式的文件"
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件上传</p>
          </Dragger>
        </Form.Item>

        <Form.Item name="isPublic" label="是否公开" valuePropName="checked">
          <Switch checkedChildren="公开" unCheckedChildren="私有" defaultChecked={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadDatasetModal;
