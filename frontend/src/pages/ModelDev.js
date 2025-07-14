import React from 'react';
import { Typography, Card, Button, Alert } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function ModelDev() {
  //const notebookUrl = "http://localhost:8888/voila/render/user_notebooks/model_dev.ipynb"; // Example URL
  //const notebookUrl = "http://localhost:8890/";
  const notebookUrl = "http://127.0.0.1:8890/notebooks/projects/embeded_MLEnv/frontend/src/CourseDoc/mnist_course_outline.ipynb";
  return (
    <div style={{ padding: '40px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Model Design & Training</Title>
      <Paragraph style={{ textAlign: 'center', maxWidth: 700, margin: 'auto' }}>
        Use the embedded notebook to design, train, and validate models. You can test models such as handwritten digit recognition and image classification, or upload your own neural network designs.
      </Paragraph>

      {/*<Card
        title="My Notebook Development Environment"
        bordered
        style={{ marginTop: 40 }}
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button icon={<EditOutlined />}>Edit Model</Button>
            <Button icon={<SaveOutlined />} type="primary">Save Model</Button>
          </div>
        }
      >
        <Alert
          type="info"
          message="Note: For the best experience, Google Chrome or Edge browser is recommended."
          showIcon
          style={{ marginBottom: 20 }}
        />*/}
      <iframe
        src={notebookUrl}
        title="Jupyter Notebook"
        width="100%"
        height="700px"
        frameBorder="0"
        onError={() => console.error("Notebook failed to load")}
        style={{ border: '1px solid #ccc', borderRadius: '6px' }}
      />
      {/*</div></Card>*/}
    </div>
  );
}

export default ModelDev;

