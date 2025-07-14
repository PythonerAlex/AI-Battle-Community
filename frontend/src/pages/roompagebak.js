import BattleDisplay from '../components/BattleDisplay';
import ChatBox from '../components/ChatBox';
import { useNavigate } from 'react-router-dom';  // 顶部导入
import { useAuth } from '../contexts/AuthContext';
import './RoomPage.css';
import React, { useState, useEffect } from 'react';
import UserCard from '../components/UserCard';
import { useRoomSocket } from '../hooks/useRoomSocket';
//import TestMnistDuel from '../tasks/MNIST/TestMnistDuel';
import {
    Layout,
    Card,
    Row,        
    Col,
    Tag,
    Avatar,
    Typography,
    Button,
    Divider,
    Upload,
    Select,
    InputNumber,
    Switch,
    Input,
    Checkbox,

    message
} from 'antd';

import { UploadOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons';

import { useParams } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

function RoomPage() {
   
    const { user } = useAuth();
    const currentUser = user?.username;
    const [chatMessages, setChatMessages] = useState([]);


    //const [room, setRoom] = useState(mockRoom);
    const navigate = useNavigate(); // 函数组件内部

    const { roomId } = useParams();

    const handleSocketMessage = (data) => {
        switch (data.type) {
            case 'room_update':
                setRoom(prev => {
                    const wasParticipant = prev?.participants || [];
                    const newParticipants = data.room.participants || [];

                    // ✅ 当前用户刚刚被选中为参赛选手
                    if (
                        !wasParticipant.includes(currentUser) &&
                        newParticipants.includes(currentUser)
                    ) {
                        message.info("You have been selected to participate! Please Ready up and upload your model.");
                    }

                    return {
                        ...prev,
                        ...data.room,
                    };
                });
                break;

            case 'start':
                setRoom(prev => ({ ...prev, started: true }));
                break;

            case 'kick':
                message.warning("You have been kicked from the room.");
                navigate('/battle'); // 跳转回大厅
                break;

            case 'error':
                message.error(data.message);
                break;

            case 'chat':
                setChatMessages(prev => [...prev, {
                    user: data.username,
                    text: data.message,
                    type: 'user'
                }]);
                break;

            case 'mnist_result':
                message.success('Results received!');
                console.log("Ranking:", data.results);
                break;

            default:
                console.warn("Unhandled WebSocket message:", data);
        }
    };

    //const socketRef = useRoomSocket(roomId, handleSocketMessage);
    const { socketRef, sendChatMessage, uploadModel, uploadTestFile, startBattle, updateRoomSetting, kickUser, toggleReady,
        leaveRoom, } = useRoomSocket(roomId, handleSocketMessage, currentUser);


    //const [room, setRoom] = useState(null);
    //const [room, setRoom] = useState({});   // ✅ 而不是 useState(null)
    const [room, setRoom] = useState({ users: [], participants: [], modelFiles: {} });

    useEffect(() => {
        if (
            socketRef.current &&
            socketRef.current.readyState === 1 &&
            room &&
            currentUser === room.host &&
            !room.inited &&
            room.type && room.type !== "Unknown"
        ) {
            updateRoomSetting({
                type: room.type,
                rounds: room.rounds,
                locked: room.locked,
                password: room.password,
                mode: room.mode,
                firstPlayer: room.firstPlayer,
                participants: room.participants || [],
            });
            setRoom(prev => ({ ...prev, inited: true }));
        }
    }, [room, currentUser, socketRef, updateRoomSetting]);


    const handleKickUser = (targetUsername) => kickUser(targetUsername);



    if (!room) return <div>Loading room...</div>;
    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{ background: '#001529', padding: '0 24px' }}>
                <Title level={3} style={{ color: 'white', lineHeight: '64px', margin: 0 }}>
                    Battle Room: {room.id} | Type: {room.type}
                </Title>
            </Header>
            {/*<TestMnistDuel />*/}
            <Content style={{ padding: '24px' }}>
                {/* === Top Info Section === */}
                <Card style={{ marginBottom: 24 }}>
                    <Row justify="space-between">
                        <Col>
                            <Paragraph strong>
                                Host: <Tag color="blue">{room.host}</Tag>
                            </Paragraph>
                            <Paragraph>
                                Status: {room?.status ? (
                                    <Tag color={room.status === 'waiting' ? 'green' : 'red'}>
                                        {room.status.toUpperCase()}
                                    </Tag>
                                ) : (
                                    <Tag color="gray">Unknown</Tag>
                                )}
                            </Paragraph>
                            <Paragraph>
                                Locked:{" "}
                                <Tag color={room.locked ? 'red' : 'green'}>
                                    {room.locked ? 'Yes' : 'No'}
                                </Tag>
                            </Paragraph>
                            {room.locked && room.password && (
                                <Paragraph>
                                    Password: <Tag>{room.password}</Tag>
                                </Paragraph>
                            )}
                        </Col>

                    </Row>
                </Card>

                {/* === Users Section === */}
                <Card title="Players in Room" style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        {/*{room.users.map((user, idx) => (*/}
                        {room.users
                            .map(user => ({ ...user, isHost: user.username === room.host }))  // ✅ 添加 isHost 字段
                            .map((user, idx) => (
                                <Col span={6} key={idx}>
                                    <Card
                                        size="small"
                                        title={
                                            <>
                                                <Avatar icon={<UserOutlined />} />
                                                <span style={{ marginLeft: 8 }}>{user.username}</span>
                                                {user.isHost && <CrownOutlined style={{ color: '#faad14', marginLeft: 6 }} />}
                                            </>
                                        }
                                        extra={
                                            currentUser === room.host && user.username !== currentUser ? (
                                                <Button type="link" danger size="small" onClick={() => handleKickUser(user.username)}>
                                                    Kick
                                                </Button>
                                            ) : null
                                        }

                                    >
                                        <Tag color={user.status === 'Uploaded' ? 'green' : 'red'}>{user.status}</Tag>
                                        <br />
                                        {user.isReady ? <Tag color="blue">Ready</Tag> : <Tag>Not Ready</Tag>}

                                        {user.username === currentUser && (
                                            <>
                                                <Button
                                                    size="small"
                                                    type={user.isReady ? 'default' : 'primary'}
                                                    onClick={() => toggleReady(user.username)}
                                                    style={{ marginTop: 8 }}
                                                >
                                                    {user.isReady ? 'Cancel Ready' : 'Ready'}
                                                </Button>

                                                {/* Leave Room 按钮（所有人都能看到） */}
                                                <Button
                                                    size="small"
                                                    danger
                                                    onClick={() => {
                                                        leaveRoom();
                                                        message.info('You have left the room.');
                                                        navigate('/battle');
                                                    }}
                                                    style={{ marginTop: 8 }}
                                                >
                                                    Leave Room
                                                </Button>
                                                {/* ✅ 新增：显示是否被选中 */}
                                                {room.participants?.includes(user.username) && (
                                                    <Tag color="blue" className="glowing-tag" style={{ marginTop: 8 }}>
                                                        Selected
                                                    </Tag>
                                                )}

                                            </>
                                        )}

                                        {/* Upload model button (only enabled when model battle mode is relevant) */}
                                        {room.mode !== 'human-vs-human' && user.username === currentUser && (
                                            <Upload
                                                accept=".h5,.pt"
                                                beforeUpload={async (file) => {
                                                    try {
                                                        await uploadModel(file, room.id, currentUser);   // ✅ 实际上传
                                                        const filename = file.name;

                                                        // ✅ 更新房间中的模型映射（保持为字符串）
                                                        setRoom(prev => ({
                                                            ...prev,
                                                            modelFiles: {
                                                                ...prev.modelFiles,
                                                                [currentUser]: filename
                                                            }
                                                        }));

                                                        message.success(`Model "${filename}" uploaded successfully`);
                                                    } catch (err) {
                                                        message.error("Model upload failed");
                                                        console.error(err);
                                                    }

                                                    return false; // ❌ 阻止默认上传行为
                                                }}
                                                onRemove={() => {
                                                    // ✅ 删除模型文件名（设为 undefined）
                                                    setRoom(prev => {
                                                        const newModelFiles = { ...prev.modelFiles };
                                                        delete newModelFiles[currentUser];
                                                        return {
                                                            ...prev,
                                                            modelFiles: newModelFiles,
                                                        };
                                                    });
                                                }}
                                                showUploadList={{
                                                    showRemoveIcon: true,
                                                }}
                                                fileList={
                                                    room.modelFiles?.[currentUser]
                                                        ? [{
                                                            uid: currentUser,
                                                            name: room.modelFiles[currentUser],
                                                            status: 'done',
                                                        }]
                                                        : []
                                                }
                                            >
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    style={{ marginTop: 8 }}
                                                    disabled={
                                                        room.modelFiles?.[currentUser] ||
                                                        room.mode === 'human-vs-human' ||
                                                        (room.mode === 'human-vs-model' && currentUser === room.firstPlayer)
                                                    }
                                                >
                                                    Upload Model
                                                </Button>
                                            </Upload>


                                        )}

                                        {currentUser === room.host && (
                                            <Checkbox
                                                checked={room.participants?.includes(user.username)}
                                                onChange={(e) => {
                                                    const updatedParticipants = e.target.checked
                                                        ? [...(room.participants || []), user.username]
                                                        : (room.participants || []).filter(name => name !== user.username);
                                                    //setRoom(prev => ({ ...prev, participants: updatedParticipants }));

                                                    updateRoomSetting({ participants: updatedParticipants });
                                                }}
                                                style={{ marginTop: 8 }}
                                            >
                                                Participant
                                            </Checkbox>
                                        )}
                                    </Card>
                                </Col>
                            ))}
                    </Row>
                </Card>


                {/* === Battle Control Panel (host only) === */}
                {currentUser === room.host && (
                    <Card title="Battle Control Panel" style={{ marginBottom: 24 }}>
                        <Row gutter={16} align="middle">
                            {/* Room Lock Switch */}
                            <Col span={6}>
                                <Paragraph strong>Room Lock:</Paragraph>
                                <Switch
                                    checked={room.locked}
                                    onChange={(checked) => {
                                        //setRoom(prev => ({ ...prev, locked: checked }));
                                        updateRoomSetting({ locked: checked });  // ✅ 使用封装函数代替 socketRef 发送
                                    }}
                                    checkedChildren="Locked"
                                    unCheckedChildren="Open"
                                />
                            </Col>

                            {/* Password */}
                            <Col span={12}>
                                <Paragraph strong>Password:</Paragraph>
                                <Input.Password
                                    placeholder="Optional password"
                                    value={room.password}
                                    onChange={(e) => {
                                        const pwd = e.target.value;
                                        //setRoom({ ...room, password: pwd });

                                        updateRoomSetting({ password: pwd })
                                    }}
                                />
                            </Col>

                            {/* Task Type */}
                            <Col span={8}>
                                <Paragraph strong>Task:</Paragraph>
                                <Select
                                    value={room.type}
                                    style={{ width: '100%' }}
                                    onChange={(value) => {
                                        //setRoom({ ...room, type: value });

                                        updateRoomSetting({ type: value });
                                    }}
                                >
                                    <Select.Option value="ConnectX">ConnectX</Select.Option>
                                    <Select.Option value="MNIST">MNIST Duel</Select.Option>
                                    <Select.Option value="CIFAR">CIFAR Classify</Select.Option>
                                    <Select.Option value="SAT">SAT Duel</Select.Option>
                                </Select>
                            </Col>

                            {/* Rounds */}
                            <Col span={6}>
                                <Paragraph strong>Rounds:</Paragraph>
                                <InputNumber
                                    min={1}
                                    max={10}
                                    value={room.rounds}
                                    onChange={(value) => updateRoomSetting({ rounds: value })}

                                />
                            </Col>

                            {/* Battle Mode */}
                            <Col span={8}>
                                <Paragraph strong>Battle Mode:</Paragraph>
                                <Select
                                    value={room.mode || 'model-vs-model'}
                                    style={{ width: '100%' }}
                                    onChange={(value) => {

                                        updateRoomSetting({ mode: value })
                                    }}
                                >
                                    <Select.Option value="model-vs-model">Model vs Model</Select.Option>
                                    <Select.Option value="human-vs-model">Human vs Model</Select.Option>
                                    <Select.Option value="human-vs-human">Human vs Human</Select.Option>
                                </Select>
                            </Col>

                            {/* First Player */}
                            <Col span={8}>
                                <Paragraph strong>First Player:</Paragraph>
                                <Select
                                    value={room.firstPlayer}
                                    style={{ width: '100%' }}
                                    onChange={(value) => {
                                        //setRoom({ ...room, firstPlayer: value });
                                        updateRoomSetting({ firstPlayer: value })
                                    }}
                                >
                                    {room.users.map((u) => (
                                        <Select.Option key={u.username} value={u.username}>
                                            {u.username}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={24}>
                                <Paragraph strong>Upload Test Set (for this task):</Paragraph>
                                <Upload
                                    accept=".npz"
                                    beforeUpload={async (file) => {
                                        try {
                                            await uploadTestFile(file, room.id); // ✅ 调用钩子函数
                                            setRoom(prev => ({ ...prev, testFile: file }));
                                            message.success(`Test set "${file.name}" uploaded`);
                                        } catch (err) {
                                            message.error("Failed to upload test file");
                                            console.error(err);
                                        }
                                        return false;
                                    }}
                                    onRemove={() => {
                                        // ✅ 用户点击删除按钮时，清除 testFile
                                        setRoom(prev => ({ ...prev, testFile: null }));
                                        message.info("Test set removed. Default dataset will be used.");
                                    }}
                                    showUploadList={true}
                                    fileList={room.testFile ? [room.testFile] : []}
                                >
                                    <Button icon={<UploadOutlined />}>Select Test Set</Button>
                                </Upload>
                            </Col>

                            {/* Control Buttons */}
                            <Col span={10} style={{ display: 'flex', gap: 8 }}>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        if (!room.testFile) {
                                            message.warning('If You dont upload testSet, I will use the default testSet');
                                            //return;
                                        }

                                        const notReady = room.users.some(u =>
                                            (room.participants || []).includes(u.username) &&
                                            (!u.isReady || u.status !== 'Uploaded')
                                        );

                                        if (notReady) {
                                            //messageApi.warning('Some participants are not ready or did not upload a model.');
                                            window.alert('Some participants are not ready or did not upload a model.');
                                            //toast.warning("Some participants are not ready or did not upload a model.");
                                            return;
                                        }
                                        //startBattle();

                                        // ✅ 强制重置 started → false，再设为 true，触发 useEffect
                                        setRoom(prev => ({ ...prev, started: false }));
                                        setTimeout(() => {
                                            setRoom(prev => ({ ...prev, started: true }));
                                            startBattle();  // ✅ 你原来的 socket 消息也仍可发送
                                        }, 50);
                                    }}

                                >
                                    Start Battle
                                </Button>

                            </Col>
                        </Row>
                    </Card>

                )}

                {/* === Battle Visualization Panel === */}

                <Card title="Battle Visualization" style={{ marginBottom: 24 }}>
                    <BattleDisplay
                        type={room.type}
                        start={room.started}
                        firstPlayer={room.firstPlayer}
                        battleMode={room.mode}
                        participants={room.participants}
                        rounds={room.rounds}
                        testFileName={room.testFile?.name}     // ✅ 正确：传入 testFileName
                        modelFiles={room.modelFiles || {}}     // ✅ 正确：传入 modelFiles
                        roomId={room.id}
                    />
                </Card>


                {/* === Chat System === */}
                <ChatBox
                    username={currentUser}
                    messages={chatMessages}
                    onSendMessage={(text) => sendChatMessage(text)}
                />



                {/* === Remaining sections (to be added next) === */}
                <Divider />
                {/*<Title level={4}>Next: Upload Models, Battle Panel, Chat</Title>*/}
            </Content>
        </Layout>
    );
}

export default RoomPage;
