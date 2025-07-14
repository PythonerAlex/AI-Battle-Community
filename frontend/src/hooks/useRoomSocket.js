import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { WS_BASE_URL, API_BASE_URL } from "../config/wsConfig";

export function useRoomSocket(roomId, onMessage) {
  const socketRef = useRef(null);
  const { user } = useAuth();          // 取当前登录用户
  const currentUser = user?.username;  // 假设登录后一定有 username

  useEffect(() => {
    if (!roomId || !currentUser) return;

    /*const socket = new WebSocket(
      `${WS_BASE_URL}/room/${roomId}/?username=${encodeURIComponent(currentUser)}`
    );*/
    const socket = new WebSocket(
      `${WS_BASE_URL}/ws/room/${roomId}/?username=${encodeURIComponent(currentUser)}`
    );
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ Room WS connected");
    socket.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); }
      catch { console.error("Invalid WS payload:", e.data); }
    };
    socket.onclose = () => console.log("❌ Room WS disconnected");
    socket.onerror = (err) => console.error("Room WS error:", err);

    return () => socket.close();
  }, [roomId, currentUser]);


  // ✅ 新增的聊天发送函数
  const sendChatMessage = (text) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(JSON.stringify({
        type: "chat",
        message: text,
      }));
    } else {
      console.warn("WebSocket not ready. Cannot send chat message.");
    }
  };

  const startBattle = () => {
    socketRef.current?.send(JSON.stringify({
      type: 'start_battle'
    }));
  };

  const updateRoomSetting = (roomUpdate) => {
    socketRef.current?.send(JSON.stringify({
      type: 'init_room',
      username: currentUser,   // ⚠️ 确保 useRoomSocket 中也接收了 currentUser 作为参数
      room: roomUpdate
    }));
  };

  const kickUser = (targetUsername) => {
    socketRef.current?.send(JSON.stringify({
      type: 'kick_user',
      target: targetUsername
    }));
  };

  const toggleReady = () => {
    socketRef.current?.send(JSON.stringify({ type: 'toggle_ready' }));
  };

  const leaveRoom = () => {
    socketRef.current?.close();  // 主动关闭连接
  };


  const uploadModel = async (file, roomId, username) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);       // ✅ 添加房间号
    formData.append('username', username);   // ✅ 添加用户名

    await fetch(`${API_BASE_URL}/api/run_evaluation/upload_model/`, {
      //await fetch("http://localhost:8000/api/run_evaluation/upload_model/", {
      method: "POST",
      body: formData,
    });

    // 通知 WebSocket 更新状态
    //socketRef.current?.send(JSON.stringify({ type: 'upload_model' }));
    // WebSocket 通知房间用户状态更新，并携带模型文件名
    socketRef.current?.send(JSON.stringify({
      type: 'upload_model',
      username,
      filename: file.name,  // ✅ 文件名来自这里
    }));
  };


  const uploadTestFile = async (file, roomId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    await fetch(`${API_BASE_URL}/api/run_evaluation/upload_test/`, {
      method: 'POST',
      body: formData,
    });
  };

  return {
    socketRef, sendChatMessage, uploadModel, uploadTestFile, startBattle, updateRoomSetting, kickUser, toggleReady,
    leaveRoom,
  };
  //return socketRef;
}
