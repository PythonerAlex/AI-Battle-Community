// FriendRequestsTab.js
import React from 'react';
import { List } from 'antd';
import FriendItem from './FriendItem';

function FriendRequestsTab({ requests = [], onlineUsers = [], onRespond }) {
  return (
    <List
      dataSource={requests}
      renderItem={(req) => {
        const username = req.from_user.username;
        const isOnline = onlineUsers.includes(username);

        return (
          <FriendItem
            key={req.id}
            friend={{ username, isRequest: true, online: isOnline }}
            requestId={req.id}
            onRespond={onRespond}
          />
        );
      }}
      locale={{ emptyText: 'No friend requests' }}
    />
  );
}

export default FriendRequestsTab;
