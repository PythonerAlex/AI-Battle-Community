// src/components/ModelStudio/UploadModelModal.js
import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Typography,
    Switch,
    Upload,
    Button,
    message,
    Select,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option, OptGroup } = Select;

const UploadModelModal = ({ visible, onCancel, onUpload, problem, datasets, metricCategories }) => {
    const [form] = Form.useForm();
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [metricValues, setMetricValues] = useState({});

    const handleMetricsChange = (metrics) => {
        setSelectedMetrics(metrics);

        // 清除被取消选择的指标
        setMetricValues((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((key) => {
                if (!metrics.includes(key)) delete updated[key];
            });
            return updated;
        });
    };

    const handleFinish = (values) => {
        if (!problem) {
            message.error('Can not upload model due to no selected problem.');
            return;
        }

        const newModel = {
            id: Date.now(), // mock ID
            name: values.name,
            task: problem.title,
            taskId: problem.id,
            datasetId: values.datasetId || null,
            createdAt: new Date().toISOString().split('T')[0],
            isPublic: values.isPublic || false,
            metrics: metricValues,
            file: values.file?.file?.name || 'mock_model.pkl',
            fileObj: values.file?.file,
        };
        console.info("metrics:", metricValues);

        onUpload(newModel);
        form.resetFields();
        setSelectedMetrics([]);
        setMetricValues({});
        onCancel();
    };

    return (
        <Modal
            title="Upload new model"
            visible={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText="Upload"
            cancelText="Cancel"
            destroyOnClose
        >
            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Form.Item label="当前任务">
                    <Typography.Text strong>{problem?.title || '无'}</Typography.Text>
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Model name"
                    rules={[{ required: true, message: 'Please input model name' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="datasetId"
                    label="Linked Dataset"
                    rules={[{ required: true, message: 'Please select Dataset' }]}
                >
                    <Select placeholder="Please select Dataset">
                        {datasets?.map((ds) => (
                            <Option key={ds.id} value={ds.id}>
                                {ds.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="file"
                    label="Upload file"
                    rules={[{ required: true, message: 'Please upload model file' }]}
                    valuePropName="file"
                >
                    <Upload beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Click to upload</Button>
                    </Upload>
                </Form.Item>

                {/* ✅ Metric 按分类分组 */}
                <Form.Item label="Select Metrics">
                    <Select
                        mode="multiple"
                        placeholder="Choose metrics"
                        onChange={handleMetricsChange}
                        value={selectedMetrics}
                        allowClear
                    >
                        {(metricCategories || []).map((cat) => (
                            <OptGroup key={cat.id} label={cat.name}>
                                {(cat.metrics || []).map((metric) => (
                                    <Option key={metric.name} value={metric.name}>
                                        {metric.display_name || metric.name}
                                    </Option>
                                ))}
                            </OptGroup>
                        ))}
                    </Select>
                </Form.Item>

                {/* ✅ 每个 metric 的 value 输入 */}
                {selectedMetrics.map((metric) => (
                    <Form.Item key={metric} label={`${metric} value`} required>
                        <Input
                            type="number"
                            placeholder={`Enter ${metric} value`}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setMetricValues((prev) => ({
                                    ...prev,
                                    [metric]: isNaN(val) ? null : val,
                                }));
                            }}
                        />
                    </Form.Item>
                ))}

                <Form.Item name="isPublic" label="是否公开" valuePropName="checked">
                    <Switch checkedChildren="公开" unCheckedChildren="私有" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UploadModelModal;

/*import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Typography,
    Switch,
    Upload,
    Button,
    message,
    Select,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

const UploadModelModal = ({ visible, onCancel, onUpload, problem, datasets, metricOptions }) => {
    const [form] = Form.useForm();
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [metricValues, setMetricValues] = useState({});

    const handleMetricsChange = (metrics) => {
        setSelectedMetrics(metrics);

        // 清除被取消选择的指标
        setMetricValues((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((key) => {
                if (!metrics.includes(key)) delete updated[key];
            });
            return updated;
        });
    };

    const handleFinish = (values) => {
        if (!problem) {
            message.error('Can not upload model due to  no selected problem.');
            return;
        }

        const newModel = {
            id: Date.now(), // mock ID
            name: values.name,
            task: problem.title,
            taskId: problem.id,
            datasetId: values.datasetId || null, // ✅ 新增字段
            createdAt: new Date().toISOString().split('T')[0],
            isPublic: values.isPublic || false,
            //metrics: {},
            metrics: metricValues,
            file: values.file?.file?.name || 'mock_model.pkl',
            fileObj: values.file?.file, // ✅ 保留原始文件对象用于 FormData
        };
console.info("metrics:" ,metricValues)

        onUpload(newModel);
        form.resetFields();
        setSelectedMetrics([]);
        setMetricValues({});
        onCancel();
    };

    return (
        <Modal
            title="Upload new model"
            visible={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText="Upload"
            cancelText="Cancel"
            destroyOnClose
        >
            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Form.Item label="当前任务">
                    <Typography.Text strong>{problem?.title || '无'}</Typography.Text>
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Model name"
                    rules={[{ required: true, message: 'Please input model name' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="datasetId"
                    label="Linked Dataset"
                    rules={[{ required: true, message: 'Please select Dataset' }]}
                >
                    <Select placeholder="Please select Dataset">
                        {datasets?.map(ds => (
                            <Option key={ds.id} value={ds.id}>
                                {ds.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="file"
                    label="Upload file"
                    rules={[{ required: true, message: 'Please upload model file' }]}
                    valuePropName="file"
                >
                    <Upload beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Click to upload</Button>
                    </Upload>
                </Form.Item>


              
                <Form.Item label="Select Metrics">
                    <Select
                        mode="multiple"
                        placeholder="Choose metrics"
                        onChange={handleMetricsChange}
                        value={selectedMetrics}
                        allowClear
                    >
                        {metricOptions?.map((name) => (
                            <Option key={name} value={name}>
                                {name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                
                {selectedMetrics.map((metric) => (
                    <Form.Item key={metric} label={`${metric} value`} required>
                        <Input
                            type="number"
                            placeholder={`Enter ${metric} value`}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setMetricValues((prev) => ({
                                    ...prev,
                                    [metric]: isNaN(val) ? null : val,
                                }));
                            }}
                        />
                    </Form.Item>

                ))}
                <Form.Item name="isPublic" label="是否公开" valuePropName="checked">
                    <Switch checkedChildren="公开" unCheckedChildren="私有" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UploadModelModal;*/

/*import React from 'react';
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
*/