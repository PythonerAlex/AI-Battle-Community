
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState, useRef } from 'react';
import { WS_BASE_URL } from '../../config/wsConfig';

export default function useMnistDuelGame({
  start,
  participants,
  testFileName,
  rounds,
  roomId,
  firstPlayer,
  battleMode,
  modelFiles,
  task_type, // 传递 task type
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();          // 取当前登录用户
  const currentUser = user?.username;  // 假设登录后一定有 username
  const [isSocketReady, setIsSocketReady] = useState(false);

  const socketRef = useRef(null);

  // ✅ 建立 WebSocket 连接（只建立一次）
  useEffect(() => {
    const socket = new WebSocket(
      `${WS_BASE_URL}/ws/room/${roomId}/?username=${encodeURIComponent(currentUser)}`
    );
    //const socket = new WebSocket(`${WS_BASE_URL}/ws/room/${roomId}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[WebSocket] Connected for MNIST Duel');
      setIsSocketReady(true);
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'evaluate_result') {
        setResults(data.results || []);
        setLoading(false);
      }
    };

    socket.onclose = () => {
      console.log('[WebSocket] Disconnected');
    };

    return () => {
      socket.close();
    };
  }, [roomId, currentUser]);

  // ✅ 通过 socket 发起评测请求
  const evaluate = ({
    participants,
    testFileName,
    rounds,
    roomId,
    firstPlayer,
    battleMode,
    modelFiles,
    task_type,
  }) => {
    if (!isSocketReady || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready');
      return;
    }

    setLoading(true);
    console.log('[MNIST] Sending evaluation request:', {
      testFileName,
      participants,
      rounds,
      roomId,
      firstPlayer,
      battleMode,
      modelFiles,
      task_type, // 传递 task type
    });
    socketRef.current.send(
      JSON.stringify({
        type: 'evaluate',
        roomId,
        testFileName,
        participants,
        rounds,
        firstPlayer,
        battleMode,
        modelFiles,
        task_type, // 传递 task type
      })
    );
  };

  return {
    results,
    loading,
    evaluate,
  };
}
