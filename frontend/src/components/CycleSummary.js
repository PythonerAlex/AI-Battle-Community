    import React from 'react';
import { Card, Typography, Tag, Button, Space, List } from 'antd';
import dayjs from 'dayjs';

const { Title,Paragraph } = Typography;

function CycleSummary({ cycle, problems, nextCycle, currentUser }) {
  //const endedProblems = problems.filter((p) => p.cycle === cycle.id);
  const endedProblems = problems.filter((p) => {
  const cycleId = typeof p.cycle === 'object' ? p.cycle.id : p.cycle;
  return cycleId === cycle.id;
});
  const sorted = [...endedProblems].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0];
  const top3 = sorted.slice(0, 3);
  const totalVotes = endedProblems.reduce((acc, p) => acc + p.votes, 0);

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>{cycle.title} has ended</Title>

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

      <Card title="📊 Summary" style={{ marginBottom: 24 }}>
        <Paragraph>Total Proposals: <Tag>{endedProblems.length}</Tag></Paragraph>
        <Paragraph>Total Votes Cast: <Tag color="blue">{totalVotes}</Tag></Paragraph>

        <Title level={5} style={{ marginTop: 16 }}>Top 3 Proposals</Title>
        <List
          dataSource={top3}
          renderItem={(item, index) => (
            <List.Item>
              <Space>
                <Tag color="geekblue">#{index + 1}</Tag>
                <b>{item.title}</b> — <Tag color="purple">{item.votes} votes</Tag>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {nextCycle && (
        <Card style={{ background: '#e6f4ff', border: '1px solid #91d5ff' }}>
          <Paragraph>
            📢 Next round <b>{nextCycle.title}</b> will begin on{' '}
            <Tag color="blue">{dayjs(nextCycle.start_time).format('MMM D, YYYY')}</Tag>
          </Paragraph>
        </Card>
      )}
    </div>
  );
}

export default CycleSummary;
