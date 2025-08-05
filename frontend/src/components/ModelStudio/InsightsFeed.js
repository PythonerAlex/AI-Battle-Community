import React, { useState } from 'react';
import { List, Card, Avatar, Button, Tooltip, Modal, Form, Input, message } from 'antd';
import { LikeOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;

const mockPosts = [
  {
    id: 1,
    author: 'Alice',
    avatar: 'https://i.pravatar.cc/50?img=1',
    title: 'My first training log',
    content:
      'Tried training ResNet50 on CIFAR-10, achieved 92% after 50 epochs. Tips: use cosine LR scheduler!',
    likes: 3,
    comments: [
      {
        id: 1,
        author: 'Bob',
        content: 'Nice work! Did you use data augmentation?',
        timestamp: '2025-08-01 12:00',
      },
    ],
    timestamp: '2025-08-01 10:00',
  },
      {
    id: 2,
    author: 'David',
    avatar: 'https://i.pravatar.cc/50?img=2',
    title: 'When my model failed miserably…',
    content:
      'Tried to train a Transformer on 2GB of RAM and my PC crashed 😂',
    likes: 5,
    comments: [],
    timestamp: '2025-08-02 18:20',
  },
];

const InsightsFeed = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleNewPost = (values) => {
    const newPost = {
      id: posts.length + 1,
      author: 'CurrentUser', // TODO: Replace with real user
      avatar: 'https://i.pravatar.cc/50?img=5',
      title: values.title,
      content: values.content,
      likes: 0,
      comments: [],
      timestamp: moment().format('YYYY-MM-DD HH:mm'),
    };
    setPosts([newPost, ...posts]);
    message.success('Post created!');
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: '16px', maxWidth: 800, margin: '0 auto' }}>
      <h2>🧠 Experience Sharing Zone</h2>
      <p>
        Share training logs, lessons learned from failures, tuning tips, and more.
      </p>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => setIsModalVisible(true)}
      >
        New Post
      </Button>

      <List
        itemLayout="vertical"
        dataSource={posts}
        renderItem={(post) => (
          <Card
            key={post.id}
            style={{ marginBottom: 16 }}
            title={post.title}
            extra={<span>{moment(post.timestamp).fromNow()}</span>}
          >
            <List.Item.Meta
              avatar={<Avatar src={post.avatar} />}
              title={post.author}
              description={post.content}
            />
            <div style={{ marginTop: 12 }}>
              <Button type="link" icon={<LikeOutlined />}>
                {post.likes}
              </Button>
              <Button type="link" icon={<MessageOutlined />}>
                {post.comments.length}
              </Button>
            </div>

            {post.comments.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>Comments</h4>
                {post.comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      marginBottom: 12,
                      padding: '8px 12px',
                      background: '#fafafa',
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{c.author}</div>
                    <div>{c.content}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      <Tooltip title={c.timestamp}>
                        {moment(c.timestamp).fromNow()}
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      />

      {/* Modal for new post */}
      <Modal
        title="Create New Post"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleNewPost}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter post title" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <TextArea rows={4} placeholder="Share your insights..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InsightsFeed;

/*import React from 'react';

const InsightsFeed = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2>🧠 Experience Sharing Zone</h2>
      <p>Share training logs, lessons learned from failures, tuning tips, and more (mock data).</p>
    </div>
  );
};

export default InsightsFeed;*/
