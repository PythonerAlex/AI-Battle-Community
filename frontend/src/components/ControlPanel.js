import React, { useState } from 'react';

import {
  Card,
  Form,
  Select,
  InputNumber,
  Switch,
  Upload,
  Input,
  Button,
  Checkbox,
  Row,
  Col,
  Divider,
  message,
  Tooltip,
  Collapse,
} from 'antd';
import { UploadOutlined, PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { taskDescriptions } from '../registry/taskDescriptions';
import StyledCard from './StyledCard';
import Title from 'antd/es/skeleton/Title';

const { Panel } = Collapse;

function ControlPanel({
  room,
  currentUser,
  updateRoomSetting,
  uploadTestFile,
  setRoom,
  startBattle,
  kickUser,
}) {
  const [kickTargets, setKickTargets] = useState([]);

  const handleStart = () => {
    const notReady = room.users.some(
      (u) =>
        room.participants.includes(u.username) &&
        (!u.isReady || u.status !== 'Uploaded')
    );

    if (notReady) {
      message.warning("Some participants aren't ready or haven't uploaded a model.");
      return;
    }

    setRoom((prev) => ({ ...prev, started: false }));
    setTimeout(() => {
      setRoom((prev) => ({ ...prev, started: true }));
      startBattle();
    }, 50);
  };

  const handleTestUpload = async (file) => {
    try {
      await uploadTestFile(file, room.id);
      setRoom((prev) => ({ ...prev, testFile: file }));
      message.success(`Uploaded test set: ${file.name}`);
    } catch (err) {
      message.error("Failed to upload test file");
    }
    return false;
  };

  return (

    <StyledCard title="🔧 Battle Control Panel">
      {/* 折叠面板 */}
      <Collapse defaultActiveKey={['settings']} bordered={false}>
        <Panel header="🛠 Battle Settings" key="settings">
          <Form layout="vertical">
            {/* 🎮 Task Settings Grid */}
            <Row gutter={12}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={
                    <span>
                      🎮 Task Type&nbsp;
                      <Tooltip title={taskDescriptions[room.type]}>
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </span>
                  }
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    value={room.type}
                    onChange={(value) => updateRoomSetting({ type: value })}
                  >
                    <Select.Option value="ConnectX">ConnectX</Select.Option>
                    <Select.Option value="MNIST">MNIST Duel</Select.Option>
                    <Select.Option value="CIFAR">CIFAR Classify</Select.Option>
                    <Select.Option value="SAT">SAT Duel</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Mode" style={{ marginBottom: 12 }}>
                  <Select
                    value={room.mode}
                    onChange={(value) => updateRoomSetting({ mode: value })}
                  >
                    <Select.Option value="model-vs-model">Model vs Model</Select.Option>
                    <Select.Option value="human-vs-model">Human vs Model</Select.Option>
                    <Select.Option value="human-vs-human">Human vs Human</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <Form.Item label="Rounds" style={{ marginBottom: 12 }}>
                  <InputNumber
                    min={1}
                    max={10}
                    value={room.rounds}
                    onChange={(value) => updateRoomSetting({ rounds: value })}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item label="First Player" style={{ marginBottom: 12 }}>
                  <Select
                    value={room.firstPlayer}
                    onChange={(value) => updateRoomSetting({ firstPlayer: value })}
                  >
                    {room.users.map((u) => (
                      <Select.Option key={u.username} value={u.username}>
                        {u.username}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* 🔒 Lock + Password */}
            <Row gutter={12}>
              <Col xs={12} sm={6}>
                <Form.Item label="Room Lock" style={{ marginBottom: 8 }}>
                  <Switch
                    checked={room.locked}
                    onChange={(checked) => updateRoomSetting({ locked: checked })}
                    checkedChildren="Locked"
                    unCheckedChildren="Open"
                  />
                </Form.Item>
              </Col>

              <Col xs={12} sm={6}>
                <Form.Item label="Room Password" style={{ marginBottom: 8 }}>
                  <Input
                    value={room.password}
                    onChange={(e) => updateRoomSetting({ password: e.target.value })}
                    placeholder="Optional"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />

            {/* 👥 Participants */}
            <Form.Item label="👥 Participants (Select Users)" style={{ marginBottom: 8 }}>
              <Checkbox.Group
                value={room.participants}
                onChange={(value) => updateRoomSetting({ participants: value })}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {room.users.map((u) => (
                    <Checkbox key={u.username} value={u.username}>
                      {u.username}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>

            <Divider style={{ margin: '12px 0' }} />

            {/* 📁 Upload Test Set */}
            <Form.Item label="📁 Upload Test Set (.npz)" style={{ marginBottom: 8 }}>
              <Upload
                accept=".npz"
                beforeUpload={handleTestUpload}
                onRemove={() => {
                  setRoom((prev) => ({ ...prev, testFile: null }));
                  message.info("Removed test file");
                }}
                fileList={room.testFile ? [room.testFile] : []}
              >
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>

            <Divider style={{ margin: '12px 0' }} />

            {/* ❌ Kick Users */}
            <Form.Item label="❌ Kick Users" style={{ marginBottom: 8 }}>
              <Checkbox.Group value={kickTargets} onChange={setKickTargets}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {room.users
                    .filter((u) => u.username !== currentUser)
                    .map((u) => (
                      <Checkbox key={u.username} value={u.username}>
                        {u.username}
                      </Checkbox>
                    ))}
                </div>
              </Checkbox.Group>

              <Button
                danger
                type="primary"
                disabled={kickTargets.length === 0}
                style={{ marginTop: 8 }}
                onClick={() => {
                  kickTargets.forEach((name) => kickUser(name));
                  setKickTargets([]);
                  message.success("Selected users kicked.");
                }}
              >
                Kick Selected
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>

      {/* Start Battle 按钮永远可见 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={handleStart}
        >
          Start Battle
        </Button>
      </div>
    </StyledCard>
  );
}

export default ControlPanel;
