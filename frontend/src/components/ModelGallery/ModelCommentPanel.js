// src/components/ModelStudio/ModelCommentPanel.js
import React, { useEffect, useState } from 'react';
import { Drawer, List, Input, Button, message, Popconfirm, Avatar, Typography, Space } from 'antd';
import { API_BASE_URL } from '../../config/wsConfig';

const { Text } = Typography;
const { TextArea } = Input;

function ModelCommentPanel({ visible, onClose, modelId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('access_token');

  const fetchComments = async () => {
    if (!visible) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/modelstudio/${modelId}/comments/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed loading comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
      message.error('Failed loading comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [visible]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/modelstudio/${modelId}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error('Failed to subbmit the comment');
      const data = await res.json();
      setComments((prev) => [...prev, data]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      message.error('Failed to subbmit the comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/modelstudio/comments/${commentId}/`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete the comment');
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
      message.error('Failed to delete the comment');
    }
  };

  return (
    <Drawer
      title="Comments on this model"
      placement="right"
      width={400}
      onClose={onClose}
      open={visible}
    >
      <List
        loading={loading}
        dataSource={comments}
        renderItem={(item) => (
          <List.Item
            style={{ alignItems: 'flex-start' }}
            actions={[
              <Popconfirm
                key="delete"
                title="Confirm to delete this comment？"
                onConfirm={() => handleDeleteComment(item.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button type="link" danger size="small">
                  Delete
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar>{item.user?.[0]?.toUpperCase() || 'U'}</Avatar>}
              title={<Text strong>{item.user}</Text>}
              description={
                <Space direction="vertical" size={2}>
                  <Text>{item.content}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <div style={{ marginTop: 16 }}>
        <TextArea
          rows={3}
          placeholder="Write down your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button type="primary" onClick={handleAddComment} style={{ marginTop: 8 }}>
          Submit Comment
        </Button>
      </div>
    </Drawer>
  );
}

export default ModelCommentPanel;
