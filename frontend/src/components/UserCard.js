// src/components/UserCard.js
import React from 'react';
import { Card, Avatar, Tag, Button, Upload, Divider } from 'antd';
import { UserOutlined, CrownOutlined, UploadOutlined } from '@ant-design/icons';
import './UserCard.css';  // ✅ 新增样式文件（见下方）

function UserCard({
  user,
  isHost,
  isCurrentUser,
  isSelected,
  modelFileName,
  onToggleReady,
  onUploadModel,
  onRemoveModel,
  onLeaveRoom,
  navigate
}) {
  return (
    <Card
      size="small"
      className="user-card"
      bodyStyle={{ padding: 12 }}
      hoverable
    >
      {/* === 顶部：用户名 + 房主图标 === */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <Avatar icon={<UserOutlined />} size="small" />
        <span style={{ marginLeft: 8, fontWeight: 600 }}>{user.username}</span>
        {isHost && <CrownOutlined style={{ color: '#faad14', marginLeft: 6 }} />}
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* === 状态区域 === */}
      <div style={{ lineHeight: '1.8' }}>
        <div>Status: <Tag color={user.status === 'Uploaded' ? 'green' : 'red'}>
          {user.status || 'Not Uploaded'}
        </Tag></div>

        <div>Ready: {user.isReady ? '✅' : '❌'}</div>

        {isSelected && (
          <div>
            Selected:
            <Tag color="blue" className="glowing-tag">Participant</Tag>
          </div>
        )}
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* === 当前用户操作区 === */}
      {isCurrentUser && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Upload
            accept=".h5,.pt"
            beforeUpload={async (file) => {
              try {
                await onUploadModel(file);
              } catch (err) {
                console.error(err);
              }
              return false;
            }}
            onRemove={onRemoveModel}
            showUploadList={{ showRemoveIcon: true }}
            fileList={
              modelFileName
                ? [{
                    uid: user.username,
                    name: modelFileName,
                    status: 'done',
                  }]
                : []
            }
          >
            <Button
              type="primary"
              size="small"
              icon={<UploadOutlined />}
              disabled={!!modelFileName}
            >
              Upload Model
            </Button>
          </Upload>

          <Button
            size="small"
            type={user.isReady ? 'default' : 'primary'}
            onClick={onToggleReady}
          >
            {user.isReady ? 'Cancel Ready' : 'Ready'}
          </Button>

          <Button
            size="small"
            danger
            onClick={() => {
              onLeaveRoom();
              navigate('/battle');
            }}
          >
            Leave Room
          </Button>
        </div>
      )}
    </Card>
  );
}

export default UserCard;
