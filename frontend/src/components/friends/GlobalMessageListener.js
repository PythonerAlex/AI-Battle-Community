// ✅ 完整替换 GlobalMessageListener.js
import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { useFriends } from '../../contexts/FriendsContext';
import { useNavigate } from 'react-router-dom';

const GlobalMessageListener = () => {
  const { invitation, setInvitation } = useFriends();
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (invitation) {
      console.log('[InviteModal] 🎯 New invite received:', invitation);
      setVisible(true);
    }
  }, [invitation]);

  const handleAccept = () => {
    if (invitation) {
      message.success(`Joining room ${invitation.room_id}...`);
      navigate(`/room/${invitation.room_id}`);
      setVisible(false);
      setInvitation(null);
    }
  };

  const handleDecline = () => {
    if (invitation) {
      message.info(`You declined the invitation from ${invitation.from}`);
      setVisible(false);
      setInvitation(null);
    }
  };

  return (
    <Modal
      open={visible}
      onOk={handleAccept}
      onCancel={handleDecline}
      closable={false}
      maskClosable={false}
      centered
      okText="Join Room"
      cancelText="Decline"
    >
      {invitation && (
        <p>
          {invitation.from} invited you to join room <strong>{invitation.room_id}</strong>.
        </p>
      )}
    </Modal>
  );
};

export default GlobalMessageListener;
