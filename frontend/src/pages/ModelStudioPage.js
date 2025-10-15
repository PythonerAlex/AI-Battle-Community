// src/pages/ModelStudioPage.js

import React, { useEffect, useState } from 'react';
import { Tabs, Typography, Card, Space } from 'antd';
import ModelStudio from '../components/ModelStudio/ModelStudio';
//import ModelGallery from '../components/ModelStudio/ModelGallery';
import ModelGallery from '../components/ModelGallery/ModelGallery';
import DatasetHub from '../components/ModelStudio/DatasetHub';
import TestSetSelector from '../components/ModelStudio/TestSetSelector';
import InsightsFeed from '../components/ModelStudio/InsightsFeed';
import useCycleIndex from '../hooks/useCycleIndex';
import usePreviousWinner from '../hooks/usePreviousWinner';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ModelStudioPage = () => {
  const {
    cycleIndex,
    status,
    nextCycleStartTime,
    isLoading: isContextLoading,
  } = useCycleIndex();

  const {
    prevCycle,
    prevProblem,
    votes,
    isLoading: isWinnerLoading,
  } = usePreviousWinner(cycleIndex);

  const [countdown, setCountdown] = useState(null);

  // 倒计时逻辑
  useEffect(() => {
    if (!nextCycleStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(nextCycleStartTime);
      const diff = Math.max(0, end - now);

      const totalSeconds = Math.floor(diff / 1000);
      const days = String(Math.floor(totalSeconds / 86400));
      const hours = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');

      setCountdown(`${days}D:${hours}H:${minutes}M:${seconds}S.`);


      if (diff <= 0) {
        window.location.reload(); // 周期切换自动刷新
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextCycleStartTime]);

  const loading = isContextLoading || isWinnerLoading;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🧠 Model Studio</Title>
      {loading ? (
        <Text>Loading cycle information...</Text>
      ) : (
        <Card style={{ marginBottom: 24 }} bordered>
          <Space direction="vertical">
            <Text>
              <strong>Current Cycle：</strong> {prevCycle?.title || 'None'}
            </Text>
            <Text>
              <strong>Question call for models（Prev.cycle winner）：</strong>{' '}
              {prevProblem?.title || 'Not available'}
              {votes !== null && ` (${votes} votes)`}
            </Text>
            <Text>
              <strong>Count Down：</strong>{' '}
              {countdown ? (
                <Text type="danger">{countdown}</Text>
              ) : (
                <Text type="secondary">Waiting...</Text>
              )}
            </Text>
          </Space>
        </Card>
      )}

      <Tabs defaultActiveKey="studio" type="card" size="large">
        <TabPane tab="🎛 My models" key="studio">
          {!isWinnerLoading && prevProblem ? (
            <ModelStudio prevProblem={prevProblem} />
          ) : (
            <Typography.Text type="secondary">Loading previous round problem...</Typography.Text>
          )}
        </TabPane>

        {/*<TabPane tab="🌍 Models Display" key="gallery">
          <ModelGallery />
        </TabPane>*/}
        <TabPane tab="🌍 Models Display" key="gallery">
          {!isWinnerLoading && prevProblem ? (
            <ModelGallery problemId={prevProblem.id} />
          ) : (
            <Typography.Text type="secondary">Loading previous round problem...</Typography.Text>
          )}
        </TabPane>
        {/*<TabPane tab="📂 Dataset display" key="datasets">
          <DatasetHub />
        </TabPane>*/}
        <TabPane tab="🗳 Vote Testset" key="testsets">
          <TestSetSelector />
        </TabPane>
        <TabPane tab="🧠 Experience Sharing" key="insights">
          <InsightsFeed />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ModelStudioPage;

/*import React, { useEffect, useState } from 'react';
import { Tabs, Typography, Card, Space } from 'antd';
import ModelStudio from '../components/ModelStudio/ModelStudio';
import ModelGallery from '../components/ModelStudio/ModelGallery';
import DatasetHub from '../components/ModelStudio/DatasetHub';
import TestSetSelector from '../components/ModelStudio/TestSetSelector';
import InsightsFeed from '../components/ModelStudio/InsightsFeed';
import useCycleIndex from '../hooks/useCycleIndex';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ModelStudioPage = () => {
  const {
    cycleIndex,
    status,
    cycle,
    problem,
    nextCycleStartTime,
    isLoading,
  } = useCycleIndex();

  const [countdown, setCountdown] = useState(null);

  // 处理 model studio 实际对应的 cycle（上一周期）
  const effectiveIndex = cycleIndex !== null ? cycleIndex - 1 : null;
  const effectiveCycle = effectiveIndex >= 0 ? cycle : null;
  const effectiveProblem = effectiveCycle ? problem : null;

  // 更新时间倒计时
  useEffect(() => {
    if (!nextCycleStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(nextCycleStartTime);
      const diff = Math.max(0, end - now);

      const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

      setCountdown(`${hours}:${minutes}:${seconds}`);

      if (diff <= 0) {
        window.location.reload(); // 周期切换自动刷新
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextCycleStartTime]);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🧠 Model Studio</Title>
      {isLoading ? (
        <Text>Loading cycle information...</Text>
      ) : (
        <Card style={{ marginBottom: 24 }} bordered>
          <Space direction="vertical">
            <Text>
              <strong>当前周期：</strong> {cycle?.title || '无'}
            </Text>
            <Text>
              <strong>处理的问题（上一周期优胜提案）：</strong>{' '}
              {effectiveProblem?.title || '暂无'}
            </Text>
            <Text>
              <strong>倒计时：</strong>{' '}
              {countdown ? (
                <Text type="danger">{countdown}</Text>
              ) : (
                <Text type="secondary">等待中</Text>
              )}
            </Text>
          </Space>
        </Card>
      )}

      <Tabs defaultActiveKey="studio" type="card" size="large">
        <TabPane tab="🎛 我的模型" key="studio">
          <ModelStudio />
        </TabPane>

        <TabPane tab="🌍 模型展示" key="gallery">
          <ModelGallery />
        </TabPane>

        <TabPane tab="📂 数据集中心" key="datasets">
          <DatasetHub />
        </TabPane>

        <TabPane tab="🗳 测试集投票" key="testsets">
          <TestSetSelector />
        </TabPane>

        <TabPane tab="🧠 经验分享" key="insights">
          <InsightsFeed />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ModelStudioPage;*/

// src/pages/ModelStudioPage.js
/*import React from 'react';
import { Tabs, Typography } from 'antd';
import ModelStudio from '../components/ModelStudio/ModelStudio';
import ModelGallery from '../components/ModelStudio/ModelGallery';
import DatasetHub from '../components/ModelStudio/DatasetHub';
import TestSetSelector from '../components/ModelStudio/TestSetSelector';
import InsightsFeed from '../components/ModelStudio/InsightsFeed';

const { Title } = Typography;
const { TabPane } = Tabs;

const ModelStudioPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🧠 Model Studio</Title>
      <p style={{ marginBottom: 24 }}>
        A collaborative space to manage models, datasets, evaluation criteria, and insights — all under one problem.
      </p>

      <Tabs defaultActiveKey="studio" type="card" size="large">
        <TabPane tab="🎛 我的模型" key="studio">
          <ModelStudio />
        </TabPane>

        <TabPane tab="🌍 模型展示" key="gallery">
          <ModelGallery />
        </TabPane>

        <TabPane tab="📂 数据集中心" key="datasets">
          <DatasetHub />
        </TabPane>

        <TabPane tab="🗳 测试集投票" key="testsets">
          <TestSetSelector />
        </TabPane>

        <TabPane tab="🧠 经验分享" key="insights">
          <InsightsFeed />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ModelStudioPage;
*/
