// src/components/ModelStudio/ModelCard.js
import React from 'react';
import { Card, Switch, Typography, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ModelCard = ({ model, onTogglePublic, onDelete, onEdit }) => {
    const {
        id,
        name,
        //task_title,
        problem_title,
        created_at,
        is_public,
        metrics = {},
        dataset_name,
        //problem, // 可选：后端序列化 problem 对象
    } = model;


    const problemTitle = problem_title


    /* // ✅ 渲染 Metrics
     const renderMetrics = () => {
         // 如果 metrics 是数组（来自后端 ModelMetric）
         if (Array.isArray(metrics)) {
             return metrics.length > 0 ? (
                 metrics.map((m) => (
                     <Text key={m.id || `${m.metric_name}-${m.value}`}>
                         {m.metric_name || m.name}: {m.value}
                     </Text>
                 ))
             ) : (
                 <Text type="secondary">No metrics</Text>
             );
         }
 
         // 如果 metrics 是对象（前端临时状态）
         const entries = Object.entries(metrics || {});
         return entries.length > 0 ? (
             entries.map(([metricName, value]) => (
                 <Text key={metricName}>
                     {metricName}: {value}
                 </Text>
             ))
         ) : (
             <Text type="secondary">No metrics</Text>
         );
     };
 */
    // ✅ 渲染 Metrics（后端统一返回数组）
    const renderMetrics = () => {
        if (!metrics || metrics.length === 0) {
            return <Text type="secondary">No metrics</Text>;
        }

        return metrics.map((m, idx) => (
            <Text key={idx}>
                {m.metric_name}: {m.value}
            </Text>
        ));
    };

    return (
        <Card
  title={
    <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8 }}>
      {/* 标题 */}
      <span style={{ wordBreak: 'break-word' }}>{name}</span>

      {/* 紧贴标题的 Tag */}
      <Tag
        color="blue"
        style={{
          whiteSpace: 'normal',
          height: 'auto',
          maxWidth: 'none',   // 不再人为限制宽度
        }}
      >
        {problemTitle}
      </Tag>
    </div>
  }
            actions={[
                <Switch
                    key="switch"
                    checked={is_public}
                    onChange={() => onTogglePublic?.(id)}
                    checkedChildren="Public"
                    unCheckedChildren="Private"
                />,
                <EditOutlined key="edit" onClick={() => onEdit?.(id)} />,
                <DeleteOutlined key="delete" onClick={() => onDelete?.(id)} />,
            ]}
        >
            <Space direction="vertical">
                <Text type="secondary">
                    Created at:{' '}
                    {created_at ? new Date(created_at).toLocaleString() : 'Unknown'}
                </Text>

                {dataset_name && (
                    <Text>
                        📦 Linked Dataset: <strong>{dataset_name}</strong>
                    </Text>
                )}

                <Text strong>📊 Metrics:</Text>
                <Space direction="vertical" style={{ paddingLeft: 16 }}>
                    {renderMetrics()}
                </Space>
            </Space>
        </Card>
    );
};

export default ModelCard;

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

export default ModelCard;*/

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