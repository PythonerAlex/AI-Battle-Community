import React, { useRef, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Typography } from 'antd';
import { SendOutlined, MessageOutlined } from '@ant-design/icons';
import StyledCard from './StyledCard';

const { TextArea } = Input;
const { Text } = Typography;

function ChatBox({ username, messages, onSendMessage }) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <StyledCard
      title={<><MessageOutlined /> Chat</>}
      style={{ maxHeight: 400, overflow: 'hidden', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
      bodyStyle={{ display: 'flex', flexDirection: 'column', height: 300, padding: 12 }}
    >
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}>
        <List
          dataSource={messages}
          renderItem={(item) => {
            const isSystem = item.isSystem === true;
            const isSelf = item.user === username || item.username === username;

            if (isSystem) {
              return (
                <List.Item style={{ justifyContent: 'center' }}>
                  <Text type="secondary" italic>{item.text}</Text>
                </List.Item>
              );
            }

            const displayName = item.user || item.username || "Unknown";

            return (
              <List.Item
                style={{
                  display: 'flex',
                  justifyContent: isSelf ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    backgroundColor: isSelf ? '#d6f5ff' : '#f0f0f0',
                    padding: '8px 12px',
                    borderRadius: 10,
                    display: 'inline-block',
                  }}
                >
                  <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 500 }}>
                    <Avatar size={20} style={{ backgroundColor: '#1890ff', marginRight: 6 }}>
                      {displayName[0]?.toUpperCase()}
                    </Avatar>
                    {displayName}
                  </div>
                  {/*<Text>{item.text}</Text>*/}
                  <Text>
                    {item.text.split(new RegExp(`(@${username})`, 'g')).map((part, idx) =>
                      part === `@${username}` ? (
                        <span key={idx} style={{ color: '#fa541c', fontWeight: 'bold' }}>{part}</span>
                      ) : (
                        part
                      )
                    )}
                  </Text>
                </div>
              </List.Item>
            );
          }}

        />
        <div ref={messagesEndRef} />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <TextArea
          rows={1}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleKeyPress}
          style={{ resize: 'none' }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} />
      </div>
    </StyledCard>
  );
}

export default ChatBox;

{/*import React, { useRef, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Typography } from 'antd';
import { SendOutlined, MessageOutlined } from '@ant-design/icons';
import StyledCard from '../components/StyledCard';

const { TextArea } = Input;
const { Text } = Typography;

function ChatBox({ username, messages, onSendMessage }) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <StyledCard
      title={<><MessageOutlined /> Chat</>}
      style={{ maxHeight: 400, overflow: 'hidden', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
      bodyStyle={{ display: 'flex', flexDirection: 'column', height: 300, padding: 12 }}
    >
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}>
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item
              style={{
                display: 'flex',
                justifyContent: item.user === username ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  backgroundColor: item.user === username ? '#d6f5ff' : '#f0f0f0',
                  padding: '8px 12px',
                  borderRadius: 10,
                  display: 'inline-block',
                }}
              >
                <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 500 }}>
                  <Avatar size={20} style={{ backgroundColor: '#1890ff', marginRight: 6 }}>
                    {item.user[0].toUpperCase()}
                  </Avatar>
                  {item.user}
                </div>
                <Text>{item.text}</Text>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <TextArea
          rows={1}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleKeyPress}
          style={{ resize: 'none' }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} />
      </div>
    </StyledCard>
  );
}

export default ChatBox;*/}
{/*}
import React, { useRef, useEffect, useState } from 'react';
import { Input, Button, List, Avatar, Typography, Divider } from 'antd';

const { TextArea } = Input;

function ChatBox({ username , messages = [], onSendMessage }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    if (onSendMessage) {
      onSendMessage(input.trim());
    }
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, marginTop: 24 }}>
      <Typography.Title level={4}>Live Chat</Typography.Title>
      <Divider />
      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12 }}>
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{item.user[0]}</Avatar>}
                title={
                  <span style={{ color: item.user === username ? '#1890ff' : 'inherit' }}>
                    {item.user}
                  </span>
                }
                description={item.text}
              />
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>
      <Input.Group compact>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Type a message..."
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: 'calc(100% - 90px)' }}
        />
        <Button type="primary" onClick={handleSend} style={{ width: 90 }}>
          Send
        </Button>
      </Input.Group>
    </div>
  );
}

export default ChatBox;
*/}


