// src/components/ModelStudio/ModelStudio.js
import React, { useState } from 'react';
import { Button, Typography, List } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import useModelStudio from '../../hooks/useModelStudio';
import ModelCard from './ModelCard';
import UploadModelModal from './UploadModelModal'; // ✅ 新引入
//import usePreviousWinner from '../../hooks/usePreviousWinner'; // ✅ 确保引入

const { Title } = Typography;

const ModelStudio = ({ prevProblem }) => {
  const {
    models,
    togglePublic,
    deleteModel,
    editModel,
    uploadModel,
  } = useModelStudio();

  const [isUploadVisible, setIsUploadVisible] = useState(false);

  const handleUploadClick = () => {
    setIsUploadVisible(true);
  };


  return (
    <div style={{ padding: '16px' }}>
      <Title level={3}>🔧 我的模型</Title>

      <Button
        type="primary"
        icon={<UploadOutlined />}
        style={{ marginBottom: 16 }}
        onClick={handleUploadClick}
      >
        上传新模型
      </Button>

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={models}
        renderItem={(item) => (
          <List.Item>
            <ModelCard
              model={item}
              onTogglePublic={togglePublic}
              onDelete={deleteModel}
              onEdit={editModel}
            />
          </List.Item>
        )}
      />

      <UploadModelModal
        visible={isUploadVisible}
        onCancel={() => setIsUploadVisible(false)}
        onUpload={uploadModel}
        problem={prevProblem} // ✅ 传入当前任务
      />
    </div>
  );
};

export default ModelStudio;




/*import React, { useState } from 'react';
import { Card, List, Switch, Button, Typography, Space, Tag } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import modelsMock from '../../mock/modelsMock';

const { Title, Text } = Typography;

const ModelStudio = () => {
  const [models, setModels] = useState(modelsMock);

  const togglePublic = (id) => {
    const updated = models.map((m) =>
      m.id === id ? { ...m, isPublic: !m.isPublic } : m
    );
    setModels(updated);
  };

  return (
    <div style={{ padding: '16px' }}>
      <Title level={3}>🔧 我的模型</Title>
      <Button type="primary" icon={<UploadOutlined />} style={{ marginBottom: 16 }}>
        上传新模型
      </Button>

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={models}
        renderItem={(item) => (
          <List.Item>
            <Card
              title={item.name}
              extra={<Tag color="blue">{item.task}</Tag>}
              actions={[
                <Switch
                  checked={item.isPublic}
                  onChange={() => togglePublic(item.id)}
                  checkedChildren="公开"
                  unCheckedChildren="私有"
                />,
                <EditOutlined key="edit" />,
                <DeleteOutlined key="delete" />,
              ]}
            >
              <Space direction="vertical">
                <Text type="secondary">创建时间: {item.createdAt}</Text>
                <Text>Accuracy: {item.metrics.accuracy}</Text>
                <Text>F1 Score: {item.metrics.f1}</Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ModelStudio;

*/