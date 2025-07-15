import React from 'react';
import { Typography, Button, Card, Space, Input, Tag, Switch, Tabs } from 'antd';
import ProblemList from './ProblemList';
import NewProblemModal from './NewProblemModal';
import PastRoundsPanel from './PastRoundsPanel';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

function CurrentCyclePanel({
    currentCycle,
    timeLeft,
    currentUser,
    modalVisible,
    setModalVisible,
    showOnlyMine,
    setShowOnlyMine,
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    tagFilterMode,
    setTagFilterMode,
    allTags,
    displayedProblems,
    handleVote,
    handleUnvote,
    votedIds,
    handleDelete,
    handleSubmit,
    showHistory,
    setShowHistory,
    cycles,
    problems,
}) {
    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3}>Problem Hub</Title>
                <Button
                    type="primary"
                    disabled={!currentUser}
                    onClick={() => setModalVisible(true)}
                >
                    New Problem
                </Button>
            </div>

            {/* Current cycle info */}
            <Card style={{ backgroundColor: '#f0f5ff', border: '1px solid #adc6ff', marginBottom: 24 }} bodyStyle={{ padding: 16 }}>
                <Title level={4} style={{ margin: 0, color: '#1d39c4' }}>🔁 {currentCycle.title}</Title>
                <Paragraph style={{ fontSize: '18px', fontWeight: 500, color: '#391085', marginTop: 4 }}>
                    ⏳ Ending in <span style={{ fontWeight: 'bold' }}>{timeLeft}</span>
                </Paragraph>
            </Card>

            {/* Filter controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Space>
                    <Title level={4} style={{ margin: 0 }}>Proposals</Title>
                    <label>
                        <input
                            type="checkbox"
                            checked={showOnlyMine}
                            onChange={(e) => setShowOnlyMine(e.target.checked)}
                            style={{ marginRight: 6 }}
                        />
                        Only show mine
                    </label>
                </Space>

                <Input.Search
                    placeholder="Search proposals..."
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 280 }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Space wrap>
                    {allTags.map((tag) => {
                        const isChecked = selectedTags.includes(tag);
                        return (
                            <Tag
                                key={tag}
                                style={{
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    border: isChecked ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                    backgroundColor: isChecked ? '#e6f7ff' : '#fafafa',
                                    color: isChecked ? '#1890ff' : 'inherit',
                                }}
                                onClick={() => {
                                    const nextTags = isChecked
                                        ? selectedTags.filter(t => t !== tag)
                                        : [...selectedTags, tag];
                                    setSelectedTags(nextTags);
                                }}
                            >
                                {tag}
                            </Tag>
                        );
                    })}
                </Space>

                <Space>
                    <span style={{ fontSize: 14 }}>Tag Filter Mode:</span>
                    <Switch
                        checked={tagFilterMode === 'AND'}
                        onChange={(checked) => setTagFilterMode(checked ? 'AND' : 'OR')}
                        checkedChildren="AND"
                        unCheckedChildren="OR"
                    />
                </Space>
            </div>

            {/* Proposal tabs */}
            <Tabs defaultActiveKey="all">
                <TabPane tab="All" key="all">
                    <ProblemList
                        problems={displayedProblems}
                        onVote={handleVote}
                        onUnvote={handleUnvote}
                        votedIds={votedIds}
                        currentUser={currentUser}
                        onDelete={handleDelete}
                    />
                </TabPane>
                <TabPane tab="Popular" key="popular">
                    <ProblemList
                        problems={[...displayedProblems].sort((a, b) => b.votes - a.votes)}
                        onVote={handleVote}
                        onUnvote={handleUnvote}
                        votedIds={votedIds}
                        currentUser={currentUser}
                        onDelete={handleDelete}
                    />
                </TabPane>
            </Tabs>

            {/* New problem modal */}
            <NewProblemModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmit}
            />

            {/* History toggle */}
            <Button type="dashed" onClick={() => setShowHistory(!showHistory)} style={{ marginTop: 24 }}>
                {showHistory ? 'Hide Past Rounds' : 'View Past Rounds'}
            </Button>

            {/* Past rounds summary */}


            {showHistory &&
                <PastRoundsPanel
                    showHistory={showHistory}
                    currentCycle={currentCycle}
                    cycles={cycles}
                    problems={problems}
                />
            }
        </div>
    );
}

export default CurrentCyclePanel;
