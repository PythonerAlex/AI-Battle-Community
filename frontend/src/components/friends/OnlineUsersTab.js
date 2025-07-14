import React, { useState } from 'react';
import { List, message } from 'antd';
import FriendItem from './FriendItem';
import { useAuth } from '../../contexts/AuthContext';
import { useFriends } from '../../contexts/FriendsContext';
import RoomSelectModal from './RoomSelectModal';
import { API_BASE_URL } from '../../config/wsConfig';

function OnlineUsersTab({ friends, pendingRequests = [], filteredOnline, onAdd, onRemove, onInvite}) {
  const { user } = useAuth();
  const currentUser = user?.username;
  const { sendMessage } = useFriends();


  const friendUsernames = new Set(
    friends.map(f =>
      f.user1.username === currentUser ? f.user2.username : f.user1.username
    )
  );

  const pendingUsernames = new Set(
    pendingRequests.map(r => r.from_user.username)
  );


  return (
    <>
      <List
        dataSource={filteredOnline.filter(u => u !== currentUser)}
        renderItem={(username) => {
          const isFriend = friendUsernames.has(username);
          const pending = pendingUsernames.has(username);

          return (
            <FriendItem
              key={username}
              friend={{ username, isFriend, pending, online: true }}
              
              onInvite={() => onInvite(username)}
              onAdd={() => onAdd(username)}
              onRemove={(username) => onRemove?.(username)}
            />
          );
        }}
        locale={{ emptyText: 'No one is online' }}
      />

    </>
  );
}

export default OnlineUsersTab;


