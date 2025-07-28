// src/components/ModelStudio/ModelCard.js
import React from 'react';
import { Card, Switch, Typography, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ModelCard = ({ model, onTogglePublic, onDelete, onEdit }) => {
    const {
        id,
        name,
        task_title,
        created_at,
        is_public,
        metrics = {},
        dataset_name,
    } = model;

    return (
        <Card
            title={name}
            extra={
                <Tag color="blue">
                    {typeof task_title === 'object' ? task_title.name : task_title}
                </Tag>
            }
            actions={[
                <Switch
                    checked={is_public}
                    onChange={() => onTogglePublic(id)}
                    checkedChildren="Public"
                    unCheckedChildren="Private"
                />,
                <EditOutlined key="edit" onClick={() => onEdit?.(id)} />,
                <DeleteOutlined key="delete" onClick={() => onDelete?.(id)} />,
            ]}
        >
            <Space direction="vertical">
                <Text type="secondary">Created at: {created_at}</Text>
                {dataset_name && (
                    <Text >
                        📦 Linked Dataset: <strong>{dataset_name}</strong>
                    </Text>
                )}
                <Text strong>📊 Metrics:</Text>
                <Space direction="vertical" style={{ paddingLeft: 16 }}>
                    {Object.entries(metrics).map(([key, value]) => (
                        <Text key={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}:{' '}
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Text>
                    ))}
                </Space>

            </Space>
        </Card>
    );
};

export default ModelCard;

// src/components/ModelStudio/ModelCard.js
/*import React from 'react';
import { Card, Switch, Typography, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ModelCard = ({ model, onTogglePublic, onDelete, onEdit }) => {
  const {
    id,
    name,
    task_title,
    created_at,
    is_public,
    metrics = {},
  } = model;

  return (
    <Card
      title={name}
      //extra={<Tag color="blue">{task_title}</Tag>}
      extra={<Tag color="blue">{task_title.name}</Tag>}
      actions={[
        <Switch
          checked={is_public}
          onChange={() => onTogglePublic(id)}
          checkedChildren="公开"
          unCheckedChildren="私有"
        />,
        <EditOutlined key="edit" onClick={() => onEdit?.(id)} />,
        <DeleteOutlined key="delete" onClick={() => onDelete?.(id)} />,
      ]}
    >
      <Space direction="vertical">
        <Text type="secondary">创建时间: {created_at}</Text>
        {Object.entries(metrics).map(([key, value]) => (
          <Text key={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
          </Text>
        ))}
      </Space>
    </Card>
  );
};

export default ModelCard;*/