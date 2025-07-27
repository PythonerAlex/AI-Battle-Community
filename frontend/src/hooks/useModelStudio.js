// src/hooks/useModelStudio.js

import { useEffect, useState } from 'react';
import { message } from 'antd';
import { API_BASE_URL } from '../config/wsConfig';

export default function useModelStudio() {
    const [models, setModels] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const token = localStorage.getItem('access_token');

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    // ✅ 获取模型列表
    const fetchModels = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/mine/`, { headers });
            const data = await res.json();
            setModels(data);
        } catch (err) {
            console.error('Failed to fetch models:', err);
            message.error('无法获取模型列表');
        }
    };

    // ✅ 上传模型
    const uploadModel = async (newModel) => {
        const formData = new FormData();
        formData.append('name', newModel.name);
        formData.append('problem_id', newModel.taskId);
        formData.append('is_public', newModel.isPublic ? 'true' : 'false');
        formData.append('model_file', newModel.fileObj); // 来自 Upload
        formData.append('dataset_id', newModel.datasetId);

        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/upload/`, {
                method: 'POST',
                headers, // 注意不传 Content-Type，会自动处理
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setModels((prev) => [data, ...prev]);
            message.success('模型上传成功');
        } catch (err) {
            console.error('Upload error:', err);
            message.error('上传失败');
        }
    };

    // ✅ 删除模型
    const deleteModel = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/${id}/`, {
                method: 'DELETE',
                headers,
            });

            if (res.status === 204) {
                setModels((prev) => prev.filter((m) => m.id !== id));
                message.success('模型已删除');
            } else {
                const data = await res.json();
                message.error(data.detail || '删除失败');
            }
        } catch (err) {
            console.error('Delete error:', err);
            message.error('删除模型失败');
        }
    };

    // ✅ 切换公开状态
    const togglePublic = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/${id}/toggle-public/`, {
                method: 'POST',
                headers,
            });

            if (res.ok) {
                const data = await res.json();
                setModels((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, is_public: data.is_public } : m))
                );
            } else {
                message.error('切换失败');
            }
        } catch (err) {
            console.error('Toggle error:', err);
            message.error('切换公开状态失败');
        }
    };
    const editModel = (id) => {
        console.log('TODO: 编辑模型:', id);
    };

    // ---------- 数据集 ----------
    const fetchDatasets = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/datasets/`, { headers });
            const data = await res.json();
            setDatasets(data);
        } catch (err) {
            console.error('Failed to fetch datasets:', err);
            message.error('无法获取数据集');
        }
    };
    const uploadDataset = async (newDataset) => {
        const formData = new FormData();
        formData.append('name', newDataset.name);
        formData.append('is_public', newDataset.isPublic ? 'true' : 'false');
        formData.append('file', newDataset.fileObj);  // ✅ 字段名应该为 file，确保和后端 serializer 匹配

        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/datasets/upload/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,  // ✅ 只保留这一项
                },
                body: formData,
            });

            if (!res.ok) throw new Error('Dataset upload failed');
            const data = await res.json();
            setDatasets((prev) => [data, ...prev]);
            message.success('数据集上传成功');
        } catch (err) {
            console.error('上传数据集失败:', err);
            message.error('数据集上传失败');
        }
    };


    const deleteDataset = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/datasets/${id}/`, {
                method: 'DELETE',
                headers,
            });

            if (res.status === 204) {
                setDatasets((prev) => prev.filter((d) => d.id !== id));
                message.success('数据集已删除');
            } else {
                const data = await res.json();
                message.error(data.detail || '删除失败');
            }
        } catch (err) {
            console.error('删除数据集失败:', err);
            message.error('删除数据集失败');
        }
    };

const toggleDatasetPublic = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/modelstudio/datasets/${id}/toggle-public/`, {
      method: 'POST',
      headers, // 这里 headers 应该包含 Authorization 头
    });

    if (res.ok) {
      const data = await res.json();
      setDatasets((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_public: data.is_public } : d))
      );
    } else {
      message.error('切换失败');
    }
  } catch (err) {
    console.error('Toggle error:', err);
    message.error('切换公开状态失败');
  }
};


    // 初始化加载
    useEffect(() => {
        fetchModels();
        fetchDatasets();
    }, []);

    return {
        models,
        datasets,
        togglePublic,
        deleteModel,
        uploadModel,
        editModel,
        fetchModels,
        fetchDatasets,
        uploadDataset,
        deleteDataset,
        toggleDatasetPublic,
    };
}

/*import { useState } from 'react';
import modelsMock from '../mock/modelsMock';

export default function useModelStudio() {
  const [models, setModels] = useState(modelsMock);

  const togglePublic = (id) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isPublic: !m.isPublic } : m
      )
    );
  };

  const deleteModel = (id) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
  };

  const editModel = (id, newData) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...newData } : m))
    );
  };

  const uploadModel = (newModel) => {
    setModels((prev) => [...prev, newModel]);
  };

  return {
    models,
    togglePublic,
    deleteModel,
    editModel,
    uploadModel,
  };
}
*/