import React from 'react';
import useMnistDuelGame from './useMnistDuelGame';
import { Button } from 'antd';

function TestMnistDuel() {
  const handleClick = async () => {
    await useMnistDuelGame();  // 发送请求
  };

  return (
    <div>
      <Button type="primary" onClick={handleClick}>Start Test Battle</Button>
    </div>
  );
}

export default TestMnistDuel;
