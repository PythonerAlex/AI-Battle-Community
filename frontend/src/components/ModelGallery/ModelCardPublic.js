// src/components/ModelStudio/ModelCardPublic.js
import React, { useState } from 'react';
import { Card, Button, Space, Tag, Tooltip } from 'antd';
import { DownloadOutlined, MessageOutlined } from '@ant-design/icons';
import ModelCommentPanel from './ModelCommentPanel';

function ModelCardPublic({ model }) {
    const [showComments, setShowComments] = useState(false);

    const dataset = model.dataset;
    const metrics = model.metrics || [];

    const handleDownload = async (fileUrl, filename) => {
        try {
            const res = await fetch(fileUrl, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
                },
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // 下载时的文件名
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Card
            title={`${model.name}`}
            extra={<span style={{ fontSize: 12 }}>by {model.owner}</span>}
            hoverable
            style={{ width: '100%' }}
        >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {/* 数据集信息 */}
                {dataset ? (
                    <div>
                        <strong>Dataset：</strong> {dataset.name}
                        <div style={{ marginTop: 4 }}>
                            {/*<Button
                icon={<DownloadOutlined />}
                size="small"
                href={dataset.file}
                target="_blank"
              >
                Download Dataset
              </Button>*/}
                            <Button
                                icon={<DownloadOutlined />}
                                size="small"
                                onClick={() => handleDownload(dataset.file, dataset.name)}
                            >
                                Download Dataset
                            </Button>

                        </div>
                    </div>
                ) : (
                    <div>No linked Dataset</div>
                )}

                {/* 模型下载按钮 */}
                <div>
                    <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => handleDownload(model.model_file, model.name)}
                    >
                        Download Model
                    </Button>
                </div>

                {/* 指标显示（最多两个主要指标） */}
                <div>
                    {metrics.slice(0, 2).map((m) => (
                        <Tooltip key={m.metric_name} title={`Metric value: ${m.value}`}>
                            <Tag color="blue" style={{ marginBottom: 4 }}>
                                {m.metric_name}: {m.value.toFixed(3)}
                            </Tag>
                        </Tooltip>
                    ))}
                </div>

                {/* 评论按钮 */}
                <Button
                    icon={<MessageOutlined />}
                    size="small"
                    onClick={() => setShowComments(true)}
                >
                    Comment
                </Button>
            </Space>

            {/* Drawer 评论面板 */}
            <ModelCommentPanel
                visible={showComments}
                onClose={() => setShowComments(false)}
                modelId={model.id}
            />
        </Card>
    );
}

export default ModelCardPublic;
