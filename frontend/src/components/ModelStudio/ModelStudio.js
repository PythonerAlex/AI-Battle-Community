// src/components/ModelStudio/ModelStudio.js

import React, { useState } from 'react';
import { Button, Typography, List, Divider, Space } from 'antd';
import { UploadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import useModelStudio from '../../hooks/useModelStudio';
import ModelCard from './ModelCard';
import DatasetCard from './DatasetCard';
import UploadModelModal from './UploadModelModal';
import UploadDatasetModal from './UploadDatasetModal';
import EditModelModal from './EditModelModal';

const { Title } = Typography;

const ModelStudio = ({ prevProblem }) => {
  const {
    models,
    datasets,
    //availableMetrics,
    metricCategories,
    isEditVisible,
    setIsEditVisible,
    saveEditedModel,
    editingModel,
    togglePublic,
    deleteModel,
    editModel,
    uploadModel,
    uploadDataset,
    deleteDataset,
    toggleDatasetPublic,
  } = useModelStudio();

  const [isUploadModelVisible, setIsUploadModelVisible] = useState(false);
  const [isUploadDatasetVisible, setIsUploadDatasetVisible] = useState(false);

  return (
    <div style={{ padding: '16px' }}>
      {/*<Title level={3}>🔧 我的模型</Title>*/}

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={() => setIsUploadDatasetVisible(true)}
        >
          Upload new Dataset
        </Button>

        <Button

          icon={<UploadOutlined />}
          onClick={() => setIsUploadModelVisible(true)}
        >
          Upload new Model
        </Button>


      </Space>
      <Divider>📦 My models</Divider>
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

      <Divider>📦 My datasets</Divider>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={datasets}
        renderItem={(item) => (
          <List.Item>
            <DatasetCard dataset={item} onDelete={deleteDataset} onToggleDatasetPublic={toggleDatasetPublic}/>
          </List.Item>
        )}
      />


      <UploadModelModal
        visible={isUploadModelVisible}
        onCancel={() => setIsUploadModelVisible(false)}
        onUpload={uploadModel}
        problem={prevProblem}
        datasets={datasets} // ✅ 将数据集列表传入以供选择
        //metricOptions={availableMetrics}
        metricCategories={metricCategories}
        
      />

      <UploadDatasetModal
        visible={isUploadDatasetVisible}
        onCancel={() => setIsUploadDatasetVisible(false)}
        onUpload={uploadDataset}
      />
      <EditModelModal
      visible={isEditVisible}
      onCancel={() => setIsEditVisible(false)}
      onSave={saveEditedModel}
      model={editingModel}
      datasets={datasets}
    />
    </div>
    
  );

};

export default ModelStudio;

/*
import React, { useState } from 'react';
import { Button, Typography, List,Divider } from 'antd';
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

      <Divider>📦 我的数据集</Divider>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={datasets}
        renderItem={(item) => (
          <List.Item>
            <DatasetCard
              dataset={item}
              onDelete={deleteDataset}
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

*/

