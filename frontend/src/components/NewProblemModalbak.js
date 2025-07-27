
import React, { useState } from 'react';
import { Modal, Form, Input, Select, message, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import useProblemHub from '../hooks/useProblemHub'; // ⬅️ 确保已正确导入

const { TextArea } = Input;


const TAG_OPTIONS = ['Environment', 'Health', 'Education', 'Climate', 'Sustainability', 'Technology'];

function NewProblemModal({ visible, onClose, onSubmit }) {
    const [form] = Form.useForm();
    const { evaluateProposal } = useProblemHub(); // ⬅️ 使用自定义 hook

    const handleOk = async () => {
        try {       
            const values = await form.validateFields();
            const valuesWithTags = {
                ...values,
                tags: values.tags || [],
                description: `
                    【Background】${values.background}
                    【Goal】${values.goal}
                    【Non-Functional】${values.nonFunctional || 'N/A'}
                    【Data Sources】${values.dataSources || 'N/A'}
                    【Evaluation Preference】${values.metricHint}
      `.trim(),
            };

            onClose();
            message.loading({ content: 'Submitting for AI evaluation...', key: 'llm' });

            // ✅ 使用 Hook 中的函数调用后端
            const evaluation = await evaluateProposal(valuesWithTags);

            if (evaluation.decision === 'accept') { 
                onSubmit(valuesWithTags);
                message.success({ content: 'Proposal accepted and posted!', key: 'llm' });
            } else {
                Modal.info({
                    title: 'Proposal Rejected by AI',
                    content: (
                        <div>
                            <p>Your proposal was automatically rejected based on evaluation criteria.</p>
                            <ul>
                                {evaluation.reasons?.map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    ),
                    okText: 'Edit and Try Again',
                });
                message.warning({ content: 'Proposal rejected.', key: 'llm' });
            }

            form.resetFields();
        } catch (err) {
            console.log('Validation Failed or Evaluation Error:', err);
            message.error({ content: 'Something went wrong. Try again.', key: 'llm' });
        }
    };

    /*const TAG_OPTIONS = ['Environment', 'Health', 'Education', 'Climate', 'Sustainability', 'Technology'];
    
    const token = localStorage.getItem('access_token');
    const headers = token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        : { 'Content-Type': 'application/json' };
    */
    /*function NewProblemModal({ visible, onClose, onSubmit }) {
        const [form] = Form.useForm();
        const handleOk = async () => {
            try {
                const values = await form.validateFields();
                const valuesWithTags = {
                    ...values,
                    tags: values.tags || [],
                    description: `
            【Background】${values.background}
            【Goal】${values.goal}
            【Non-Functional】${values.nonFunctional || 'N/A'}
            【Data Sources】${values.dataSources || 'N/A'}
            【Evaluation Preference】${values.metricHint}
          `.trim(),
                };
    
                // 关闭当前提案 Modal
                onClose();
                message.loading({ content: 'Submitting for AI evaluation...', key: 'llm' });
    
                // 🔍 1. 调用 LLM 审核端点
                const res = await fetch(`${API_BASE_URL}/api/problemhub/llm-problem-evaluate/`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(valuesWithTags),
                });
                const data = await res.json();
                // 清理 Markdown 包裹符号
                const cleaned = data.evaluation.replace(/```json|```/g, '').trim();
                // 🔍 2. 解析结果（字段为 string 格式 JSON，需要 parse）
                //const evaluation = JSON.parse(data.evaluation);
                const evaluation = JSON.parse(cleaned);
                if (evaluation.decision === 'accept') {
                    // 🔄 提交提案进入数据库 + 显示列表（调用父组件的 onSubmit）
                    onSubmit(valuesWithTags);
                    message.success({ content: 'Proposal accepted and posted!', key: 'llm' });
                } else {
                    // 🚫 弹窗提示用户被拒绝 + 理由
                    Modal.info({
                        title: 'Proposal Rejected by AI',
                        content: (
                            <div>
                                <p>Your proposal was automatically rejected based on evaluation criteria.</p>
                                <ul>
                                    {evaluation.reasons?.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        ),
                        okText: 'Edit and Try Again',
                    });
                    message.warning({ content: 'Proposal rejected.', key: 'llm' });
                }
    
                form.resetFields();
            } catch (err) {
                console.log('Validation Failed or Evaluation Error:', err);
                message.error({ content: 'Something went wrong. Try again.', key: 'llm' });
            }
        };*/

    /*const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const valuesWithTags = {
                ...values,
                tags: values.tags || [],
                description: `
                    【Background】${values.background}
                    【Goal】${values.goal}
                    【Non-Functional】${values.nonFunctional || 'N/A'}
                    【Data Sources】${values.dataSources || 'N/A'}
                    【Evaluation Preference】${values.metricHint}
            `.trim(),
            };
            onSubmit(valuesWithTags);
            form.resetFields();
            onClose();
            message.success('Problem submitted successfully!');
        } catch (err) {
            console.log('Validation Failed:', err);
        }
    };*/


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
                    name="background"
                    label={
                        <span>
                            Background & Social Impact{' '}
                            <Tooltip title="Why is this problem important? Who is affected? Is it linked to SDG goals?">
                                <InfoCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                    rules={[{ required: true, message: 'Please provide background info' }]}
                >
                    <TextArea rows={3} placeholder="e.g. Water pollution affects millions, especially in rural communities..." />
                </Form.Item>

                <Form.Item
                    name="goal"
                    label={
                        <span>
                            Functional Goal{' '}
                            <Tooltip title="What should the AI model do? (e.g., predict, classify, detect, rank...)">
                                <InfoCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                    rules={[{ required: true, message: 'Please describe the model’s target function' }]}
                >
                    <TextArea rows={2} placeholder="e.g. Predict the risk level of water contamination based on sensor data" />
                </Form.Item>

                <Form.Item
                    name="nonFunctional"
                    label={
                        <span>
                            Non-Functional Requirements{' '}
                            <Tooltip title="Any expectations on performance, fairness, speed, etc.? Use natural language.">
                                <InfoCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                >
                    <TextArea rows={2} placeholder="e.g. The model should not favor any region; should respond in under 3 seconds." />
                </Form.Item>

                <Form.Item
                    name="dataSources"
                    label="Known or Suggested Data Sources (Optional)"
                >
                    <TextArea rows={2} placeholder="e.g. https://data.worldbank.org/... or personal dataset idea..." />
                </Form.Item>

                <Form.Item
                    name="metricHint"
                    label={
                        <span>
                            What should a 'good model' look like?{' '}
                            <Tooltip title="You don’t need to use technical terms. Just describe what matters to you (e.g. avoid missing cases, be fast, be fair...)">
                                <InfoCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                    rules={[{ required: true, message: 'Please describe what you care about' }]}
                >
                    <TextArea rows={2} placeholder="e.g. I care more about missing true cases than having false alarms. Also, fairness matters." />
                </Form.Item>

                <Form.Item
                    name="tags"
                    label="Tags"
                >
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

/*import React, { useState } from 'react';
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
*/