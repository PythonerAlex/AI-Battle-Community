import React from 'react';
import { Card } from 'antd';
import { taskRegistry } from '../registry/taskRegistry';
import StyledCard from '../components/StyledCard';

function BattleDisplay({
  type,
  start,
  firstPlayer,
  battleMode,
  participants,
  rounds,
  testFileName,
  roomId,
  modelFiles,
}) {
  const task = taskRegistry[type];
  if (!task) return <div>Unknown task type: {type}</div>;

  const TaskView = task.View;

  return (
    <StyledCard
      title="🎮 Battle Visualization"
    >
      <TaskView
        start={start}
        firstPlayer={firstPlayer}
        battleMode={battleMode}
        participants={participants}
        rounds={rounds}
        testFileName={testFileName}
        roomId={roomId}
        modelFiles={modelFiles}
        task_type={type}
      />
    </StyledCard>
  );
}

export default BattleDisplay;

{/*import React from 'react';
import { taskRegistry } from '../registry/taskRegistry';

function BattleDisplay({ type, start, firstPlayer, battleMode, participants, rounds, testFileName,roomId,modelFiles }) {
  const task = taskRegistry[type];
  console.log('BattleDisplay task:', task);
  if (!task) return <div>Unknown task type: {type}</div>;

  const TaskView = task.View;
  return (
    <TaskView
      start={start}
      //start={true}
      firstPlayer={firstPlayer}
      battleMode={battleMode}
      participants={participants}
      rounds={rounds}
      testFileName={testFileName}
      roomId={roomId}  // ✅ 加上这个
      modelFiles={modelFiles} // ✅ 传下去
      task_type={type} // ✅ 修正为字符串类型名
    />
  );
}

export default BattleDisplay; // ✅ 确保这行存在

*/}