// src/hooks/useModelStudio.js
// src/hooks/useModelStudio.js
import { useEffect, useState } from 'react';
import { message } from 'antd';
import { API_BASE_URL } from '../config/wsConfig';

export default function useModelStudio() {
  const [models, setModels] = useState([]);
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
    //formData.append('is_public', newModel.isPublic);
    formData.append('is_public', newModel.isPublic ? 'true' : 'false');
    formData.append('model_file', newModel.fileObj); // 来自 Upload

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

  // 初始化加载
  useEffect(() => {
    fetchModels();
  }, []);

  return {
    models,
    togglePublic,
    deleteModel,
    uploadModel,
    fetchModels,
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