import React, { useState } from 'react';
import { Typography, Tabs, Card, Button, Tag, Space, Collapse, Input, List, message } from 'antd';
import { ArrowLeftOutlined, LikeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react'; // ⬅️ 新增
import { API_BASE_URL } from '../config/wsConfig';
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;



function ProposalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // placeholder, not yet used
  const [likedIds, setLikedIds] = useState(new Set());

  const [inputValue, setInputValue] = useState('');

  const [proposal, setProposal] = useState(null);
  //const [suggestions, setSuggestions] = useState(proposal.evaluationSuggestions);
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/problemhub/proposal/${id}/`);
        const data = await res.json();
        setProposal(data);
        // 兼容将来扩展
        if (Array.isArray(data.evaluationSuggestions)) {
          setSuggestions(data.evaluationSuggestions);
        } else {
          setSuggestions([]);  // 目前默认无内容
        }
      } catch (error) {
        console.error('Failed to fetch proposal:', error);
      }
    };
    fetchProposal();
  }, [id]);


  const handleLike = (sid) => {
    if (likedIds.has(sid)) return;
    const updated = suggestions.map((s) =>
      s.id === sid ? { ...s, likes: s.likes + 1 } : s
    );
    setSuggestions(updated);
    setLikedIds(new Set(likedIds).add(sid));
  };

  const handleAddSuggestion = () => {
    if (!inputValue.trim()) return;
    const newSuggestion = {
      id: suggestions.length + 1,
      content: inputValue.trim(),
      likes: 0,
    };
    setSuggestions([...suggestions, newSuggestion]);
    setInputValue('');
    message.success('Your suggestion was submitted.');
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

          {/*<TabPane tab="Criteria" key="criteria">
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Community-Suggested Evaluation Criteria" key="1">
                <List
                  dataSource={suggestions}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          size="small"
                          icon={<LikeOutlined />}
                          disabled={likedIds.has(item.id)}
                          onClick={() => handleLike(item.id)}
                        >
                          {item.likes}
                        </Button>,
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
          </TabPane>*/}
          <TabPane tab="Criteria" key="criteria">
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Community-Suggested Evaluation Criteria" key="1">
                <Paragraph>This feature will be added later.</Paragraph>
              </Panel>
            </Collapse>
          </TabPane>
          <TabPane tab="Comments" key="comments">
            <Paragraph>This feature will be added later.</Paragraph>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default ProposalDetailPage;
