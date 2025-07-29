import React from 'react';
import { Typography, Button, Row, Col, Card, Avatar, Space, Divider } from 'antd';
import { SmileOutlined, BulbOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

function Home() {
  return (
    <div style={{ padding: '40px' }}>
      {/* Hero Section */}
      <div
        style={{
          backgroundImage: 'url(/top.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center  center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          minHeight: '300px',
          padding: '40px 20px',
          textAlign: 'center',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Title level={1} style={{ color: 'white' }}>
          Welcome to the AI Battle Community - ABC
        </Title>
        <Paragraph style={{ color: 'white', fontSize: '18px' }}>
          From youth, by youth, uniting the community — using AI to build a better future for all.
        </Paragraph>
        <Button type="primary" size="large" href="/register">
          Get Started Now
        </Button>
      </div>

      {/* What is ABC */}
      <div style={{ marginTop: 20 }}>
        <Title level={2}>What is ABC?</Title>
        <Row gutter={[32, 32]} align="stretch">
          {/* 左侧图片 */}
          <Col xs={24} md={12}>
            <div
              style={{
                height: '100%',
                backgroundImage: 'url(/sdg_bg.png)',
                backgroundSize: 'cover',           // ✅ 保证充满 + 不留空隙
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                borderRadius: '8px',
                minHeight: '300px',                // ✅ 若父级高度不确定，加这个能撑开
              }}
            />
          </Col>

          {/* 右侧文字 + 图示 */}
          <Col xs={24} md={12}>
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',  // 居中图
                textAlign: 'left',
              }}
            >

              <div
                style={{
                  // backgroundColor: 'rgba(220, 240, 255, 0.85)',  // 淡蓝，略透明
                  backgroundColor: '#32bdefff', // 深蓝（Tailwind Indigo-800 或 SDG 蓝）
                  padding: '16px',
                  borderRadius: '10px',
                  width: '100%',
                  color: '#000',  // 确保文字可读（黑字）
                }}
              >
                <Paragraph style={{ fontSize: 18, marginBottom: 0, marginTop: 0 }}>
                  <b>AI Battle Community</b> (ABC) is a youth-led platform where anyone can turn real-world challenges,
                  especially UN SDG Problems, into machine learning battles and solutions.
                </Paragraph>
              </div>
              <img
                src="/abc_diagram.png"
                alt="ABC Architecture"
                style={{
                  marginTop: 16,
                  maxWidth: '100%',
                  maxHeight: '240px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/*<div style={{ marginTop: 20 }}>
        <Title level={2}>What is ABC?</Title>
        <Row gutter={[32, 32]} align="stretch">
          <Col xs={24} md={12}>
            <img
              src="/sdg_bg.png"
              alt="ABC Architecture"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Paragraph  style={{ fontSize: 18 }}  >
              <b>AI Battle Community</b> (ABC) is a youth-led platform where anyone can turn real-world challenges
              into machine learning battles and solutions.
              It guides users through a closed-loop system:
            </Paragraph>
            <ul style={{ fontSize: 16 }}> 
              <li><b>Problem Hub</b>: Propose and vote on social or environmental issues.</li>
              <li><b>Model Studio</b>: Train, upload, and evaluate models.</li>
              <li><b>Battle Arena</b>: Compete models under transparent metrics.</li>
              <li><b>Deployment Showcase</b>: Share impact stories and publish real-world solutions.</li>
            </ul>
          </Col>
        </Row>
      </div>*/}

      {/* How it Works */}
      <div style={{ marginTop: 20 }}>
        <Title level={2}>How It Works</Title>
        <Row gutter={[24, 24]} align="stretch">
          {[
            {
              title: '1. Propose Problems',
              description: 'Submit real-world challenges in the Problem Hub.',
            },
            {
              title: '2. Build Models',
              description: 'Use Model Studio to develop solutions with shared tools.',
            },
            {
              title: '3. Compete in Battles',
              description: 'Let models face off in the Battle Arena.',
            },
            {
              title: '4. Real-World Impact',
              description: 'Top models get deployed and recognized.',
            },
          ].map((step, idx) => (
            <Col xs={24} md={6} key={idx}>
              <Card
                bordered
                hoverable
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textAlign: 'center',
                }}
              >
                <Title level={3}>{step.title}</Title>
                <Paragraph style={{ flexGrow: 1 }}>{step.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Beneficiaries Section */}
      <div style={{ marginTop: 20 }}>
        <Title level={2}>Who Benefits?</Title>
        <Row gutter={[24, 24]} align="stretch">
          {[
            {
              icon: <SmileOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
              title: 'Students & Youth',
              desc: 'Hands-on AI experience, especially for those with limited access.',
            },
            {
              icon: <BulbOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
              title: 'Educators & Mentors',
              desc: 'Teach AI + SDGs through real-world, project-based learning.',
            },
            {
              icon: <TeamOutlined style={{ fontSize: 32, color: '#faad14' }} />,
              title: 'NGOs & Innovators',
              desc: 'Access community-driven AI tools for your social missions.',
            },
            {
              icon: <UserOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
              title: 'Citizen Contributors',
              desc: 'Vote, propose, and shape criteria — no coding required!',
            },
          ].map((item, idx) => (
            <Col xs={24} md={6} key={idx}>
              <Card
                bordered
                hoverable
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textAlign: 'center',
                }}
              >
                {item.icon}
                <Title level={4}>{item.title}</Title>
                <Paragraph style={{ flexGrow: 1 }}>{item.desc}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Testimonials */}
      <div style={{ marginTop: 20 }}>
        <Title level={2}>What People Say</Title>
        <Row gutter={[24, 24]} align="stretch">
          {[
            {
              name: 'Jenny, Grade 10',
              feedback: 'I never thought I could do AI until I joined ABC!',
            },
            {
              name: 'Mr. Lopez, GreenFuture',
              feedback: 'Our NGO used a winning model to predict wildfires.',
            },
            {
              name: 'Rajiv, Age 14',
              feedback: 'The battles made machine learning fun and exciting!',
            },
          ].map((item, idx) => (
            <Col xs={24} md={8} key={idx}>
              <Card
                bordered
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Paragraph style={{ flexGrow: 1 }}>"{item.feedback}"</Paragraph>
                <Text type="secondary">– {item.name}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Team Introduction */}
      <div style={{ marginTop: 20 }}>
        <Title level={2}>Meet Our Team</Title>
        <Row gutter={[24, 24]} align="stretch">
          {[
            {
              name: 'Zijian (Alex) Jin',
              role: 'CEO & Chief Architect',
              desc: 'Co-founder of SATDuel, USACO Silver, system architect & full-stack developer.',
            },
            {
              name: 'Xuyang (Kenny) Wang',
              role: 'CTO',
              desc: 'Mecha Mayhem Semi-Finalist, coding club founder, robotics and CS expert.',
            },
            {
              name: 'Anyue (Ema) Sun',
              role: 'CMO & UI/UX',
              desc: 'Youth Voice founder, UN Youth Speaker nominee, UI designer & marketer.',
            },
          ].map((member, idx) => (
            <Col xs={24} md={8} key={idx}>
              <Card
                bordered
                hoverable
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textAlign: 'center',
                }}
              >
                <Avatar size={64} icon={<UserOutlined />} style={{ margin: '0 auto' }} />
                <Title level={4} style={{ marginTop: 10 }}>{member.name}</Title>
                <Text type="secondary">{member.role}</Text>
                <Paragraph style={{ marginTop: 10, flexGrow: 1 }}>{member.desc}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Call to Action */}
      <div style={{ marginTop: 80, textAlign: 'center' }}>
        <Divider />
        <Title level={2}>Ready to make an impact?</Title>
        <Paragraph>
          Join our global community and turn your ideas into real AI-powered solutions.
        </Paragraph>
        <Space>
          <Button type="primary" size="large" href="/register">Join Now</Button>
          <Button size="large" href="/about">Learn More</Button>
        </Space>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 80, textAlign: 'center', color: '#888', fontSize: '14px' }}>
        <Divider />
        <Text>© {new Date().getFullYear()} AI Battle Community. All rights reserved.</Text>
      </div>
    </div>
  );
}

export default Home;


/*import React from 'react';
import { Typography, Button, Row, Col, Card, Space } from 'antd';
import { RocketOutlined, CodeOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function Home() {
  return (
    <div style={{ padding: '40px' }}>
     
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <Title level={1}>Welcome to the AI Battle Community-ABC</Title>
        <Paragraph>
          Here, you'll learn, design, and train your own machine learning models, participate in real battles, and become the hero of the AI era!
        </Paragraph>
        <Button type="primary" size="large" href="/register">Get Started Now</Button>
      </div>

 
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
*/

