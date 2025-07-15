import React, { useState } from 'react';
import { Typography, Tabs, Card, Button, Tag, Space, Collapse, Input, List, Modal, message } from 'antd';
import { Tooltip } from 'antd'; // ✅ 确保已引入 Tooltip
import { ArrowLeftOutlined, LikeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react'; // ⬅️ 新增
//import { API_BASE_URL } from '../config/wsConfig';
import useProblemHub from '../hooks/useProblemHub';
import { DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

function ProposalDetailPage() {

  const { user } = useAuth();
  const currentUser = user?.username;

  const navigate = useNavigate();
  const { id } = useParams(); // placeholder, not yet used

  const [inputValue, setInputValue] = useState('');
  const [proposal, setProposal] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [editingCriterion, setEditingCriterion] = useState(null); // 当前正在编辑的
  const [editValue, setEditValue] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const showEditModal = (item) => {
    setEditingCriterion(item);
    setEditValue(item.content);
    setIsEditModalVisible(true);
  };


  const {
    likeEvaluationCriterion,
    addEvaluationCriterion,
    fetchProposal,
    unlikeEvaluationCriterion,
    deleteEvaluationCriterion,
    updateEvaluationCriterion,
  } = useProblemHub();

  const handleUnlike = async (sid) => {
    try {
      await unlikeEvaluationCriterion(sid);
      const updated = suggestions.map((s) =>
        s.id === sid ? { ...s, likes_count: Math.max(0, s.likes_count - 1), liked_by_me: false } : s
      );
      setSuggestions(updated);
    } catch (error) {
      message.error('Failed to unlike criterion.');
    }
  };

  useEffect(() => {
    const loadProposal = async () => {
      const data = await fetchProposal(id);
      if (data) {
        setProposal(data);
        if (Array.isArray(data.evaluationSuggestions)) {
          setSuggestions(data.evaluationSuggestions);
        } else {
          setSuggestions([]);
        }
      }
    };
    loadProposal();
  }, [id]);

  const handleLike = async (sid) => {
    try {
      await likeEvaluationCriterion(sid);
      const updated = suggestions.map((s) =>
        s.id === sid ? { ...s, likes_count: s.likes_count + 1, liked_by_me: true } : s
      );
      setSuggestions(updated);
    } catch (error) {
      message.error('Failed to like criterion.');
    }
  };

  // ✅ 正确写法：从 handleLike 中“拿出来”
  const handleAddSuggestion = async () => {
    if (!inputValue.trim()) return;
    try {
      const newSuggestion = await addEvaluationCriterion(proposal.id, inputValue.trim());
      setSuggestions([...suggestions, newSuggestion]);
      setInputValue('');
      message.success('Your suggestion was submitted.');
    } catch (error) {
      message.error('Failed to submit your suggestion.');
    }
  };

  const handleDelete = async (sid) => {
    try {
      await deleteEvaluationCriterion(sid);
      const updated = suggestions.filter((s) => s.id !== sid);
      setSuggestions(updated);
      message.success('Deleted successfully.');
    } catch (error) {
      message.error(error.message || 'Failed to delete.');
    }
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateEvaluationCriterion(editingCriterion.id, editValue);
      const newList = suggestions.map((s) =>
        s.id === updated.id ? { ...s, content: updated.content } : s
      );
      setSuggestions(newList);
      setIsEditModalVisible(false);
      message.success('Criterion updated.');
    } catch (error) {
      message.error('Failed to update criterion.');
    }
  };

  if (!proposal) return <div style={{ padding: 24 }}>Loading...</div>;
  return (
    <div style={{ padding: 24 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
        Back to Problem Hub
      </Button>

      <Card style={{ marginTop: 16 }} bordered={false}>
        <Title level={3}>{proposal.title}</Title>
        <Paragraph>{proposal.description}</Paragraph>
        <Space wrap style={{ marginBottom: 12 }}>
          {proposal.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>

        <Tabs defaultActiveKey="summary">
          <TabPane tab="Summary" key="summary">
            <Paragraph>
              This problem has received <b>{proposal.votes}</b> votes.
            </Paragraph>
          </TabPane>

          <TabPane tab="Criteria" key="criteria">
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Community-Suggested Evaluation Criteria" key="1">
                <List
                  dataSource={suggestions}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Tooltip title={item.liked_by_me ? 'Click to unlike' : 'Click to like'}>
                          <Button
                            size="small"
                            icon={<LikeOutlined />}
                            onClick={() => {
                              if (item.liked_by_me) {
                                handleUnlike(item.id);
                              } else {
                                handleLike(item.id);
                              }
                            }}
                          >
                            {item.likes_count}
                          </Button>
                        </Tooltip>,

                        item.author_username === currentUser && (
                          <Tooltip title="Edit this criterion">
                            <Button
                              size="small"
                              onClick={() => showEditModal(item)}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                        ),

                        item.author_username === currentUser && (
                          <Tooltip title="Delete this criterion">
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(item.id)}
                            />
                          </Tooltip>
                        ),
                      ]}
                    >
                      {item.content}
                    </List.Item>
                  )}
                />


              </Panel>
            </Collapse>

            <Input.TextArea
              rows={3}
              placeholder="Suggest a new evaluation criterion..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ marginTop: 16 }}
            />
            <Button
              type="primary"
              style={{ marginTop: 8 }}
              onClick={handleAddSuggestion}
              disabled={!inputValue.trim()}
            >
              Submit Criterion
            </Button>
          </TabPane>*

          <TabPane tab="Comments" key="comments">
            <Paragraph>This feature will be added later.</Paragraph>
          </TabPane>
        </Tabs>
      </Card>
      <Modal
        title="Edit Criterion"
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Save"
      >
        <Input.TextArea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
}

export default ProposalDetailPage;
