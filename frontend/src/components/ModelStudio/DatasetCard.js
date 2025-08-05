// src/components/ModelStudio/DatasetCard.js
import React from 'react';
import { Card, Typography, Space, Tag, Tooltip, Switch } from 'antd';
import { DeleteOutlined, CloudDownloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DatasetCard = ({ dataset, onDelete, onToggleDatasetPublic }) => {
  const { id, name, description, file, created_at, is_public = false } = dataset;

  return (
    <Card
      title={name}
      extra={
        <Space>
          <Tag color={is_public ? 'blue' : 'gray'}>
            {is_public ? 'Public' : 'Private'}
          </Tag>

        </Space>
      }
      actions={[
        <Tooltip title={is_public ? 'Switch to Private' : 'Swtich to Public'} key="toggle">
          <Switch
            size="small"
            checked={is_public}
            onChange={() => onToggleDatasetPublic?.(id)}
            checkedChildren="Public"
            unCheckedChildren="Private"
          />
        </Tooltip>,

 /*       <Tooltip title="Download dataset" key="download">
          <a href={file} target="_blank" rel="noopener noreferrer">
            <CloudDownloadOutlined />
          </a>
        </Tooltip>,*/
        <Tooltip title="Delete dataset" key="delete">
          <DeleteOutlined onClick={() => onDelete?.(id)} />
        </Tooltip>,
      ]}
    >
      <Space direction="vertical">
        <Text type="secondary">Created at: {new Date(created_at).toLocaleString()}</Text>
        {description && <Text>{description}</Text>}
      </Space>
    </Card>
  );
};

export default DatasetCard;

/*import React from 'react';
import { Card, Typography, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined, CloudDownloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DatasetCard = ({ dataset, onDelete }) => {
  const { id, name, description, file, created_at, is_public=false} = dataset;

  return (
    <Card
      title={name}
      extra={
        <Tag color={is_public ? 'blue' : 'gray'}>
          {is_public ? 'Public' : 'Private'}
        </Tag>
      }
      actions={[
        <Tooltip title="download dataset">
          <a href={file} target="_blank" rel="noopener noreferrer">
            <CloudDownloadOutlined key="download" />
          </a>
        </Tooltip>,
        <Tooltip title="Delete dataset">
          <DeleteOutlined key="delete" onClick={() => onDelete?.(id)} />
        </Tooltip>,
      ]}
    >
      <Space direction="vertical">
        <Text type="secondary">Created at: {new Date(created_at).toLocaleString()}</Text>

        {description && <Text>{description}</Text>}
      </Space>
    </Card>
  );
};

export default DatasetCard;*/
