// src/hooks/useLobbySocket.js
import { useEffect, useRef } from 'react';
//import WS_BASE_URL from '../config/wsConfig';
import { WS_BASE_URL } from '../config/wsConfig';
export function useLobbySocket(onMessage,onOpen ) {
  const socketRef = useRef(null);

  useEffect(() => {
    //const socket = new WebSocket(`${WS_BASE_URL}/lobby/`);
    const socket = new WebSocket(`${WS_BASE_URL}/ws/lobby/`);
    socketRef.current = socket;

    //socket.onopen = () => console.log('✅ Lobby WebSocket connected');
    socket.onopen = () => {
      console.log('✅ Lobby WebSocket connected');
      onOpen?.();  // ✅ 新增：连接成功时通知外部
    };
    socket.onmessage = (event) => { 
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("❌ Invalid JSON from lobby socket:", event.data);
      }
    };
    socket.onclose = () => console.log('❌ Lobby WebSocket disconnected');
    socket.onerror = (err) => console.error("Lobby WebSocket error:", err);

    return () => socket.close();
  }, []);

  return socketRef;
}
