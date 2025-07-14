// ✅ FriendsContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { WS_BASE_URL, API_BASE_URL } from '../config/wsConfig';
import { message } from 'antd';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUser = user?.username;

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [invitation, setInvitation] = useState(null);
  const socketRef = useRef(null);

  const  fetchFriends= async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error('Failed to fetch friends', err);
    }
  };

  const fetchPendingRequests = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/pending/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPendingRequests(data);
    } catch (err) {
      console.error('Failed to fetch pending requests', err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const socket = new WebSocket(
      `${WS_BASE_URL}/ws/friends/?username=${encodeURIComponent(currentUser)}`
    );
    socketRef.current = socket;

    socket.onopen = () => console.log('[FriendsWS] Connected');
    socket.onclose = () => console.log('[FriendsWS] Disconnected');
    socket.onerror = (err) => console.error('[FriendsWS] Error:', err);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[FriendsWS] Message:', data);

      switch (data.type) {
        case 'room_invitation':
          setInvitation({ from: data.from, room_id: data.room_id });
          break;
        case 'friend_request':
          message.info(`New friend request from ${data.from_user}`);
          fetchPendingRequests();
          break;
        case 'friend_accepted':
          if (data.by !== currentUser) {
            message.success(`${data.by} accepted your friend request`);
          }
          fetchPendingRequests();
          fetchFriends();
          break;
        case 'friend_removed':
          message.info(`You were removed by ${data.by}`);
          fetchFriends();
          break;
        case 'user_online':
          setOnlineUsers((prev) =>
            prev.includes(data.username) ? prev : [...prev, data.username]
          );
          break;
        case 'user_offline':
          setOnlineUsers((prev) =>
            prev.filter((u) => u !== data.username)
          );
          break;
        case 'online_users':
          setOnlineUsers(data.users);
          break;
        default:
          console.warn('[FriendsWS] Unknown type:', data);
      }
    };

    return () => socket.close();
  }, [currentUser]);

  const sendMessage = (msgObj) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msgObj));
    } else {
      console.warn('[FriendsWS] Cannot send: socket not open');
    }
  };

  return (
    <FriendsContext.Provider
      value={{
        onlineUsers,
        friends,
        pendingRequests,
        invitation,
        setInvitation,
        fetchFriends,
        fetchPendingRequests,
        sendMessage,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => useContext(FriendsContext);
