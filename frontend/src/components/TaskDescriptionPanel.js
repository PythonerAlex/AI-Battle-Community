// src/components/TaskDescriptionPanel.js
import React from 'react';
import { Alert } from 'antd';
import { taskDescriptions } from '../registry/taskDescriptions';

function TaskDescriptionPanel({ taskType }) {
  const description = taskDescriptions[taskType];

  if (!description) return null;

  return (
    <Alert
      message={`📘 ${taskType} Task Description`}
      description={description}
      type="info"
      showIcon
      style={{ marginBottom: 16, whiteSpace: 'pre-wrap' }}
    />
  );
}

export default TaskDescriptionPanel;
