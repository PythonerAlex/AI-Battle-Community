import React from 'react';
import { Card, Row, Col, Tag, Typography, Tooltip } from 'antd';
import { LockOutlined, UnlockOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import StyledCard from '../components/StyledCard';
const { Text } = Typography;

function RoomInfoHeader({ room }) {
  const host = room.users.find(u => u.username === room.host);

  return (

    <StyledCard title= "🏠 Room Info" >
      <Row gutter={[16, 8]} align="middle" justify="space-between">
        {/* Host */}
        <Col xs={24} sm={12} md={6}>
          <Text strong>🧑‍💼 Host:</Text> <UserOutlined /> {host?.username || 'Unknown'}
        </Col>

        {/* Room Status */}
        <Col xs={24} sm={12} md={6}>
          <Text strong>🟢 Status:</Text>
          <Tag color={room.started ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
            {room.started ? 'In Battle' : 'Waiting'}
          </Tag>
        </Col>

        {/* Lock Status */}
        <Col xs={24} sm={12} md={6}>
          <Text strong>🔐 Room:</Text>
          <Tag icon={room.locked ? <LockOutlined /> : <UnlockOutlined />} color={room.locked ? 'red' : 'blue'}>
            {room.locked ? 'Locked' : 'Open'}
          </Tag>
          {room.locked && room.password && (
            <Tooltip title="Room Password">
              <Tag color="default" style={{ marginLeft: 8 }}>{room.password}</Tag>
            </Tooltip>
          )}
        </Col>

        {/* Task Type */}
        <Col xs={24} sm={12} md={6}>
          <Text strong>🎮 Task:</Text>
          <Tag color="geekblue" style={{ marginLeft: 8 }}>{room.type}</Tag>
        </Col>
      </Row>
    </StyledCard>
  );
}

export default RoomInfoHeader;
