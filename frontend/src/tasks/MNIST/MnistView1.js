

import React, { useEffect, useRef } from 'react';
import useMnistDuelGame from './useMnistDuelGame';

function MnistView({
  start,
  participants,
  testFileName,
  rounds,
  roomId,
  firstPlayer,
  battleMode,
  modelFiles,
  task_type, // 传递 task type
}) {
  const { results, loading, evaluate } = useMnistDuelGame({
    start,
    participants,
    testFileName,
    rounds,
    roomId,
    firstPlayer,
    battleMode,
    modelFiles,
    task_type, 
  });

  const evaluatedRef = useRef(false);  // ✅ 避免重复触发
console.log("Received task_type:", task_type);
  useEffect(() => {
    if (
      start &&
      participants?.length &&
      !evaluatedRef.current
    ) {
      console.log('[MNIST] Starting evaluation with:', {
        testFileName,
        participants,
        roomId,
      });

      evaluate({
        participants,
        testFileName: testFileName || '__default__',
        rounds,
        roomId,
        firstPlayer,
        battleMode,
        modelFiles,
        task_type, // 传递 task type
      });

      evaluatedRef.current = true;
    }
  }, [start]);

  return (
    <div>
      <h3>MNIST Duel Results</h3>
      {loading && <p>🔄 Evaluating...</p>}
      {!loading && results.length === 0 && <p>⚠️ No results available.</p>}
      {!loading && results.length > 0 && (
        <ul>
          {results.map((r, i) => (
            <li key={i}>
              {r.username}: {r.score ?? 'N/A'}
              {r.error && <span style={{ color: 'red' }}> ⚠️ {r.error}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MnistView;
