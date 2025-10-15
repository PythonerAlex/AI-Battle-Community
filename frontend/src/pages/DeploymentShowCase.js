// src/pages/DeploymentShowCase.jsx
import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Card,
  Statistic,
  Space,
  Button,
  List,
  Tag,
  message,
  Result,
  Table,
  Spin,
} from "antd";
import {
  LikeOutlined,
  TrophyTwoTone,
  CheckCircleTwoTone,
  ClockCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

/* ----- keyframes 注入一次 ----- */
const styleId = "deployment-flash-kf";
if (!document.getElementById(styleId)) {
  const s = document.createElement("style");
  s.id = styleId;
  s.innerHTML = `@keyframes flash{0%,100%{opacity:1;}50%{opacity:.3}}`;
  document.head.appendChild(s);
}

/* ----- Header Mock ----- */
const headerData = {
  cycle: 1,
  modelName: "AlexNet-V2",
  endsAt: dayjs()
    .add(8, "day")
    .add(12, "hour")
    .add(35, "minute")
    .add(41, "second"),
};

/* ----- Applications Mock ----- */
const mockApps = [
  {
    id: 101,
    title: "Smart Bin Optimizer",
    desc:
      "An end-to-end pipeline that ingests real-time IoT fill-level data from city garbage bins, " +
      "predicts overflow times with an LSTM network, and dynamically dispatches collection trucks, " +
      "cutting fuel consumption by 23 % in pilot districts.",
    author: "Alex",
    file: "smart_bin_optimizer.zip",
    votes: 12,
  },
  {
    id: 102,
    title: "Realtime Recycling Sorter",
    desc:
      "A vision model deployed on conveyor belts in a sorting facility. It classifies glass, metal, " +
      "plastic, and paper at 60 FPS with a YOLO-v8 backbone and actuates air jets to separate streams, " +
      "improving purity of recyclables by 15 %.",
    author: "Kenny",
    file: "recycling_sorter_model.pt",
    votes: 8,
  },
  {
    id: 103,
    title: "Urban-Waste Heatmap Dashboard",
    desc:
      "A web dashboard that aggregates GPS tracking, citizen reporting, and historical pickup logs to " +
      "generate an hourly waste-generation heatmap. Policy makers can simulate ‘what-if’ scenarios and " +
      "optimize bin placement.",
    author: "Ema",
    file: "waste_heatmap_dashboard.tar.gz",
    votes: 5,
  },
];

export default function DeploymentShowCase() {
  const { width, height } = useWindowSize();
  const [apps, setApps] = useState(mockApps);
  const [champion, setChampion] = useState(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [loadingRank, setLoadingRank] = useState(false);

  /* ----- 投票逻辑 ----- */
  const votedIds = JSON.parse(localStorage.getItem("votedAppIds") || "[]") ?? [];
  const handleVote = (id) => {
    if (votedIds.includes(id)) {
      message.info("You already voted.");
      return;
    }
    const newApps = apps.map((a) =>
      a.id === id ? { ...a, votes: a.votes + 1 } : a
    );
    localStorage.setItem("votedAppIds", JSON.stringify([...votedIds, id]));
    setApps(newApps);
    message.success("Vote counted!");
  };

  /* ----- 排名计算（含 2 s Spin） ----- */
  const handleShowRank = () => {
    setLoadingRank(true);
    setChampion(null); // 隐藏旧冠军
    setTimeout(() => {
      const sorted = [...apps].sort((a, b) => b.votes - a.votes);
      setApps(sorted);
      setChampion(sorted[0]);
      setConfettiKey((k) => k + 1);
      setLoadingRank(false);
    }, 2000);
  };

  /* ----- 排名表列 ----- */
  const rankCols = [
    { title: "Rank", render: (_, __, idx) => idx + 1, width: 80 },
    { title: "Application", dataIndex: "title" },
    { title: "Author", dataIndex: "author", width: 120 },
    { title: "Votes", dataIndex: "votes", width: 100 },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      {/* Header */}
      <Card style={{ background: "#fafafa" }}>
        <Space direction="vertical" size={4}>
          <h2 style={{ margin: 0 }}>
            Current Cycle: <b>{headerData.cycle}</b>
          </h2>
          <div>
            <b>Deployed Model for Applications:&nbsp;</b>
            {headerData.modelName}
          </div>
          <Statistic.Countdown
            prefix={<ClockCircleOutlined />}
            title="Countdown"
            value={headerData.endsAt}
            format="D[d] HH[h] mm[m] ss[s]"
          />
        </Space>
      </Card>

      {/* Application list */}
      <Card title="Applications Using the Winning Model">
        <List
          itemLayout="vertical"
          dataSource={apps}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  icon={<LikeOutlined />}
                  type="link"
                  onClick={() => handleVote(item.id)}
                  disabled={votedIds.includes(item.id)}
                >
                  Vote&nbsp;({item.votes})
                </Button>,
                <a href="#" download={item.file}>
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    style={{ paddingLeft: 0 }}
                  >
                    {item.file}
                  </Button>
                </a>,
              ]}
            >
              <List.Item.Meta
                title={
                  <>
                    {item.title}&nbsp;
                    <Tag color="blue">{item.author}</Tag>
                  </>
                }
                description={item.desc}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Show ranking button */}
      <Card>
        <Button
          type="primary"
          size="large"
          icon={<TrophyTwoTone twoToneColor="#faad14" />}
          onClick={handleShowRank}
          disabled={loadingRank}
        >
          Show Ranking
        </Button>
      </Card>

      {/* Spinner during calculation */}
      {loadingRank && <Spin tip="Calculating ranking..." size="large" />}

      {/* Ranking & Champion */}
      {champion && !loadingRank && (
        <>
          <Confetti
            key={confettiKey}
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            style={{ pointerEvents: "none" }}
          />

          <Card title="Vote Ranking">
            <Table
              rowKey="id"
              columns={rankCols}
              dataSource={apps}
              pagination={false}
              size="small"
            />
          </Card>

          <Result
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
            title={
              <span style={{ fontSize: 24 }}>
                Vote Champion:&nbsp;
                <Tag color="gold" style={{ fontSize: 18 }}>
                  {champion.title}
                </Tag>
                &nbsp;— {champion.author}
              </span>
            }
            subTitle={
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  animation: "flash 1s infinite",
                }}
              >
                🎉 Congratulations to the champion! 🎉
              </span>
            }
          />
        </>
      )}
    </Space>
  );
}
