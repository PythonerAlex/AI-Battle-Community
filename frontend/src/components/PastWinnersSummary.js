import React, { useEffect, useState } from 'react';
import { Card, Typography, Empty, Spin } from 'antd';
import useProblemHub from '../hooks/useProblemHub';

const { Title, Text } = Typography;

function PastWinnersSummary({ cycles, nextCycle }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getWinnerByIndex } = useProblemHub();

  useEffect(() => {
    const fetchWinners = async () => {
      setLoading(true);
      const results = [];

      for (let i = 0; i < cycles.length; i++) {
        const cycle = cycles[i];

        // Skip upcoming cycle
        if (cycle.id === nextCycle?.id) continue;

        try {
          const res = await getWinnerByIndex(i);
          if (res && res.problem) {
            results.push({
              cycle,
              index: i,
              problem: res.problem,
              votes: res.votes,
            });
          }
        } catch (err) {
          console.warn(`No winner for cycle ${i}`);
        }
      }

      // ✅ Sort by cycle index ascending
      results.sort((a, b) => a.index - b.index);

      setWinners(results);
      setLoading(false);
    };

    fetchWinners();
  }, [cycles, nextCycle]);

  if (loading) {
    return <Spin tip="Loading past winners..." />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Past Rounds Summary</Title>
      {winners.length === 0 ? (
        <Empty description="No past winning proposals." />
      ) : (
        winners.map(({ cycle, index, problem, votes }) => (
          <Card
            key={cycle.id}
            title={`🏁 Cycle ${index + 1}`}
            style={{ marginBottom: 16 }}
          >
            <Text strong>Winning Proposal:</Text>
            <div style={{ marginTop: 8 }}>
              <Text>{problem.title}</Text>
              <div>
                <Text type="secondary">by {problem.author}</Text>
              </div>
              <div>
                <Text type="secondary">Votes: {votes}</Text>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default PastWinnersSummary;
