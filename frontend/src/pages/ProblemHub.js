import React, { useState, useEffect } from 'react';
import { Button, Tabs, List, Card, Tag, Space, Typography, Alert, Input, CheckableTag, Switch, message } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import NewProblemModal from '../components/NewProblemModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useProblemHub from '../hooks/useProblemHub';
import ProblemList from '../components/ProblemList';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
  
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

function ProblemHub() {
  const [modalVisible, setModalVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [justEndedCycle, setJustEndedCycle] = useState(null);
  const [nextCycle, setNextCycle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagFilterMode, setTagFilterMode] = useState('OR'); // 'OR' 或 'AND'

  const handleTagChange = (tag, checked) => {
    setSelectedTags((prev) =>
      checked ? [...prev, tag] : prev.filter((t) => t !== tag)
    );
  };
  const { user } = useAuth();
  const currentUser = user?.username;

  const {
    cycles,
    problems,
    votedIds,
    fetchCycles,
    fetchCurrentProblems,
    fetchAllProblems,
    fetchVotedProblems,
    submitProblem,
    voteProblem,
    unvoteProblem,
    deleteProposal,
    setProblems,
  } = useProblemHub();

  useEffect(() => {
    fetchCycles();
    //fetchCurrentProblems();
    fetchAllProblems();
    fetchVotedProblems();
  }, []);

  // ✅ 实时判断轮次状态（current, justEnded, next）
  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();

      const current = cycles.find(
        (c) => now.isAfter(dayjs(c.start_time)) && now.isBefore(dayjs(c.end_time))
      );
      setCurrentCycle(current || null);

      const endedCycles = cycles
        .filter((c) => dayjs(c.end_time).isBefore(now))
        .sort((a, b) => dayjs(b.end_time).diff(dayjs(a.end_time)));
      setJustEndedCycle(!current && endedCycles.length > 0 ? endedCycles[0] : null);

      const futureCycles = cycles
        .filter((c) => dayjs(c.start_time).isAfter(now))
        .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)));
      setNextCycle(futureCycles.length > 0 ? futureCycles[0] : null);

      // 倒计时更新
      if (current) {
        const end = dayjs(current.end_time);
        const diff = end.diff(now);
        if (diff <= 0) {
          setTimeLeft('⏳ Ending...');
        } else {
          const dur = dayjs.duration(diff);
          const d = Math.floor(dur.asDays());
          const h = dur.hours();
          const m = dur.minutes();
          const s = dur.seconds();
          setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }
      } else {
        setTimeLeft('');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cycles]);

  const handleVote = async (id) => {
    if (!currentUser) return message.info('Please login to vote.');
    if (votedIds.has(id)) return;

    await voteProblem(id);

    // ✅ 乐观更新投票数
    const updated = problems.map((p) =>
      p.id === id ? { ...p, votes: p.votes + 1 } : p
    );
    // 注意：这里直接 setProblems 不可行，因为它在 Hook 内部
    // 你可以考虑在 useProblemHub 中添加 `setProblems` 暴露出来
  };

  const handleSubmit = async (newProblem) => {
    const response = await submitProblem(newProblem);
    if (response && response.id) {
      message.success('Problem submitted!');
      fetchCurrentProblems(); // ✅ 刷新
    }
  };

// ✅ 取消投票 + 乐观更新
const handleUnvote = async (id) => {
  if (!currentUser) return message.info('Please login to unvote.');
  await unvoteProblem(id);
  setProblems((prev) =>
    prev.map((p) =>
      p.id === id ? { ...p, votes: Math.max(0, p.votes - 1) } : p
    )
  );
};

// ✅ 删除提案 + 乐观移除
const handleDelete = async (id) => {
  await deleteProposal(id);
  setProblems((prev) => prev.filter((p) => p.id !== id));
  message.success('Proposal deleted.');
};


  const allTags = Array.from(
    new Set(
      problems
        .flatMap(p => Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(','))
        .map(t => t.trim())
    )
  );

  const currentProblems = currentCycle && Array.isArray(problems)
    ? problems.filter((p) => p.cycle.id === currentCycle.id)
    : [];

  // Filter proposals
  let displayedProblems = currentProblems;
  if (showOnlyMine && currentUser) {
    displayedProblems = displayedProblems.filter(p => p.author === currentUser);
  }
  if (searchTerm.trim()) {
    const keyword = searchTerm.toLowerCase();
    displayedProblems = displayedProblems.filter(p =>
      p.title.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword) ||
      (Array.isArray(p.tags) && p.tags.some(tag => tag.toLowerCase().includes(keyword)))
    );
  }
  if (selectedTags.length > 0) {
    displayedProblems = displayedProblems.filter(p => {
      const tags = Array.isArray(p.tags)
        ? p.tags.map(t => t.trim())
        : String(p.tags || '').split(',').map(t => t.trim());

      if (tagFilterMode === 'AND') {
        // 所有 selectedTags 都要存在于 problem 的 tag 中
        return selectedTags.every(tag => tags.includes(tag));
      } else {
        // 只要有一个 selectedTag 存在于 problem 的 tag 中即可
        return selectedTags.some(tag => tags.includes(tag));
      }
    });
  }

  if (currentCycle) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3}>Problem Hub</Title>
          <Button
            type="primary"
            disabled={!currentUser}
            onClick={() => setModalVisible(true)}
          >
            New Problem
          </Button>
        </div>

        <Card style={{ backgroundColor: '#f0f5ff', border: '1px solid #adc6ff', marginBottom: 24 }} bodyStyle={{ padding: 16 }}>
          <Title level={4} style={{ margin: 0, color: '#1d39c4' }}>🔁 {currentCycle.title}</Title>
          <Paragraph style={{ fontSize: '18px', fontWeight: 500, color: '#391085', marginTop: 4 }}>
            ⏳ Ending in <span style={{ fontWeight: 'bold' }}>{timeLeft}</span>
          </Paragraph>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>Proposals</Title>
            <label>
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Only show mine
            </label>
          </Space>

          <Input.Search
            placeholder="Search proposals..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 280 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          {/* ✅ 自定义可选标签组 */}
          <Space wrap>
            {allTags.map((tag) => {
              const isChecked = selectedTags.includes(tag);
              return (
                <Tag
                  key={tag}
                  style={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    border: isChecked ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    backgroundColor: isChecked ? '#e6f7ff' : '#fafafa',
                    color: isChecked ? '#1890ff' : 'inherit',
                  }}
                  onClick={() => {
                    const nextTags = isChecked
                      ? selectedTags.filter(t => t !== tag)
                      : [...selectedTags, tag];
                    setSelectedTags(nextTags);
                  }}
                >
                  {tag}
                </Tag>
              );
            })}
          </Space>

          {/* ✅ AND / OR 切换开关 */}
          <Space>
            <span style={{ fontSize: 14 }}>Tag Filter Mode:</span>
            <Switch
              checked={tagFilterMode === 'AND'}
              onChange={(checked) => setTagFilterMode(checked ? 'AND' : 'OR')}
              checkedChildren="AND"
              unCheckedChildren="OR"
            />
          </Space>
        </div>




        <Tabs defaultActiveKey="all">
          <TabPane tab="All" key="all">
            <ProblemList
              //problems={currentProblems}
              problems={displayedProblems}
              onVote={handleVote}
              onUnvote={handleUnvote}
              votedIds={votedIds}
              currentUser={currentUser}
              onDelete={handleDelete}
            />
          </TabPane>
          <TabPane tab="Popular" key="popular">
            <ProblemList
              //problems={[...currentProblems].sort((a, b) => b.votes - a.votes)}
              problems={[...displayedProblems].sort((a, b) => b.votes - a.votes)}
              //problems={displayedProblems}
              onVote={handleVote}
              onUnvote={handleUnvote}
              votedIds={votedIds}
              currentUser={currentUser}
              onDelete={handleDelete}
            />
          </TabPane>
        </Tabs>

        <NewProblemModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
        />

        <Button type="dashed" onClick={() => setShowHistory(!showHistory)} style={{ marginTop: 24 }}>
          {showHistory ? 'Hide Past Rounds' : 'View Past Rounds'}
        </Button>
        {showHistory &&
          cycles.filter((c) => currentCycle && c.id !== currentCycle.id).map((cycle) => {
            const cycleProblems = Array.isArray(problems)
              ? problems.filter((p) => p.cycle?.id === cycle.id)
              : [];

            const winner = cycleProblems.length > 0
              ? [...cycleProblems].sort((a, b) => b.votes - a.votes)[0]
              : null;

            return (
              <div key={cycle.id} style={{ marginTop: 32 }}>
                <Title level={4}>{cycle.title}</Title>
                {winner ? (
                  <Card
                    title="🏆 Winning Proposal"
                    style={{ border: '1px solid #d3adf7' }}
                  >
                    <Title level={5}>{winner.title}</Title>
                    <Paragraph>{winner.description}</Paragraph>
                    <Paragraph><Tag color="purple">Votes: {winner.votes}</Tag></Paragraph>
                  </Card>
                ) : (
                  <Paragraph>No proposals submitted in this round.</Paragraph>
                )}
              </div>
            );
          })}
      </div>
    );
  }

  if (justEndedCycle) {
    const endedProblems = Array.isArray(problems)
      ? problems.filter((p) => p.cycle === justEndedCycle.id)
      : [];
    const winner = endedProblems.length > 0 ? [...endedProblems].sort((a, b) => b.votes - a.votes)[0] : null;

    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>{justEndedCycle.title} has ended</Title>
        {winner ? (
          <Card title="🏆 Winning Proposal" style={{ marginBottom: 24, border: '2px solid #d3adf7' }}>
            <Title level={5}>{winner.title}</Title>
            <Paragraph>{winner.description}</Paragraph>
            <Paragraph><Tag color="purple">Votes: {winner.votes}</Tag></Paragraph>
            <Button
              type="primary"
              href={currentUser ? `/model-studio?proposalId=${winner.id}` : undefined}
              disabled={!currentUser}
            >
              ➡ Proceed to Model Studio
            </Button>
            {!currentUser && <Paragraph type="secondary" style={{ marginTop: 8 }}>Please login to participate in model development.</Paragraph>}
          </Card>
        ) : (
          <Paragraph>No proposals were submitted in this round.</Paragraph>
        )}

        {nextCycle && (
          <Card style={{ background: '#e6f4ff', border: '1px solid #91d5ff' }}>
            <Paragraph>
              📢 Next round <b>{nextCycle.title}</b> will begin on <Tag color="blue">{dayjs(nextCycle.start_time).format('MMM D, YYYY')}</Tag>
            </Paragraph>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Problem Hub</Title>
      <Alert
        message="No active proposal round."
        description="Please check back later for the next round of proposals."
        type="info"
        showIcon
      />
    </div>
  );
}


export default ProblemHub;


/*import React, { useState, useEffect } from 'react';
import { Button, Tabs, List, Card, Tag, Space, Typography, Alert, message } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import NewProblemModal from '../components/NewProblemModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// ✅ Mock Cycles
const mockCycles = [
  {
    id: 4,
    title: 'Round 4 - August 2025',
    startTime: '2025-07-14T03:41:18Z', // 推迟开始
    endTime: '2025-08-31T23:59:59Z',
  },
  {
    id: 3,
    title: 'Round 3 - July 2025',
    startTime: '2025-07-01T00:00:00Z',
    endTime: '2025-07-13T23:59:59Z',
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
  const [justEndedCycle, setJustEndedCycle] = useState(null);
  const [nextCycle, setNextCycle] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const { user } = useAuth();
  const currentUser = user?.username;
  // ⏳ Detect current cycle based on current date
  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();

      // 当前轮次
      const current = mockCycles.find(
        (c) => now.isAfter(dayjs(c.startTime)) && now.isBefore(dayjs(c.endTime))
      );
      setCurrentCycle(current || null);

      // 最近结束的轮次（仅当当前为空时）
      const endedCycles = mockCycles
        .filter((c) => dayjs(c.endTime).isBefore(now))
        .sort((a, b) => dayjs(b.endTime).diff(dayjs(a.endTime)));
      const justEnded = !current && endedCycles.length > 0 ? endedCycles[0] : null;
      setJustEndedCycle(justEnded || null);

      // 下一轮次
      const futureCycles = mockCycles
        .filter((c) => dayjs(c.startTime).isAfter(now))
        .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
      const upcoming = futureCycles.length > 0 ? futureCycles[0] : null;
      setNextCycle(upcoming || null);

      // 倒计时
      if (current) {
        const end = dayjs(current.endTime);
        const diff = end.diff(now);
        if (diff <= 0) {
          setTimeLeft('⏳ Ending...');
        } else {
          const duration = dayjs.duration(diff);
          const d = Math.floor(duration.asDays());
          const h = duration.hours();
          const m = duration.minutes();
          const s = duration.seconds();
          setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }
      } else {
        setTimeLeft('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // 注意：依赖数组依然为空，但 setInterval 每秒检查状态



  const handleVote = (id) => {
    if (votedIds.has(id)) return;
    const updated = problems.map((p) =>
      p.id === id ? { ...p, votes: p.votes + 1 } : p
    );
    setProblems(updated);
    setVotedIds(new Set(votedIds).add(id));
  };

  const currentProblems = currentCycle
    ? problems.filter((p) => p.cycleId === currentCycle.id)
    : [];

  if (currentCycle) {
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
          <Button
            type="primary"
            disabled={!currentUser}
            onClick={() => currentUser && setModalVisible(true)}
          >
            New Problem
          </Button>
          {!currentUser && (
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              Please login to submit a new proposal.
            </Paragraph>
          )}

        </div>

       
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


        <Tabs defaultActiveKey="all">
          <TabPane tab="All" key="all">
            <ProblemList
              problems={currentProblems}
              onVote={handleVote}
              votedIds={votedIds}
              currentUser={currentUser}
            />
          </TabPane>
          <TabPane tab="Popular" key="popular">
            <ProblemList
              problems={[...currentProblems].sort((a, b) => b.votes - a.votes)}
              onVote={handleVote}
              votedIds={votedIds}
              currentUser={currentUser}
            />
          </TabPane>
        </Tabs>

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
                      currentUser={currentUser}
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

  // ✅ ② 当前轮次为空，上一轮刚结束：显示优胜提案
  if (justEndedCycle) {
    const endedProblems = problems.filter(p => p.cycleId === justEndedCycle.id);
    const winner = endedProblems.length > 0
      ? [...endedProblems].sort((a, b) => b.votes - a.votes)[0]
      : null;

    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>{justEndedCycle.title} has ended</Title>
        {winner ? (
          <Card
            title="🏆 Winning Proposal"
            style={{ marginBottom: 24, border: '2px solid #d3adf7' }}
          >
            <Title level={5}>{winner.title}</Title>
            <Paragraph>{winner.description}</Paragraph>
            <Paragraph>
              <Tag color="purple">Votes: {winner.votes}</Tag>
            </Paragraph>
            <Button
              type="primary"
              href={currentUser ? `/model-studio?proposalId=${winner.id}` : undefined}
              disabled={!currentUser}
            >
              ➡ Proceed to Model Studio
            </Button>
            {!currentUser && (
              <Paragraph type="secondary" style={{ marginTop: 8 }}>
                Please login to participate in model development.
              </Paragraph>
            )}

          </Card>
        ) : (
          <Paragraph>No proposals were submitted in this round.</Paragraph>
        )}

        {nextCycle && (
          <Card style={{ background: '#e6f4ff', border: '1px solid #91d5ff' }}>
            <Paragraph>
              📢 Next round <b>{nextCycle.title}</b> will begin on{' '}
              <Tag color="blue">{dayjs(nextCycle.startTime).format('MMM D, YYYY')}</Tag>
            </Paragraph>
          </Card>
        )}
      </div>
    );
  }

  // ✅ ③ 没有任何轮次活动（理论上不常见）
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Problem Hub</Title>
      <Alert
        message="No active proposal round."
        description="Please check back later for the next round of proposals."
        type="info"
        showIcon
      />
    </div>
  );


}

function ProblemList({ problems, onVote, votedIds, disableVoting = false, currentUser }) {

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
                    if (disableVoting || votedIds.has(item.id)) return;

                    if (!currentUser) {
                      message.info('Please login to vote.');
                      return;
                    }

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