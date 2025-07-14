import React from 'react';
import { Popover, Badge } from 'antd';
import { UsergroupAddOutlined } from '@ant-design/icons';
import FriendsSidebar from './friends/FriendsSidebar'; // ✅ 路径根据你的实际放置调整
import { useFriends } from '../contexts/FriendsContext';

import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ✅ 导入

const { Header } = Layout;



function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pendingRequests } = useFriends();
  //const username = user?.username;
  //const [messageApi, contextHolder] = message.useMessage(); // ✅ 引入 useMessage

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      message.success('已退出登录',2);
      //message.open({ type: 'success', content: '已退出登录' });
      //messageApi.open({ type: 'success', content: '已退出登录' });
      navigate('/');
      //window.location.reload(); // ✅ 可选，确保状态/菜单完全刷新
    } else {
      message.info(`点击了菜单项：${key}`);
    }
  };


  const userMenu = (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key="profile">User profile</Menu.Item>
      <Menu.Item key="level">Honor and Rank</Menu.Item>
      <Menu.Item key="friends">Friends&Community</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">Quit</Menu.Item>
    </Menu>
  );

  return (

    <Header style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']} onClick={(e) => navigate(`/${e.key === 'home' ? '' : e.key}`)} style={{ flex: 1 }}>
        <Menu.Item key="home">Home</Menu.Item>
        <Menu.Item key="problem-hub">Problem Hub</Menu.Item>
        <Menu.Item key="model-dev">Model Design and Training</Menu.Item>
        <Menu.Item key="battle">Model Battle</Menu.Item>
        <Menu.Item key="forum">Forum</Menu.Item>
      </Menu>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Popover
          placement="bottomRight"
          title="My Friends"
          content={<FriendsSidebar />}
          trigger="click"
        >
          <Badge count={pendingRequests.length}>
            <UsergroupAddOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }} />
          </Badge>
        </Popover>

        {isAuthenticated ? (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <span style={{ color: 'white', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 6 }} />
              {user?.username}
            </span>
          </Dropdown>
        ) : (
          <Menu theme="dark" mode="horizontal" onClick={(e) => navigate(`/${e.key}`)} selectable={false}>
            <Menu.Item key="login">Login</Menu.Item>
            <Menu.Item key="register">Register</Menu.Item>
          </Menu>
        )}
      </div>

    </Header>
   
  );
}

export default AppHeader;
