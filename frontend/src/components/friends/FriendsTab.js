import React from 'react';
import { List } from 'antd';
import FriendItem from './FriendItem';
import { useAuth } from '../../contexts/AuthContext';
import { useFriends } from '../../contexts/FriendsContext';

function FriendsTab({ friends, onRemoveFriend, onInvite }) {
  const { user } = useAuth();
  const currentUser = user?.username;
  const { onlineUsers, sendMessage } = useFriends();

  return (
    <List
      dataSource={friends}
      renderItem={(f) => {
        const friendUsername =
          f.user1.username === currentUser ? f.user2.username : f.user1.username;

        const isOnline = onlineUsers.includes(friendUsername);

        return (
          <FriendItem
            key={friendUsername}
            friend={{
              username: friendUsername,
              isFriend: true,
              online: isOnline,
              tab: 'friends',
            }}
            onInvite={() => onInvite(friendUsername)} // ✅ 使用外部传入的统一函数
            onRemove={onRemoveFriend}
          />

        );
      }}
      locale={{ emptyText: 'No friends yet' }}
    />
  );
}

export default FriendsTab;
