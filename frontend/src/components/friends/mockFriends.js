// src/components/friends/mockFriends.js

export const mockFriendList = [
  {
    username: 'alice',
    online: true,
    isFriend: true,
    pending: false,
  },
  {
    username: 'bob',
    online: false,
    isFriend: true,
    pending: false,
  },
  {
    username: 'charlie',
    online: true,
    isFriend: false,
    pending: true, // 请求待接受
  },
  {
    username: 'david',
    online: true,
    isFriend: false,
    pending: false, // 陌生人，可发送请求
  },
    {
        username: 'eve',
        online: false,
        isFriend: true,
        pending: false,
    },
    
];
