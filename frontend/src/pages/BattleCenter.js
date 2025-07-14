import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLobbySocket } from '../hooks/useLobbySocket';


import {
  Typography,
  Tooltip,
  List,
  Card,
  Button,
  Tag,
  Modal,
  Select,
  message,
  Input,
  Form,
  Row,
  Switch,
  Col
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  TrophyOutlined,
  LockOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

// === Room Status Enum ===
const RoomStatus = {
  WAITING: 'waiting',
  FULL: 'full',
  ACTIVE: 'active',
  CLOSED: 'closed',
};

// === Status tag color mapping ===
const statusTag = {
  [RoomStatus.WAITING]: <Tag color="green">WAITING</Tag>,
  [RoomStatus.FULL]: <Tag color="orange">FULL</Tag>,
  [RoomStatus.ACTIVE]: <Tag color="red">IN PROGRESS</Tag>,
  [RoomStatus.CLOSED]: <Tag color="gray">CLOSED</Tag>,
};



function BattleCenter() {

  //const currentUser = 'AlexJin'; // TODO: Replace with real auth context in future
  const { user } = useAuth();
  const currentUser = user?.username;

  const [rooms, setRooms] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Filter state
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchHost, setSearchHost] = useState('');

  // 👇 仅此为新增代码
  //const isFirstMount = useRef(true);

  const navigate = useNavigate();

  const handleLobbyMessage = (data) => {
    if (data.type === 'room_list') {
      setRooms(data.rooms);
    }

    else if (data.type === 'room_deleted') {
      setRooms(prev => prev.filter(r => r.id !== data.roomId));
      message.success(`Room "${data.roomId}" deleted successfully.`);
    }

    else if (data.type === 'room_updated') {
      setRooms(prev => prev.map(r => r.id === data.room.id ? data.room : r));
    }

    else {
      console.warn('Unhandled lobby message:', data);
    }
  };



  const lobbySocketRef = useLobbySocket(handleLobbyMessage);

  const handleCreateRoom = () => {
    form
      .validateFields()
      .then(values => {
        const newRoom = {
          id: `room_${Date.now()}`,
          host: currentUser,
          type: values.type,
          password: values.password || ''
        };

        // ① 发送创建请求
        lobbySocketRef.current?.send(
          JSON.stringify({ type: "create_room", room: newRoom })
        );

        // ② Toast：创建中
        message.loading({ content: "Creating room...", key: "creating" });

        // ③ 监听 lobby WS，等房间真正出现在 room_list 再跳转
        const waitForRoom = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (
              data.type === "room_list" &&
              data.rooms.some(r => r.id === newRoom.id)
            ) {
              message.success({
                content: "Room created! Click 'Join' to enter.",
                key: "creating",
                duration: 3,
              });
              //navigate(`/room/${newRoom.id}`);
              lobbySocketRef.current?.removeEventListener("message", waitForRoom);
            }
          } catch (_) { /* ignore */ }
        };
        lobbySocketRef.current?.addEventListener("message", waitForRoom);

        // ④ 关闭弹窗 & 清表单
        setModalVisible(false);
        form.resetFields();
      })
      .catch(err => console.log("Validation failed:", err));
  };


  const handleJoinRoom = (roomId) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) {
      message.error('Room not found.');
      return;
    }

    // 👇 房主可直接进入
    if (targetRoom.host === currentUser) {
      navigate(`/room/${roomId}`);
      return;
    }

    // 👇 其他用户需输入密码（若房间加密）
    if (targetRoom.password) {
      let enteredPassword = '';
      Modal.confirm({
        title: 'Enter Room Password',
        content: (
          <Input.Password
            placeholder="Password"
            onChange={(e) => { enteredPassword = e.target.value; }}
          />
        ),
        onOk: () => {
          if (enteredPassword === targetRoom.password) {
            message.success(`Joining room ${roomId}...`);
            navigate(`/room/${roomId}`);
          } else {
            message.error('Incorrect password!');
          }
        },
      });
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  const handleDeleteRoom = (roomId) => {
    const roomToDelete = rooms.find(r => r.id === roomId);
    if (roomToDelete?.host === currentUser) {
      lobbySocketRef.current?.send(
        JSON.stringify({
          type: 'delete_room',
          roomId,
          username: currentUser
        })
      );
      message.success(`Room "${roomId}" deletion requested.`);
    } else {
      message.error("Only the host can delete this room.");
    }
  };

  const toggleRoomStatus = (roomId, isOpen) => {
    const newStatus = isOpen ? RoomStatus.WAITING : RoomStatus.CLOSED;

    lobbySocketRef.current?.send(
      JSON.stringify({
        type: 'update_room_status',
        roomId,
        status: newStatus,
        username: currentUser
      })
    );

    message.success(`Room status set to ${newStatus.toUpperCase()}`);
  };


  const filteredRooms = rooms.filter(room =>
    (room.status !== RoomStatus.CLOSED || room.host === currentUser) && // ✅ 修正条件
    (!typeFilter || room.type === typeFilter) &&
    (!statusFilter || room.status === statusFilter) &&
    (!searchHost || room.host.toLowerCase().includes(searchHost.toLowerCase()))
  );

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Battle Lobby</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Create Room
        </Button>
      </div>

      <Paragraph style={{ maxWidth: 600 }}>
        Join or host machine learning model battles. Filter by type, status, or host to find rooms.
      </Paragraph>

      {/* Filter Section */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Select
            allowClear
            placeholder="Filter by Type"
            onChange={(val) => setTypeFilter(val)}
            style={{ width: '100%' }}
          >
            <Option value="ConnectX">ConnectX</Option>
            <Option value="MNIST">MNIST Duel</Option>
            <Option value="CIFAR">CIFAR-10</Option>
            <Option value="SAT Duel">SAT Duel</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Select
            allowClear
            placeholder="Filter by Status"
            onChange={(val) => setStatusFilter(val)}
            style={{ width: '100%' }}
          >
            <Option value={RoomStatus.WAITING}>Waiting</Option>
            <Option value={RoomStatus.FULL}>Full</Option>
            <Option value={RoomStatus.ACTIVE}>In Progress</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Search
            placeholder="Search by Host"
            allowClear
            onSearch={(val) => setSearchHost(val)}
            enterButton
          />
        </Col>
      </Row>

      {/* Room List */}
      <Card title="Available Rooms">
        <List
          itemLayout="horizontal"
          dataSource={filteredRooms}
          locale={{ emptyText: 'No matching rooms' }}
          renderItem={(room) => (
            <List.Item
              actions={[
                <Tooltip title={room.locked ? "Room is locked by host" : "Join room"}>
                  <Button
                    type="link"
                    disabled={room.locked && room.host !== currentUser}
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    Join
                  </Button>
                </Tooltip>,

                (room.host === currentUser && (
                  <Button type="link" danger onClick={() => handleDeleteRoom(room.id)}>
                    Delete
                  </Button>
                )),


                room.host === currentUser && (
                  <Switch
                    size="small"
                    checked={room.status !== RoomStatus.CLOSED}
                    onChange={(checked) => toggleRoomStatus(room.id, checked)}
                    checkedChildren="Open"
                    unCheckedChildren="Closed"
                  />
                )

              ]}

            >
              <List.Item.Meta
                avatar={<TrophyOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                title={`${room.type} - Host: ${room.host}`}
                description={
                  <>
                    {statusTag[room.status]}
                    <Tag icon={<UserOutlined />}>
                      {room.users.length}/{room.maxPlayers}
                    </Tag>
                    {room.password && (
                      <Tag icon={<LockOutlined />} color="gold">
                        Password
                      </Tag>
                    )}
                    {room.locked && (
                      <Tag icon={<LockOutlined />} color="red" style={{ marginLeft: 8 }}>
                        Locked
                      </Tag>
                    )}

                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Modal: Create Room */}
      <Modal
        title="Create New Battle Room"
        open={isModalVisible}
        onOk={handleCreateRoom}
        onCancel={() => setModalVisible(false)}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Battle Type"
            rules={[{ required: true, message: 'Please select a battle type' }]}
          >
            <Select placeholder="Select project">
              <Option value="ConnectX">ConnectX (Reinforcement Learning)</Option>
              <Option value="MNIST">MNIST Digit Duel (Supervised)</Option>
              <Option value="CIFAR">CIFAR-10 Image Battle (Unsupervised)</Option>
              <Option value="SAT Duel">SAT Duel (Accuracy & Speed)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="password" label="Password (Optional)">
            <Input.Password placeholder="Leave blank for public room" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default BattleCenter;
