// ✅ 完整替换 FriendsContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { WS_BASE_URL } from '../config/wsConfig';
import { message } from 'antd';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUser = user?.username;

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [invitation, setInvitation] = useState(null);  // ✅ 全局 invitation 状态
  const socketRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const socket = new WebSocket(
      `${WS_BASE_URL}/ws/friends/?username=${encodeURIComponent(currentUser)}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[FriendsWS] ✅ Connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[FriendsWS] 📩 Raw message:', data);

      switch (data.type) {
        case 'room_invitation':
          const newInvite = {
            from: data.from,
            room_id: data.room_id,
            key: Date.now(),
          };
          setInvitation(newInvite);  // ✅ 直接设置状态
          break;

        case 'friend_request':
          message.info(`New friend request from ${data.from_user}`);
          break;

        case 'friend_accepted':
          if (data.by && data.by !== currentUser) {
            message.success(`${data.by} accepted your friend request`);
          }
          break;

        case 'user_online':
          setOnlineUsers((prev) =>
            prev.includes(data.username) ? prev : [...prev, data.username]
          );
          break;

        case 'user_offline':
          setOnlineUsers((prev) =>
            prev.filter((username) => username !== data.username)
          );
          break;

        case 'online_users':
          setOnlineUsers(data.users);
          break;

        case 'friend_removed':
          message.info(`You were removed by ${data.by}`);
          break;

        default:
          console.warn('[FriendsWS] ❓ Unknown message type:', data);
      }
    };

    socket.onclose = () => {
      console.log('[FriendsWS] 🔌 Disconnected');
    };

    socket.onerror = (err) => {
      console.error('[FriendsWS] 🔥 Error:', err);
    };

    return () => {
      socket.close();
    };
  }, [currentUser]);

  const sendMessage = (msgObj) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msgObj));
    } else {
      console.warn('[FriendsWS] ❌ Cannot send: socket not open');
    }
  };

  return (
    <FriendsContext.Provider value={{ onlineUsers, sendMessage, invitation, setInvitation }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => useContext(FriendsContext);
