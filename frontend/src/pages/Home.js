import React from 'react';
import { Typography, Button, Row, Col, Card, Space } from 'antd';
import { RocketOutlined, CodeOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function Home() {
  return (
    <div style={{ padding: '40px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <Title level={1}>Welcome to the AI Battle Community-ABC</Title>
        <Paragraph>
          Here, you'll learn, design, and train your own machine learning models, participate in real battles, and become the hero of the AI era!
        </Paragraph>
        <Button type="primary" size="large" href="/register">Get Started Now</Button>
      </div>

      {/* Feature Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card hoverable bordered style={{ textAlign: 'center' }}>
            <RocketOutlined style={{ fontSize: 40, color: '#1890ff' }} />
            <Title level={3}>Fundamental Learning</Title>
            <Paragraph>
              Learn Python, TensorFlow, and machine learning principles from scratch. Master practical skills through projects.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card hoverable bordered style={{ textAlign: 'center' }}>
            <CodeOutlined style={{ fontSize: 40, color: '#52c41a' }} />
            <Title level={3}>Model Training</Title>
            <Paragraph>
              Develop and train your own models using embedded Jupyter Notebooks. Supports saving and testing.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card hoverable bordered style={{ textAlign: 'center' }}>
            <TrophyOutlined style={{ fontSize: 40, color: '#faad14' }} />
            <Title level={3}>Model Battles</Title>
            <Paragraph>
              Join battle rooms, upload your models to compete against opponents, win points and badges, and climb the leaderboard!
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Highlight Section */}
      <div style={{ marginTop: 80, textAlign: 'center' }}>
        <Title level={2}>Platform Highlights</Title>
        <Space size="large" direction="horizontal" style={{ marginTop: 20 }}>
          <Card bordered={false}>
            <Title level={3}>Users</Title>
            <Paragraph strong>1500+</Paragraph>
          </Card>
          <Card bordered={false}>
            <Title level={3}>Models Uploaded</Title>
            <Paragraph strong>320+</Paragraph>
          </Card>
          <Card bordered={false}>
            <Title level={3}>Total Battles Played</Title>
            <Paragraph strong>980+</Paragraph>
          </Card>
        </Space>
      </div>
    </div>
  );
}

export default Home;
