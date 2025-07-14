import React, { useState } from 'react';
import { Typography, Tabs, Card, Button, Tag, Space, Collapse, Input, List, message } from 'antd';
import { ArrowLeftOutlined, LikeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const mockProposal = {
  id: 1,
  title: 'How can we predict forest fires more effectively?',
  description: 'Canadian forests suffer from uncontrollable wildfires. Can AI help forecast and prevent them?',
  tags: ['Environment', 'Climate'],
  votes: 12,
  evaluationSuggestions: [
    { id: 1, content: 'Test model accuracy on historical wildfire data', likes: 4 },
    { id: 2, content: 'Include robustness to missing satellite data', likes: 2 },
  ],
};

function ProposalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // placeholder, not yet used
  const [likedIds, setLikedIds] = useState(new Set());
  const [suggestions, setSuggestions] = useState(mockProposal.evaluationSuggestions);
  const [inputValue, setInputValue] = useState('');

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

  return (
    <div style={{ padding: 24 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
        Back to Problem Hub
      </Button>

      <Card style={{ marginTop: 16 }} bordered={false}>
        <Title level={3}>{mockProposal.title}</Title>
        <Paragraph>{mockProposal.description}</Paragraph>
        <Space wrap style={{ marginBottom: 12 }}>
          {mockProposal.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>

        <Tabs defaultActiveKey="summary">
          <TabPane tab="Summary" key="summary">
            <Paragraph>
              This problem has received <b>{mockProposal.votes}</b> votes.
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
