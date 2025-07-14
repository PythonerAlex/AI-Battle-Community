// ✅ FriendsSidebar.js
import React, { useState, useEffect } from 'react';
import { Tabs, Input, Button, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

import AddFriendModal from './AddFriendModal';
import FriendsTab from './FriendsTab';
import FriendRequestsTab from './FriendRequestsTab';
import OnlineUsersTab from './OnlineUsersTab';

import { useFriends } from '../../contexts/FriendsContext';
import { API_BASE_URL } from '../../config/wsConfig';
import { useAuth } from '../../contexts/AuthContext';

const { TabPane } = Tabs;
const { Title } = Typography;

function FriendsSidebar() {
  const [search, setSearch] = useState('');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const { user } = useAuth();
  const currentUser = user?.username;

  const {
    onlineUsers,
    friends,
    pendingRequests,
    fetchFriends,
    fetchPendingRequests,
    sendMessage,
  } = useFriends();

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, []);

  const handleSendFriendRequest = async (toUsername) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/send-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: toUsername }),
      });

      const data = await res.json();

      if (res.ok) {
        fetchPendingRequests();
      } else {
        console.error(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Network error', err);
    }
  };

  const handleRemoveFriend = async (toUsername) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/remove-friend/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: toUsername }),
      });

      const data = await res.json();

      if (res.ok) {
        fetchFriends();
      } else {
        console.error(data.error || 'Failed to remove friend');
      }
    } catch (err) {
      console.error('Network error', err);
    }
  };

  const filteredFriends = friends.filter((item) => {
    const friendUsername =
      item.user1.username === currentUser
        ? item.user2.username
        : item.user1.username;
    return friendUsername.toLowerCase().includes(search.toLowerCase());
  });

  const filteredPending = pendingRequests.filter((req) =>
    req.from_user.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOnline = onlineUsers.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: 300 }}>
      <Title level={4}>Friends</Title>

      <Input.Search
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <Button
        icon={<UserAddOutlined />}
        type="primary"
        style={{ width: '100%', marginBottom: 12 }}
        onClick={() => setAddModalVisible(true)}
      >
        Add Friend
      </Button>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Friends" key="1">
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <FriendsTab friends={filteredFriends} onRemoveFriend={handleRemoveFriend} />
          </div>
        </TabPane>

        <TabPane tab={`Requests (${pendingRequests.length})`} key="2">
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <FriendRequestsTab
              requests={filteredPending}
              onlineUsers={onlineUsers}
              onRespond={fetchPendingRequests}
            />
          </div>
        </TabPane>

        <TabPane tab="Online" key="3">
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <OnlineUsersTab
              friends={friends}
              pendingRequests={pendingRequests}
              filteredOnline={filteredOnline}
              onAdd={handleSendFriendRequest}
              onRemove={handleRemoveFriend}
            />
          </div>
        </TabPane>
      </Tabs>

      <AddFriendModal
        visible={isAddModalVisible}
        onCancel={() => setAddModalVisible(false)}
      />
    </div>
  );
}

export default FriendsSidebar;
