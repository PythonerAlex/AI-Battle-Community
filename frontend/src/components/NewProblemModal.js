import React, { useState } from 'react';
import { Modal, Form, Input, Select, message, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
//import { TAG_OPTIONS } from '../constants/problemTags'; // 可选：抽离 tag 数据
import useProblemHub from '../hooks/useProblemHub';

const { TextArea } = Input;
const TAG_OPTIONS = ['Environment', 'Health', 'Education', 'Climate', 'Sustainability', 'Technology'];
function NewProblemModal({ visible, onClose, onSubmit }) {
  const [form] = Form.useForm();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalModalVisible, setEvalModalVisible] = useState(false);

  const { evaluateProposal } = useProblemHub();

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

      onClose(); // 关闭表单 Modal
      setIsEvaluating(true);
      setEvalModalVisible(true);

      // 🔍 审核提案
      //const response = await evaluateProposal(valuesWithTags);
      //const cleaned = response.replace(/```json|```/g, '').trim();
      //const evaluation = JSON.parse(cleaned);
const evaluation = await evaluateProposal(valuesWithTags);
      if (evaluation.decision === 'accept') {
        onSubmit(valuesWithTags);
        message.success('Proposal accepted and posted!');
      } else {
        Modal.info({
          title: 'Proposal Rejected by AI',
          content: (
            <div>
              <p>Your proposal was rejected based on evaluation criteria.</p>
              <ul>
                {evaluation.reasons?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ),
          okText: 'Edit and Try Again',
        });
        message.warning('Proposal rejected.');
      }

      form.resetFields();
    } catch (err) {
      console.error('Validation Failed or Evaluation Error:', err);
      message.error('Something went wrong during evaluation.');
    } finally {
      setIsEvaluating(false);
      setEvalModalVisible(false);
    }
  };

  return (
    <>
      <Modal
        title="Submit a New Problem"
        open={visible}
        onOk={handleOk}
        onCancel={() => {
          form.resetFields();
          onClose();
        }}
        okText="Submit"
        okButtonProps={{ loading: isEvaluating }}
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
            <TextArea rows={3} />
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
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="nonFunctional" label="Non-Functional Requirements">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="dataSources" label="Known or Suggested Data Sources (Optional)">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="metricHint"
            label={
              <span>
                What should a 'good model' look like?{' '}
                <Tooltip title="Describe what matters (e.g., fairness, accuracy, speed)">
                  <InfoCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: 'Please describe what you care about' }]}
          >
            <TextArea rows={2} />
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

      {/* 审核中 Modal */}
      <Modal open={evalModalVisible} footer={null} closable={false} centered>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>AI is evaluating your proposal...</p>
          <p>Please wait a few seconds.</p>
          <div style={{ marginTop: '20px' }}>
            <div className="ant-spin-dot ant-spin-dot-spin">
              <span className="ant-spin-dot-item" />
              <span className="ant-spin-dot-item" />
              <span className="ant-spin-dot-item" />
              <span className="ant-spin-dot-item" />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default NewProblemModal;
