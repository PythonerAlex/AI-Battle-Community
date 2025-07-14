import React, { useState, useEffect } from 'react';
import { Button, Tabs, List, Card, Tag, Space, Typography, Alert } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import NewProblemModal from '../components/NewProblemModal';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// ✅ Mock Cycles
const mockCycles = [
  {
    id: 3,
    title: 'Round 3 - July 2025',
    startTime: '2025-07-01T00:00:00Z',
    endTime: '2025-07-31T23:59:59Z',
  },
  {
    id: 2,
    title: 'Round 2 - June 2025',
    startTime: '2025-06-01T00:00:00Z',
    endTime: '2025-06-30T23:59:59Z',
  },
];

// ✅ Mock Problems (with cycleId)
const mockProblems = [
  {
    id: 1,
    title: 'How can we predict forest fires more effectively?',
    description: 'Canadian forests suffer from uncontrollable wildfires. Can AI help forecast and prevent them?',
    tags: ['Environment', 'Climate'],
    votes: 12,
    cycleId: 3,
  },
  {
    id: 2,
    title: 'How can access to clean drinking water be improved?',
    description: 'Many communities lack reliable access to safe drinking water sources.',
    tags: ['Health'],
    votes: 8,
    cycleId: 3,
  },
  {
    id: 3,
    title: 'How to reduce plastic usage in local markets?',
    description: 'Plastic bags are still widely used. Let’s explore alternatives.',
    tags: ['Sustainability'],
    votes: 4,
    cycleId: 2, // Previous round (not shown)
  },
];

function ProblemHub() {
  const [problems, setProblems] = useState(mockProblems);
  const [votedIds, setVotedIds] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // ⏳ Detect current cycle based on current date
  useEffect(() => {
    const now = dayjs();
    const current = mockCycles.find((cycle) =>
      now.isAfter(dayjs(cycle.startTime)) && now.isBefore(dayjs(cycle.endTime))
    );

    if (current) {
      setCurrentCycle(current);
      const diffDays = dayjs(current.endTime).diff(now, 'day');
      setDaysLeft(diffDays);

      const interval = setInterval(() => {
        const now = dayjs();
        const end = dayjs(current.endTime);
        const diff = end.diff(now);

        if (diff <= 0) {
          setTimeLeft('Round ended');
          clearInterval(interval);
          return;
        }

        const duration = dayjs.duration(diff);
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);


  const handleVote = (id) => {
    if (votedIds.has(id)) return;
    const updated = problems.map((p) =>
      p.id === id ? { ...p, votes: p.votes + 1 } : p
    );
    setProblems(updated);
    setVotedIds(new Set(votedIds).add(id));
  };

  if (!currentCycle) {
    return <Alert message="No active proposal round." type="warning" showIcon />;
  }

  const currentProblems = problems.filter((p) => p.cycleId === currentCycle.id);

  return (
    <div style={{ padding: '24px' }}>
      {/* 🟦 顶部标题栏 + New按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Problem Hub
        </Title>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          New Problem
        </Button>
      </div>

      {/* 🔔 当前周期倒计时提示 */}
      <Card
        style={{
          backgroundColor: '#f0f5ff',
          border: '1px solid #adc6ff',
          marginBottom: 24,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Title level={4} style={{ margin: 0, color: '#1d39c4' }}>
          🔁 {currentCycle.title}
        </Title>
        <Paragraph style={{ fontSize: '18px', fontWeight: 500, color: '#391085', marginTop: 4 }}>
          ⏳ Ending in <span style={{ fontWeight: 'bold' }}>{timeLeft}</span>
        </Paragraph>
      </Card>


      {/* 🧩 Tabs: All & Popular */}
      <Tabs defaultActiveKey="all">
        <TabPane tab="All" key="all">
          <ProblemList
            problems={currentProblems}
            onVote={handleVote}
            votedIds={votedIds}
          />
        </TabPane>
        <TabPane tab="Popular" key="popular">
          <ProblemList
            problems={[...currentProblems].sort((a, b) => b.votes - a.votes)}
            onVote={handleVote}
            votedIds={votedIds}
          />
        </TabPane>
      </Tabs>

      {/* ➕ 新建提案弹窗 */}
      <NewProblemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(newProblem) => {
          const newId = problems.length + 1;
          setProblems([
            {
              ...newProblem,
              id: newId,
              votes: 0,
              cycleId: currentCycle.id, // 自动属于当前轮
            },
            ...problems,
          ]);
        }}
      />
      <Button
        type="dashed"
        onClick={() => setShowHistory(!showHistory)}
        style={{ marginTop: 24 }}
      >
        {showHistory ? 'Hide Past Rounds' : 'View Past Rounds'}
      </Button>
      {showHistory &&
        mockCycles
          .filter((c) => c.id !== currentCycle.id) // 只显示历史轮
          .map((cycle) => {
            const cycleProblems = problems.filter((p) => p.cycleId === cycle.id);
            return (
              <div key={cycle.id} style={{ marginTop: 32 }}>
                <Title level={4}>{cycle.title}</Title>
                {cycleProblems.length > 0 ? (
                  <ProblemList
                    problems={[...cycleProblems].sort((a, b) => b.votes - a.votes)}
                    onVote={() => { }} // 禁用历史投票
                    votedIds={new Set()} // 禁用按钮
                    disableVoting={true}
                  />
                ) : (
                  <Paragraph>No proposals were submitted in this round.</Paragraph>
                )}
              </div>
            );
          })}

    </div>
  );
}

function ProblemList({ problems, onVote, votedIds, disableVoting = false }) {

  const navigate = useNavigate();
  return (
    <List
      grid={{ gutter: 16, column: 1 }}
      dataSource={problems}
      renderItem={(item) => (
        <List.Item>
          <div
            onClick={() => navigate(`/problem/${item.id}`)}
            style={{ cursor: 'pointer', width: '100%' }}
          >
            <Card
              hoverable
              title={<Title level={5}>{item.title}</Title>}
              extra={
                <Button
                  type="primary"
                  icon={<LikeOutlined />}
                  disabled={votedIds.has(item.id) || disableVoting}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disableVoting) onVote(item.id);
                  }}
                >
                  {item.votes}
                </Button>
              }
            >
              <Paragraph>{item.description}</Paragraph>
              <Space wrap>
                {item.tags.map((tag) => (
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

export default ProblemHub;


/*import React, { useState } from 'react';
import { Button, Tabs, List, Card, Tag, Space, Typography } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import NewProblemModal from '../components/NewProblemModal';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;


const mockProblems = [
  {
    id: 1,
    title: 'How can we predict forest fires more effectively?',
    description: 'Canadian forests suffer from uncontrollable wildfires. Can AI help forecast and prevent them?',
    tags: ['Environment', 'Climate'],
    votes: 12,
  },
  {
    id: 2,
    title: 'How can access to clean drinking water be improved?',
    description: 'Many communities lack reliable access to safe drinking water sources.',
    tags: ['Health'],
    votes: 8,
  },
  {
    id: 3,
    title: 'What solutions can reduce food waste in schools?',
    description: 'A large portion of food in school cafeterias is wasted. What measures can reduce this?',
    tags: ['Education', 'Sustainability'],
    votes: 10,
  },
];

function ProblemHub() {
  const [problems, setProblems] = useState(mockProblems);
  const [votedIds, setVotedIds] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);

  const handleVote = (id) => {
    if (votedIds.has(id)) return;
    const updated = problems.map((p) =>
      p.id === id ? { ...p, votes: p.votes + 1 } : p
    );
    setProblems(updated);
    setVotedIds(new Set(votedIds).add(id));
  };

  return (
    <div style={{ padding: '24px' }}>
     
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Problem Hub
        </Title>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          New Problem
        </Button>

      </div>

    
      <Tabs defaultActiveKey="all">
        <TabPane tab="All" key="all">
          <ProblemList
            problems={problems}
            onVote={handleVote}
            votedIds={votedIds}
          />
        </TabPane>
        <TabPane tab="Popular" key="popular">
          <ProblemList
            problems={[...problems].sort((a, b) => b.votes - a.votes)}
            onVote={handleVote}
            votedIds={votedIds}
          />
        </TabPane>
      </Tabs>

      <NewProblemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(newProblem) => {
          const newId = problems.length + 1;
          setProblems([
            { ...newProblem, id: newId, votes: 0 },
            ...problems,
          ]);
        }}
      />


    </div>

  );
}

function ProblemList({ problems, onVote, votedIds }) {
  const navigate = useNavigate();
  return (
    <List
      grid={{ gutter: 16, column: 1 }}
      dataSource={problems}
      renderItem={(item) => (
        <List.Item>
        
          <div
            onClick={() => navigate(`/problem/${item.id}`)}
            style={{ cursor: 'pointer', width: '100%' }}
          >
            <Card
              hoverable
              title={<Title level={5}>{item.title}</Title>}
              extra={
                <Button
                  type="primary"
                  icon={<LikeOutlined />}
                  disabled={votedIds.has(item.id)}
                  onClick={(e) => {
                    e.stopPropagation(); // 防止点击按钮时触发跳转
                    onVote(item.id);
                  }}
                >
                  {item.votes}
                </Button>
              }
            >
              <Paragraph>{item.description}</Paragraph>
              <Space wrap>
                {item.tags.map((tag) => (
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

export default ProblemHub;
*/