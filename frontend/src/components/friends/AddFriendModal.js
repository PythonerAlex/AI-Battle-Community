import React, { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { API_BASE_URL } from '../../config/wsConfig';

function AddFriendModal({ visible, onCancel }) {
  const [username, setUsername] = useState('');

  const handleOk = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      message.warning('Please enter a username');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      message.error('You must be logged in to send requests.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/send-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ 使用本地 JWT token
        },
        body: JSON.stringify({ to: trimmed }),
      });

      const data = await res.json();

      if (res.ok) {
        message.success(`Friend request sent to "${trimmed}"`);
        setUsername('');
        onCancel();
      } else {
        message.error(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error(err);
      message.error('Network error');
    }
  };

  return (
    <Modal
      title="Add Friend"
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        setUsername('');
        onCancel();
      }}
      okText="Send Request"
    >
      <Input
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onPressEnter={handleOk}
      />
    </Modal>
  );
}

export default AddFriendModal;


/*import React, { useState } from 'react';
import { Modal, Input, message } from 'antd';

function AddFriendModal({ visible, onCancel }) {
  const [username, setUsername] = useState('');

  const handleOk = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      message.warning('Please enter a username');
      return;
    }

    // ✅ mock 发送请求，实际应替换为 API 调用
    message.success(`Friend request sent to "${trimmed}"`);
    setUsername('');
    onCancel();  // 关闭 modal
  };

  return (
    <Modal
      title="Add Friend"
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        setUsername('');
        onCancel();
      }}
      okText="Send Request"
    >
      <Input
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onPressEnter={handleOk}
      />
    </Modal>
  );
}

export default AddFriendModal;
*/