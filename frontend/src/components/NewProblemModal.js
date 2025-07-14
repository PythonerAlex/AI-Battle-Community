import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

const { TextArea } = Input;

const TAG_OPTIONS = ['Environment', 'Health', 'Education', 'Climate', 'Sustainability', 'Technology'];

function NewProblemModal({ visible, onClose, onSubmit }) {
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const valuesWithTags = {
                ...values,
                tags: values.tags || [],  // ✅ 确保 tags 永远是数组
            };
            onSubmit(valuesWithTags);  // 提交处理后的值
            form.resetFields();
            onClose();
            message.success('Problem submitted successfully!');
        } catch (err) {
            console.log('Validation Failed:', err);
        }
    };


    return (
        <Modal
            title="Submit a New Problem"
            open={visible}
            onOk={handleOk}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            okText="Submit"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Problem Title"
                    rules={[{ required: true, message: 'Please enter a title' }]}
                >
                    <Input placeholder="e.g. How can we detect water pollution in real-time?" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Problem Description"
                    rules={[{ required: true, message: 'Please enter a description' }]}
                >
                    <TextArea rows={4} placeholder="Explain the issue and why it's important..." />
                </Form.Item>

                <Form.Item name="tags" label="Tags">
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Select relevant tags"
                        options={TAG_OPTIONS.map((tag) => ({ value: tag }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default NewProblemModal;
