// src/pages/BattleCenterMock.jsx

import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Table,
  Tag,
  Checkbox,
  Upload,
  Button,
  Progress,
  Result,
  message,
  Spin,
} from "antd";
import {
  ClockCircleOutlined,
  UploadOutlined,
  TrophyTwoTone,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

/* ---------- Inject keyframes once ---------- */
const styleId = "battle-center-keyframes";
if (!document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `
    @keyframes flash {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
  `;
  document.head.appendChild(style);
}

/* ---------- Mock data ---------- */
const mockCycle = {
  index: 2,
  question: "How can we reduce urban waste efficiently?",
  endsAt: dayjs()
    .add(5, "day")
    .add(3, "hour")
    .add(2, "minute")
    .add(48, "second"),
};

const mockModels = [
  { id: 1, name: "AlexNet-V2", author: "Alex", ready: true },
  { id: 2, name: "Kenny MLP", author: "Kenny", ready: true },
  { id: 3, name: "Ema LightGBM", author: "Ema", ready: true },
];

const metricsOptions = ["Accuracy", "Recall", "F1"];

/* ---------- Component ---------- */
export default function BattleCenterMock() {
  const { width, height } = useWindowSize();

  const [selectedRows, setSelectedRows] = useState([]);
  const [datasetFile, setDatasetFile] = useState(null);
  const [metricChecks, setMetricChecks] = useState(["Accuracy"]);
  const [loadingBattle, setLoadingBattle] = useState(false);
  const [results, setResults] = useState(null);

  /* Table for model selection */
  const columns = [
    { title: "Model", dataIndex: "name", key: "name" },
    { title: "Author", dataIndex: "author", key: "author" },
    {
      title: "Status",
      dataIndex: "ready",
      key: "ready",
      render: (ready) =>
        ready ? (
          <Tag color="green">Uploaded</Tag>
        ) : (
          <Tag color="red">Missing</Tag>
        ),
    },
  ];

  /* Helpers */
  const metricColor = (v) => {
    if (v >= 0.9) return "green";
    if (v >= 0.8) return "orange";
    return "red";
  };

  const handleStartBattle = () => {
    if (selectedRows.length < 2) {
      message.warning("Select at least two models.");
      return;
    }
    if (!datasetFile) {
      message.warning("Please upload / select a test dataset.");
      return;
    }

    setLoadingBattle(true);
    setResults(null);

    // --- Simulate backend ---
    setTimeout(() => {
      const scores = selectedRows.map((row, idx) => ({
        rank: idx + 1,
        model: row.name,
        author: row.author,
        Accuracy: 0.98 - idx * 0.01,
        Recall: 0.9 - idx * 0.01,
        F1: 0.91 - idx * 0.012,
        total: 0.9 - idx * 0.01,
      }));
      setResults(scores);
      setLoadingBattle(false);
    }, 1500);
  };

  /* ---------- Render ---------- */
  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      {/* Header */}
      <Card style={{ background: "#fafafa" }}>
        <Space direction="vertical" size={4}>
          <h2 style={{ margin: 0 }}>
            Current Cycle: <b>{mockCycle.index}</b>
          </h2>
          <div>
            <b>Question:&nbsp;</b>
            {mockCycle.question}
          </div>
          <Statistic.Countdown
            title="Time left"
            value={mockCycle.endsAt}
            prefix={<ClockCircleOutlined />}
            format="D[d] HH[h] mm[m] ss[s]"
          />
        </Space>
      </Card>

      {/* Model & dataset panels */}
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card title="Models for Battle">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={mockModels}
              rowSelection={{
                selectedRowKeys: selectedRows.map((r) => r.id),
                onChange: (_, rows) => setSelectedRows(rows),
                getCheckboxProps: (rec) => ({ disabled: !rec.ready }),
              }}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Test Dataset">
            {datasetFile ? (
              <Tag
                closable
                onClose={() => setDatasetFile(null)}
                style={{ marginBottom: 8 }}
              >
                {datasetFile.name}
              </Tag>
            ) : (
              <Upload
                beforeUpload={(file) => {
                  setDatasetFile(file);
                  return false;
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Select Dataset File</Button>
              </Upload>
            )}

            <div style={{ marginTop: 12 }}>
              <b>Metrics:&nbsp;</b>
              <Checkbox.Group
                options={metricsOptions}
                value={metricChecks}
                onChange={setMetricChecks}
                style={{ display: "block", marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Start button */}
      <Button
        type="primary"
        size="large"
        icon={<TrophyTwoTone twoToneColor="#faad14" />}
        loading={loadingBattle}
        onClick={handleStartBattle}
      >
        Start Battle
      </Button>

      {/* Spinner */}
      {loadingBattle && <Spin tip="Battling..." size="large" />}

      {/* Results */}
      {results && !loadingBattle && (
        <>
          {/* Confetti once */}
          <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />

          <Card title="Winning Models">
            <Table
              pagination={false}
              rowKey="rank"
              dataSource={results}
              size="small"
              columns={[
                { title: "Rank", dataIndex: "rank", width: 60 },
                { title: "Model", dataIndex: "model" },
                { title: "Author", dataIndex: "author" },
                ...metricsOptions.map((m) => ({
                  title: m,
                  dataIndex: m,
                  render: (v) => (
                    <Progress
                      percent={Math.round(v * 100)}
                      size="small"
                      strokeColor={metricColor(v)}
                      showInfo={false}
                    />
                  ),
                })),
                {
                  title: "Total",
                  dataIndex: "total",
                  render: (v) => (
                    <b style={{ color: metricColor(v) }}>{v.toFixed(2)}</b>
                  ),
                },
              ]}
              scroll={{ x: true }}
            />
          </Card>

          <Result
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
            title={
              <span style={{ fontSize: 22 }}>
                Winner of Cycle {mockCycle.index}:&nbsp;
                <b>{results[0].author}</b>&nbsp;
                <Tag color="gold">{results[0].model}</Tag>
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
                🎉&nbsp;Congratulations to the champion!&nbsp;🎉
              </span>
            }
          />
        </>
      )}
    </Space>
  );
}
