// src/pages/LearningNotebook.jsx

import React from 'react';
import { Card, Button } from 'antd';

const LearningNotebook = () => {
  const colabUrl = "https://colab.research.google.com/drive/YOUR_NOTEBOOK_ID";
  const jupyterLiteUrl = "https://jupyterlite.github.io/demo/repl/index.html";
  const huggingFaceApp = "https://huggingface.co/spaces/YOUR_USERNAME/YOUR_APP";

  return (
    <div style={{ padding: 24 }}>
      <Card title="JupyterLite Notebook (Editable Code)" bordered={false} style={{ marginBottom: 24 }}>
        <iframe src={jupyterLiteUrl} width="100%" height="600" title="JupyterLite" style={{ border: '1px solid #ccc' }}></iframe>
      </Card>

      <Card title="Full Training Experience (Google Colab)" bordered={false} style={{ marginBottom: 24 }}>
        <Button type="primary" href={colabUrl} target="_blank">
          Open Training Notebook in Colab
        </Button>
      </Card>

      <Card title="Model Interaction (Gradio App)" bordered={false}>
        <iframe src={huggingFaceApp} width="100%" height="600" title="GradioApp" style={{ border: '1px solid #ccc' }}></iframe>
      </Card>
    </div>
  );
};

export default LearningNotebook;