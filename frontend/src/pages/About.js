import React from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

function About() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px' }}>
      <div>
        <Title level={1}>
          About AI Battle Community----Leave for{' '}
          <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1.3em' }}>
            Ema
          </span>{' '}
          to design
        </Title>
      </div>
      
      <Paragraph style={{ fontSize: 16 }}>
        The AI Battle Community is a student-led initiative to unite learners from all backgrounds
        to build, share, and compete with machine learning models. Through collaborative
        problem-solving, battle-based competitions, and guided learning, we aim to make AI fun,
        accessible, and impactful.
      </Paragraph>
      <Paragraph style={{ fontSize: 16 }}>
        This platform is built using modern web technologies and supports multi-user competitions,
        model uploads, custom datasets, and real-time communication.
      </Paragraph>

      {/* 返回首页按钮 */}
      <Button 
        type="primary" 
        size="large" 
        style={{ marginTop: 24 }} 
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </Button>
    </div>
  );
}

export default About;
