import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';

import { AuthProvider } from './contexts/AuthContext'; // ✅ 导入

import AppHeader from './components/Header';
import Home from './pages/Home';
import ProblemHub from './pages/ProblemHub';
import ModelStudioPage from './pages/ModelStudioPage';
//import BattleCenter from './pages/BattleCenter';
import BattleCenterMock from './pages/BattleCenterMock';
//import BattleCenterGPT from './pages/BattleCenterGPT';
//import Forum from './pages/Forum';
import DeploymentShowCase from './pages/DeploymentShowCase';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomPage from './pages/RoomPage';
import { FriendsProvider } from './contexts/FriendsContext';
import ProposalDetailPage from './pages/ProposalDetailPage';
import About from './pages/About'; // ✅ 路径根据项目结构修改
import 'antd/dist/reset.css';

import GlobalMessageListener from './components/friends/GlobalMessageListener';
import TestModal from './components/TestModal';  // 添加这一行
const { Content } = Layout;

function App() {
  
  return (
    <AuthProvider>
      <FriendsProvider>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <AppHeader /> 
           
             <GlobalMessageListener /> {/* ✅ 全局消息监听 */}
            <Content style={{ padding: '24px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/problem-hub" element={<ProblemHub />} />
                <Route path="/model-studio" element={<ModelStudioPage />} />
                {/*<Route path="/battle" element={<BattleCenter />} />*/}
                <Route path="/battle" element={<BattleCenterMock />} />
                {/*<Route path="/forum" element={<Forum />} />*/}
                <Route path="/forum" element={<DeploymentShowCase />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/room/:roomId" element={<RoomPage />} />

                <Route path="/problem/:id" element={<ProposalDetailPage />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Content>
          </Layout>
        </Router>
      </FriendsProvider>
    </AuthProvider>
  );
}

export default App;
