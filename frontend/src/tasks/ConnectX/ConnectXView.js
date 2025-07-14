import React from 'react';
import ConnectXBoard from './ConnectXBoard';
import { Button } from 'antd';
import { useConnectXGame } from './useConnectXGame';

// 模拟对弈数据
const mockMoves = [
  { player: 'A', col: 3 },
  { player: 'B', col: 2 },
  { player: 'A', col: 3 },
  { player: 'B', col: 4 },
  { player: 'A', col: 3 },
  { player: 'B', col: 1 },
  { player: 'A', col: 3 }, // A wins
];

function ConnectXView({ start, firstPlayer, battleMode }) {
  console.log('ConnectXView props:', { start, firstPlayer, battleMode });

  const {
    board,
    winner,
    winningCells,
    moveIndex,
    isReplaying,
    setIsReplaying,
    reset,
  } = useConnectXGame({ start, mockMoves });

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>ConnectX</h2>
      <ConnectXBoard board={board} winningCells={winningCells} />

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <p><strong>Battle Mode:</strong> {battleMode}</p>
        <p><strong>First Player:</strong> {firstPlayer}</p>
      </div>

      {winner && (
        <h3 style={{ textAlign: 'center', color: winner === 'Draw' ? '#faad14' : '#52c41a' }}>
          {winner === 'Draw' ? 'Draw!' : `Winner: Player ${winner}`}
        </h3>
      )}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        {winner || moveIndex >= mockMoves.length ? (
          <Button onClick={reset}>🔁 Replay</Button>
        ) : (
          <Button onClick={() => setIsReplaying(prev => !prev)}>
            {isReplaying ? '⏸️ Pause' : '▶️ Play'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ConnectXView;
