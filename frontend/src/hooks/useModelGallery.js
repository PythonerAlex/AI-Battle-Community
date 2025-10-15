import { useState } from 'react';
import { message } from 'antd';
import { API_BASE_URL } from '../config/wsConfig';
function useModelGallery(problemId) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);

  const fetchGallery = async () => {
    if (!problemId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `${API_BASE_URL}/api/modelstudio/gallery/${problemId}/?page=${page}&q=${search}&owner=${onlyMine ? 'me' : ''}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (!res.ok) throw new Error('Failed to load models');
      const data = await res.json();
      setModels(data.results || data); // DRF pagination 或普通列表
      setTotal(data.count || data.length || 0);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch model list');
    } finally {
      setLoading(false);
    }
  };

  return {
    models,
    loading,
    page,
    total,
    fetchGallery,
    setPage,
    search,
    setSearch,
    onlyMine,
    setOnlyMine,
  };
}

export default useModelGallery;
