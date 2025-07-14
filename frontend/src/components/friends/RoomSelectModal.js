import React, { useEffect, useState } from 'react';
import { Modal, List, Button, Tag } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { useLobbySocket } from '../../hooks/useLobbySocket'; // ✅ 引入已写好的 Hook

function RoomSelectModal({ open, onSelect, onCancel }) {
  const { user } = useAuth();
  const currentUser = user?.username;
  const [rooms, setRooms] = useState([]);
  const [ready, setReady] = useState(false);  // ✅ 新增：WebSocket 是否已连接
  // 注册 WebSocket 并获取 ref
  
  const socketRef = useLobbySocket((data) => {
    if (data.type === 'my_rooms') {
      setRooms(data.rooms);
    }
  }, () => setReady(true));  // ✅ onOpen 时设置为 true

/*useEffect(() => {
  console.log("RoomSelectModal open:", open);
  console.log("socket state:", socketRef.current?.readyState);

  if (open && currentUser && socketRef.current?.readyState === WebSocket.OPEN) {
    console.log("✅ Sending request_my_rooms");
    socketRef.current.send(
      JSON.stringify({ type: 'request_my_rooms', username: currentUser })
    );
  }
}, [open, currentUser]);*/

 useEffect(() => {
    if (open && currentUser && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: 'request_my_rooms', username: currentUser })
      );
    }
  }, [open, currentUser, socketRef]);


  return (
    <Modal title="Select a Room to Invite" open={open} onCancel={onCancel} footer={null}>
      <List
        dataSource={rooms}
        renderItem={(room) => (
          <List.Item
            actions={[
              <Button type="primary" onClick={() => onSelect(room.id)}>
                Invite
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={`Room ID: ${room.id}`}
              description={`Status: ${room.locked ? 'Locked' : room.status}, Users: ${room.users.length}/${room.maxPlayers}`}
            />
            {room.locked && <Tag color="red">Locked</Tag>}
            {room.users.length >= room.maxPlayers && <Tag color="orange">Full</Tag>}
          </List.Item>
        )}
        locale={{ emptyText: 'No rooms created by you' }}
      />
    </Modal>
  );
}

export default RoomSelectModal;
