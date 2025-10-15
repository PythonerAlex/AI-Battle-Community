import React, { useState, useEffect } from "react";
import { Card, Input, Button, List, message, Table, Tag } from "antd";
import { API_BASE_URL } from '../config/wsConfig';
const { TextArea } = Input;

function BattleCenterGPT() {
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch current problem
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/battle/current-problem/`)
      .then((res) => res.json())
      .then(setProblem)
      .catch(() => message.error("Failed to load problem"));
  }, []);

  const addSolution = () => {
    if (!input.trim()) return;
    setSolutions([...solutions, input.trim()]);
    setInput("");
  };

  const startBattle = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/battle/battle/`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solutions }),
      });

      if (!res.ok) throw new Error("Battle failed");

      let data = await res.json();

      // Ensure always an array
      const resultsArray = Array.isArray(data) ? data : [data];

      setResults(resultsArray);
      message.success("Battle completed!");
    } catch (err) {
      console.error(err);
      message.error("Battle failed");
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic columns based on keys in the first result
  const columns = React.useMemo(() => {
    if (results.length === 0) return [];

    // Get keys from first item
    const keys = Object.keys(results[0]);

    // Ensure "solution" column is first, and total_score last if exists
    const orderedKeys = [
      ...keys.filter((k) => k === "solution"),
      ...keys.filter((k) => k !== "solution" && k !== "total_score"),
      ...keys.filter((k) => k === "total_score"),
    ];

    const dynamicCols = [
      {
        title: "Rank",
        render: (_, __, idx) => idx + 1,
        width: 60,
      },
      ...orderedKeys.map((key, idx) => {
        if (key === "solution") {
          return {
            title: "Solution",
            dataIndex: key,
            render: (text, record, idx) =>
              idx === 0 ? (
                <span>
                  <Tag color="gold">🏆 Champion</Tag> {text}
                </span>
              ) : (
                text
              ),
          };
        } else {
          return {
            title: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            dataIndex: key,
            render: (val) => <span>{val}</span>,
          };
        }
      }),
    ];

    return dynamicCols;
  }, [results]);

  return (
    <Card title={problem ? problem.title : "Loading problem..."}>
      <p>{problem?.description}</p>

      <TextArea
        rows={3}
        placeholder="Enter your solution..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button
        type="primary"
        onClick={addSolution}
        style={{ marginTop: 10 }}
        disabled={!input.trim()}
      >
        Submit Solution
      </Button>

      <List
        header="Submitted Solutions"
        dataSource={solutions}
        renderItem={(item, idx) => <List.Item>{`${idx + 1}. ${item}`}</List.Item>}
        style={{ marginTop: 20 }}
      />

      {solutions.length >= 2 && (
        <Button
          type="primary"
          onClick={startBattle}
          style={{ marginTop: 20 }}
          loading={loading}
        >
          Start Battle
        </Button>
      )}

      {results.length > 0 && (
        <Card title="Battle Results" style={{ marginTop: 20 }}>
          <Table
            dataSource={results}
            columns={columns}
            rowKey={(record, idx) => idx}
            pagination={false}
            scroll={{ x: true }}
          />
        </Card>
      )}
    </Card>
  );
}

export default BattleCenterGPT;

/*import React, { useState, useEffect } from "react";
import { Card, Input, Button, List, message, Table, Tag } from "antd";
import { API_BASE_URL } from '../config/wsConfig';
const { TextArea } = Input;

function BattleCenterGPT() {
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch the current problem from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/battle/current-problem/`)
      .then((res) => res.json())
      .then(setProblem)
      .catch(() => message.error("Failed to load problem"));
  }, []);

  const addSolution = () => {
    if (!input.trim()) return;
    setSolutions([...solutions, input.trim()]);
    setInput("");
  };

  const startBattle = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/battle/battle/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solutions }),
      });

      if (!res.ok) throw new Error("Battle failed");

      const data = await res.json();
      setResults(data);
      message.success("Battle completed!");
    } catch (err) {
      console.error(err);
      message.error("Battle failed");
    } finally {
      setLoading(false);
    }
  };

  // Table columns for results
  const columns = [
    {
      title: "Rank",
      render: (_, __, idx) => idx + 1,
      width: 60,
    },
    {
      title: "Solution",
      dataIndex: "solution",
      render: (text, record, idx) =>
        idx === 0 ? (
          <span>
            <Tag color="gold">🏆 Champion</Tag> {text}
          </span>
        ) : (
          text
        ),
    },
    { title: "Feasibility", dataIndex: "feasibility" },
    { title: "Impact", dataIndex: "impact" },
    { title: "Innovation", dataIndex: "innovation" },
    {
      title: "Total Score",
      dataIndex: "total_score",
      render: (score) => <b>{score}</b>,
    },
  ];

  return (
    <Card title={problem ? problem.title : "Loading problem..."}>
      <p>{problem?.description}</p>

      <TextArea
        rows={3}
        placeholder="Enter your solution..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button
        type="primary"
        onClick={addSolution}
        style={{ marginTop: 10 }}
        disabled={!input.trim()}
      >
        Submit Solution
      </Button>

      <List
        header="Submitted Solutions"
        dataSource={solutions}
        renderItem={(item, idx) => <List.Item>{`${idx + 1}. ${item}`}</List.Item>}
        style={{ marginTop: 20 }}
      />

      {solutions.length >= 2 && (
        <Button
          type="primary"
          onClick={startBattle}
          style={{ marginTop: 20 }}
          loading={loading}
        >
          Start Battle
        </Button>
      )}

      {results.length > 0 && (
        <Card title="Battle Results" style={{ marginTop: 20 }}>
          <Table
            dataSource={results}
            columns={columns}
            rowKey={(record, idx) => idx}
            pagination={false}
          />
        </Card>
      )}
    </Card>
  );
}

export default BattleCenterGPT;
*/