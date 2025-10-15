import React, { useEffect } from 'react';
import { List, Input, Checkbox, Spin, Pagination, Typography } from 'antd';
import ModelCardPublic from './ModelCardPublic';
import useModelGallery from '../../hooks/useModelGallery';

const { Search } = Input;
const { Text } = Typography;

function ModelGallery({ problemId }) {
  const {
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
  } = useModelGallery(problemId);

  useEffect(() => {
    if (problemId) fetchGallery();
  }, [problemId, page, search, onlyMine]);

  if (!problemId) {
    return <Text type="secondary">No display at this moment</Text>;
  }

  return (
    <div style={{ padding: 20 }}>
      {/* 顶部筛选区 */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 20 }}>
        <Search
          placeholder="Search by model name/ user name / dataset name"
          onSearch={setSearch}
          allowClear
          style={{ width: 300 }}
        />
        <Checkbox checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)}>
          Only show my model
        </Checkbox>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={models}
          renderItem={(model) => (
            <List.Item>
              <ModelCardPublic model={model} />
            </List.Item>
          )}
        />
      )}

      <Pagination
        current={page}
        pageSize={12}
        total={total}
        onChange={(p) => setPage(p)}
        style={{ marginTop: 20, textAlign: 'center' }}
      />
    </div>
  );
}

export default ModelGallery;
