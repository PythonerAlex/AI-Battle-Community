// src/components/ProblemList.js
import React from 'react';
import { List, Card, Button, Tag, Space, Typography, message } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Paragraph, Title } = Typography;
function ProblemList({
  problems,
  onVote,
  onUnvote,
  onDelete, // ⬅️ 新增
  votedIds,
  disableVoting = false,
  currentUser,
}) {
  const navigate = useNavigate();

  return (
    <List
      grid={{ gutter: 16, column: 1 }}
      dataSource={problems}
      renderItem={(item) => (
        <List.Item>
          <div onClick={() => navigate(`/problem/${item.id}`)} style={{ cursor: 'pointer', width: '100%' }}>
            <Card
              hoverable
              title={<Title level={5}>{item.title}</Title>}
              extra={
                <Space>
                  {!votedIds.has(item.id) && (
                    <Button
                      type="primary"
                      icon={<LikeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUser) return message.info('Please login to vote.');
                        if (disableVoting) return;
                        onVote(item.id);
                      }}
                    >
                      {item.votes}
                    </Button>
                  )}

                  {votedIds.has(item.id) && (
                    <Button
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUser) return message.info('Please login to unvote.');
                        onUnvote(item.id);
                      }}
                    >
                      Cancel Vote
                    </Button>
                  )}

                  {/* ✅ 删除按钮，仅作者可见 */}
                  {currentUser === item.author && (
                    <Button
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Space>
              }
            >
              <Paragraph>{item.description}</Paragraph>
              <Space wrap>
                {(Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',')).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </Card>
          </div>
        </List.Item>
      )}
    />
  );
}
export default ProblemList;