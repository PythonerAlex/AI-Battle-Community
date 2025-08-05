// src/hooks/useModelStudio.js

import { useEffect, useState } from 'react';
import { message } from 'antd';
import { API_BASE_URL } from '../config/wsConfig';

export default function useModelStudio() {
    const [models, setModels] = useState([]);
    const [datasets, setDatasets] = useState([]);

    const [editingModel, setEditingModel] = useState(null); // 当前正在编辑的模型
    const [isEditVisible, setIsEditVisible] = useState(false);

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

        if (newModel.datasetId) {
            formData.append('dataset_id', newModel.datasetId);
        }
        // ✅ 添加 metrics 字段，作为 JSON 字符串
        if (newModel.metrics && Object.keys(newModel.metrics).length > 0) {
            formData.append('metrics', JSON.stringify(newModel.metrics));
        }

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
        const model = models.find((m) => m.id === id);
        if (!model) return;
        setEditingModel(model);
        setIsEditVisible(true);
    };

    const saveEditedModel = async (updatedModel) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/mine/${updatedModel.id}/`, {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedModel),
            });

            if (!res.ok) throw new Error('Update failed');
            const data = await res.json();

            // 更新前端 state
            setModels((prev) =>
                prev.map((m) => (m.id === data.id ? data : m))
            );

            message.success('模型更新成功');
            setIsEditVisible(false);
            setEditingModel(null);
        } catch (err) {
            console.error(err);
            message.error('模型更新失败');
        }
    };


    /* const [availableMetrics, setAvailableMetrics] = useState([]);
     const fetchAvailableMetrics = async () => {
         try {
             const res = await fetch(`${API_BASE_URL}/api/modelstudio/available-metrics/`, {
                 method: 'GET',
                 headers,
             }
             );
             if (!res.ok) throw new Error('Failed to fetch metrics');
             const data = await res.json();
             setAvailableMetrics(data);
         } catch (err) {
             console.error('Error fetching metrics:', err);
             message.error('无法获取可用评估指标');
         }
     };*/
    const [metricCategories, setMetricCategories] = useState([]);

    const fetchMetricCategories = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/modelstudio/metric-categories/`, {
                method: 'GET',
                headers,
            });
            if (!res.ok) throw new Error('Failed to fetch metric categories');
            const data = await res.json();
            setMetricCategories(data); // 保存完整分类+metrics
        } catch (err) {
            console.error('Error fetching metric categories:', err);
            message.error('无法获取指标分类');
        }
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
        formData.append('description', newDataset.description || '');
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
        //fetchAvailableMetrics();
        fetchMetricCategories();
    }, []);

    return {
        models,
        datasets,
        //availableMetrics,
        metricCategories,
        editingModel,
        isEditVisible,
        setIsEditVisible,
        togglePublic,
        deleteModel,
        uploadModel,
        editModel,
        saveEditedModel,
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