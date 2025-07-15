import React, { useState } from 'react';
import { Typography, Tabs, Card, Button, Tag, Space, Collapse, Input, List, message } from 'antd';
import { ArrowLeftOutlined, LikeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react'; // ⬅️ 新增
import { API_BASE_URL } from '../config/wsConfig';
import useProblemHub from '../hooks/useProblemHub';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;


function ProposalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // placeholder, not yet used
  //const [likedIds, setLikedIds] = useState(new Set());

  const [inputValue, setInputValue] = useState('');

  const [proposal, setProposal] = useState(null);
  //const [suggestions, setSuggestions] = useState(proposal.evaluationSuggestions);
  const [suggestions, setSuggestions] = useState([]);


  const {
    likeEvaluationCriterion,
    addEvaluationCriterion,
    fetchProposal,
  } = useProblemHub();

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
                  renderItem={(item) => {
                    //console.log("Rendering item:", item);  // ✅ 打印每一项数据
                    return (
                      <List.Item
                        actions={[
                          <Button
                            size="small"
                            icon={<LikeOutlined />}
                            disabled={item.liked_by_me}
                            onClick={() => handleLike(item.id)}
                          >
                            {item.likes_count}
                          </Button>,
                        ]}
                      >
                        {item.content}
                      </List.Item>
                    );
                  }}
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
    </div>
  );
}

export default ProposalDetailPage;
