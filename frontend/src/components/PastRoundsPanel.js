// src/components/problemhub/PastRoundsPanel.js

import React from 'react';
import { Card, Typography, Tag } from 'antd';

const { Title, Paragraph } = Typography;

function PastRoundsPanel({ showHistory, currentCycle, cycles, problems }) {
  if (!showHistory || !currentCycle) return null;

  const now = new Date();

  const endedCycles = cycles.filter(
    (c) => new Date(c.end_time) < now && c.id !== currentCycle.id
  );

  return (
    <>
      {endedCycles.map((cycle) => {
        const cycleProblems = Array.isArray(problems)
          ? problems.filter((p) =>
              (typeof p.cycle === 'object' ? p.cycle.id : p.cycle) === cycle.id
            )
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
    </>
  );
}

export default PastRoundsPanel;
