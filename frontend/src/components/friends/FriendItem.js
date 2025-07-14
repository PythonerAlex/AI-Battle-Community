// FriendItem.js
import React from 'react';
import { API_BASE_URL } from '../../config/wsConfig';

import { List, Button, Tag, Space, Tooltip, message } from 'antd';
import {
  UserAddOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

function FriendItem({ friend, isRequest, requestId, onAdd, onAccept, onReject, onInvite, onRemove, onRespond }) {
  const token = localStorage.getItem('access_token');

  const handleAccept = async () => {
    if (!token) return message.error("Not logged in");
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/accept-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ request_id: requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTimeout(() => {
          onRespond?.();
        }, 200);
        message.success('Friend request accepted');
      } else {
        message.error(data.error || 'Accept failed');
      }
    } catch (err) {
      message.error('Network error');
    }
  };

  const handleReject = async () => {
    if (!token) return message.error("Not logged in");
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/reject-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ request_id: requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTimeout(() => {
          onRespond?.();
        }, 200);
        message.success('Friend request rejected');
      } else {
        message.error(data.error || 'Reject failed');
      }
    } catch (err) {
      message.error('Network error');
    }
  };

  const renderTag = () => {
    if (friend.tab === 'friends') {
      // 在 FriendsTab 显示 online/offline 状态
      return (
        <Tag color={friend.online ? 'green' : 'default'}>
          {friend.online ? 'Online' : 'Offline'}
        </Tag>
      );
    }

    if (friend.isRequest) {
      return (
        <Tag color={friend.online ? 'green' : 'default'}>
          {friend.online ? 'Online' : 'Offline'}
        </Tag>
      );
    }


    if (friend.pending) {
      return <Tag color="orange">Request Sent</Tag>;
    }

    // 默认：在 OnlineUsersTab 中显示 Friend 或 Stranger
    return friend.isFriend
      ? <Tag color="blue">Friend</Tag>
      : <Tag color="default">Stranger</Tag>;
  };

  const renderActions = () => {
    if (friend.isRequest) {
      return (
        <Space>
          <Tooltip title="Accept">
            <Button icon={<CheckOutlined />} size="small" onClick={handleAccept} />
          </Tooltip>
          <Tooltip title="Reject">
            <Button icon={<CloseOutlined />} size="small" danger onClick={handleReject} />
          </Tooltip>
        </Space>
      );
    }

    if (friend.tab === 'friends') {
      return (
        <Space>
          <Tooltip title="Invite to Room">
            <Button
              icon={<SendOutlined />}
              size="small"
              onClick={() => onInvite?.(friend.username)}
              disabled={!friend.online}
            />
          </Tooltip>
          <Tooltip title="Remove Friend">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => onRemove?.(friend.username)}
            />
          </Tooltip>
        </Space>
      );
    }

    if (friend.isFriend) {
      return (
        <Space>
          <Tooltip title="Invite to Room">
            <Button
              icon={<SendOutlined />}
              size="small"
              onClick={() => onInvite?.(friend.username)}
              disabled={!friend.online}
            />
          </Tooltip>
          <Tooltip title="Remove Friend">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => onRemove?.(friend.username)}
            />
          </Tooltip>
        </Space>
      );
    }

    if (friend.pending) {
      return <Tag color="orange">Request Sent</Tag>;
    }

    return (
      <Tooltip title="Add Friend">
        <Button icon={<UserAddOutlined />} size="small" onClick={() => onAdd?.(friend.username)} />
      </Tooltip>
    );
  };

  return (
    <List.Item actions={[renderActions()]}>
      <List.Item.Meta
        title={friend.username}
        description={renderTag()}
      />
    </List.Item>
  );
}

export default FriendItem;

