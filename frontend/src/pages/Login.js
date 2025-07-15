import React from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/wsConfig';

const { Title } = Typography;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = (values) => {
    fetch(`${API_BASE_URL}/api/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
      .then(res => {
        if (!res.ok) throw new Error('Login failed');
        return res.json();
      })
      .then(data => {
        login(data.access, data.refresh, data.username);
        message.success('Login successful!');
        //alert("Login successful");
        navigate('/');
      })
      .catch(() => alert('Incorrect username or password!'));
  };


  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: 400 }}>
        <Title level={3}>User Login</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Log In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
