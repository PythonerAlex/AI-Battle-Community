import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, Select } from 'antd';

const { Option } = Select;

const EditModelModal = ({ visible, onCancel, onSave, model, datasets }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (model) {
            form.setFieldsValue({
                name: model.name,
                is_public: model.is_public,
                dataset: model.dataset || null,
                metrics: model.metrics?.reduce((acc, m) => {
                    acc[m.metric_name] = m.value;
                    return acc;
                }, {}) || {},
            });
        }
    }, [model, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        const updatedModel = {
            id: model.id,
            name: values.name,
            is_public: values.is_public,
            dataset: values.dataset || null,
            metrics: values.metrics || {},
        };
        onSave(updatedModel);
    };

    return (
        <Modal
            title="Edit Model"
            visible={visible}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Save"
            cancelText="Cancel"
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Model Name"
                    rules={[{ required: true, message: 'Please input model name' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="is_public" label="Public" valuePropName="checked">
                    <Switch checkedChildren="Public" unCheckedChildren="Private" />
                </Form.Item>

                <Form.Item name="dataset" label="Linked Dataset">
                    <Select placeholder="Select dataset (optional)" allowClear>
                        {datasets?.map((ds) => (
                            <Option key={ds.id} value={ds.id}>
                                {ds.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {model?.metrics?.map((metric) => (
                    <Form.Item
                        key={metric.metric_name}
                        name={['metrics', metric.metric_name]}
                        label={`${metric.metric_name} value`}
                    >
                        <Input type="number" />
                    </Form.Item>
                ))}
            </Form>
        </Modal>
    );
};

export default EditModelModal;
    