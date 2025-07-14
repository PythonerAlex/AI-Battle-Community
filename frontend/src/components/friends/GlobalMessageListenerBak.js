// GlobalMessageListener.js
import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { useFriends } from '../../contexts/FriendsContext';
import { useNavigate } from 'react-router-dom';

const GlobalMessageListener = () => {
  const { registerCallbacks } = useFriends();
  const navigate = useNavigate();

  // 🔑 为每次邀请创建唯一标识
  const [invitation, setInvitation] = useState(null); // { from, room_id, key }
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ 接收到邀请时触发：设置新邀请并显示 modal
  const onRoomInvitation = (from, room_id) => {
    const newInvite = { from, room_id, key: Date.now() };
    console.log('[InviteModal] Received new invite:', newInvite);
    setInvitation(newInvite);
    setModalVisible(true); // 明确打开 Modal
  };

  // 用户点击“加入房间”
  const handleAccept = () => {
    setModalVisible(false);
    message.success(`Joining room ${invitation.room_id}...`);
    navigate(`/room/${invitation.room_id}`);
    setInvitation(null); // 清除状态，允许下次再弹
  };

  // 用户点击“拒绝”
  const handleDecline = () => {
    setModalVisible(false);
    message.info(`You declined the invitation from ${invitation.from}`);
    setInvitation(null); // 清除状态
  };

  // 注册回调函数（只在组件 mount 时）
  useEffect(() => {
    registerCallbacks({
    loadPendingRequests: () => {}, // ⚠️ 保留，避免覆盖丢失
    loadFriends: () => {},
    onRoomInvitation,
    });
  }, [registerCallbacks]);

  return (
    <Modal
      key={invitation?.key} // 每次都唯一，强制重新渲染
      open={modalVisible}
      onOk={handleAccept}
      onCancel={handleDecline}
      closable={false}
      maskClosable={false}
      centered
      //destroyOnClose={true} // ✅ 可选，避免状态残留
      okText="Join Room"
      cancelText="Decline"
    >
      <p>{invitation?.from} invited you to join room <strong>{invitation?.room_id}</strong>.</p>
    </Modal>
  );
};

export default GlobalMessageListener;




/*import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '../../contexts/FriendsContext';

function GlobalMessageListener() {
  const { registerCallbacks } = useFriends();
  const navigate = useNavigate();

  useEffect(() => {
    const onRoomInvitation = (from, room_id) => {
      console.log(`[AutoJoin] Invited by ${from} to room ${room_id}`);
      navigate(`/room/${room_id}`);
    };

    // ✅ 打印 onRoomInvitation 是不是函数
    console.log('registerCallbacks 中传入的 onRoomInvitation =', onRoomInvitation);

    // ✅ 核心修复：确保这 3 个字段全部传入！
    registerCallbacks({
      loadFriends: () => { },             // 可以是空函数
      loadPendingRequests: () => { },     // 可以是空函数
      onRoomInvitation,                  // ✅ 重点是这个字段！
    });
  }, [navigate, registerCallbacks]);
  return null;
}

export default GlobalMessageListener;

*/