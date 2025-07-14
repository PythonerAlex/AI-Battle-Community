import React from 'react';
import { Typography, Card, Empty } from 'antd';
import { CommentOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function Forum() {
  return (
    <div style={{ padding: '40px' }}>
      <Card>
        <Title level={2}>
          <CommentOutlined style={{ marginRight: 10 }} />
          Community Forum (Under Development)
        </Title>
        <Paragraph>
          This will be the primary place for users to communicate, share models, ask questions, and organize competitions. Future features include posts, comments, and likes.
        </Paragraph>
        <img
          src="/images/phase2_pipeline.jpg"
          alt="Phase II Working Pipeline"
          style={{
            display: 'block',          // ✅ 让 margin 自动居中生效
            margin: '40px auto',       // ✅ 垂直留白 + 水平居中
            width: '60%',              // ✅ 缩小图片宽度（你也可以改成 50% 或 400px）
            maxWidth: '600px',         // ✅ 设置最大宽度防止在大屏过宽
            borderRadius: '8px',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
          }}
        />

        <Empty
          description="Forum feature coming soon, stay tuned!"
          imageStyle={{ height: 80, marginTop: 40 }}
        />
      </Card>
    </div>
  );
}

export default Forum;