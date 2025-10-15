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
        message.warning('Please upload a dataset file');
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
      console.log('Validation failed:', err);
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
      title="Upload Dataset"
      onCancel={() => {
        form.resetFields();
        setFileObj(null);
        onCancel();
      }}
      onOk={handleOk}
      okText="Upload"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Dataset name"
          rules={[{ required: true, message: 'Please enter the dataset name' }]}
        >
          <Input placeholder="e.g. MNIST Test Set" />
        </Form.Item>

        <Form.Item name="description" label="Dataset description">
          <Input.TextArea rows={3} placeholder="Optional: briefly describe this dataset" />
        </Form.Item>

        <Form.Item
          label="Upload file"
          required
          tooltip="Please upload files in CSV, ZIP, TXT, etc. formats"
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to upload</p>
          </Dragger>
        </Form.Item>

        <Form.Item name="isPublic" label="Publicly visible" valuePropName="checked">
          <Switch checkedChildren="Public" unCheckedChildren="Private" defaultChecked={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadDatasetModal;
