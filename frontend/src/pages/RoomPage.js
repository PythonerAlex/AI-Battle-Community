import BattleDisplay from '../components/BattleDisplay';
import ChatBox from '../components/ChatBox';
import { useNavigate } from 'react-router-dom';  // 顶部导入
import { useAuth } from '../contexts/AuthContext';
import './RoomPage.css';
import React, { useState, useEffect } from 'react';

import StyledCard from '../components/StyledCard';
import RoomInfoHeader from '../components/RoomInfoHeader';
import UserCard from '../components/UserCard';
import ControlPanel from '../components/ControlPanel';


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
    //const [chatMessages, setChatMessages] = useState([]);


    //const [room, setRoom] = useState(mockRoom);
    const navigate = useNavigate(); // 函数组件内部

    const { roomId } = useParams();

    const handleSocketMessage = (data) => {
        const { type } = data;

        switch (type) {
            case 'room_update':
                setRoom(prev => {
                    const wasParticipant = prev?.participants || [];
                    const newParticipants = data.room.participants || [];

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
                navigate('/battle');
                break;

            case 'error':
                message.error(data.message);
                break;

            case 'chat':
                const newMessage = {
                    user: data.username,
                    text: data.message,
                    isSystem: data.isSystem === true,  // ✅ 自动识别系统消息
                    timestamp: data.timestamp || new Date().toISOString(),
                };

                setRoom(prev => ({
                    ...prev,
                    messages: [...(prev.messages || []).slice(-49), newMessage],
                }));
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

            <Content style={{ padding: '24px' }}>

                {/* === Top Info Section === */}
                <RoomInfoHeader room={room} />

                {/* === Users Section === */}
                {/*<Card title="Players in Room" style={{ marginBottom: 24 }}>*/}
                <StyledCard title="👥 Players in Room">
                    <Row gutter={[16, 16]}>
                        {room.users.map((user, idx) => (
                            <Col span={6} key={idx}>
                                <UserCard
                                    user={user}
                                    isHost={room.host === user.username}
                                    isCurrentUser={user.username === currentUser}
                                    isSelected={room.participants.includes(user.username)}
                                    modelFileName={room.modelFiles?.[user.username]}
                                    onToggleReady={() => toggleReady(user.username)}
                                    onUploadModel={(file) => uploadModel(file, room.id, user.username)}
                                    onRemoveModel={() => {
                                        setRoom(prev => {
                                            const newModelFiles = { ...prev.modelFiles };
                                            delete newModelFiles[currentUser];
                                            return { ...prev, modelFiles: newModelFiles };
                                        });
                                    }}
                                    onLeaveRoom={leaveRoom}
                                    navigate={navigate}
                                />
                            </Col>
                        ))}
                    </Row>

                </StyledCard>


                {/* === Battle Control Panel (host only) === */}
                {currentUser === room.host && (
                    <ControlPanel
                        room={room}
                        currentUser={currentUser}
                        updateRoomSetting={updateRoomSetting}
                        uploadTestFile={uploadTestFile}
                        setRoom={setRoom}
                        startBattle={startBattle}
                        kickUser={kickUser}
                    />
                )}
                {/* === Battle Visualization Panel === */}

                {/*<Card title="Battle Visualization" style={{ marginBottom: 24 }}>*/}

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
                {/* </Card>*/}


                {/* === Chat System === */}
                {/*<ChatBox
                    username={currentUser}
                    messages={chatMessages}
                   onSendMessage={(text) => sendChatMessage(text)
                />*/}
                {/*聊天信息统一保管到 room.messages 中*/}
                <ChatBox
                    username={currentUser}
                    messages={room.messages || []}
                    onSendMessage={sendChatMessage}
                />

                {/* === Remaining sections (to be added next) === */}
                <Divider />
                {/*<Title level={4}>Next: Upload Models, Battle Panel, Chat</Title>*/}
            </Content>
        </Layout>
    );
}

export default RoomPage;
