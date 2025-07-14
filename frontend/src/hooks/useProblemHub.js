import { useState } from 'react';
import { API_BASE_URL } from '../config/wsConfig';
import{message} from 'antd';

const useProblemHub = () => {
  const [cycles, setCycles] = useState([]);
  const [problems, setProblems] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [justEndedCycle, setJustEndedCycle] = useState(null);
  const [nextCycle, setNextCycle] = useState(null);
  const [votedIds, setVotedIds] = useState(new Set());

  const token = localStorage.getItem('access_token');
  const headers = token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : { 'Content-Type': 'application/json' };

  async function fetchCycles() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problemhub/cycles/`, { headers });
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setCycles(data);

      const now = new Date();

      const current = data.find(
        (c) => new Date(c.start_time) <= now && now <= new Date(c.end_time)
      );
      setCurrentCycle(current || null);

      const ended = data
        .filter((c) => new Date(c.end_time) < now)
        .sort((a, b) => new Date(b.end_time) - new Date(a.end_time));
      setJustEndedCycle(!current && ended.length > 0 ? ended[0] : null);

      const future = data
        .filter((c) => new Date(c.start_time) > now)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      setNextCycle(future.length > 0 ? future[0] : null);
    } catch (error) {
      console.error('Failed to fetch cycles:', error);
    }
  }

  async function fetchCurrentProblems() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problemhub/current/`, { headers });
      const data = await res.json();

      setProblems(Array.isArray(data.problems) ? data.problems : []);
      setCurrentCycle(data.cycle || null);
    } catch (error) {
      console.error('Failed to fetch current problems:', error);
    }
  }

  async function submitProblem(problem) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problemhub/submit/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(problem),
      });
      return await res.json();
    } catch (error) {
      console.error('Failed to submit problem:', error);
      return null;
    }
  }

async function voteProblem(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/problemhub/vote/${id}/`, {
      method: 'POST',
      headers,
    });
    const data = await res.json();

    if (res.ok) {
      setVotedIds((prev) => new Set(prev).add(id));
      setProblems((prev) =>
        prev.map((p) => p.id === id ? { ...p, votes: p.votes + 1 } : p)
      );
    } else {
      // 后端返回“已经投票”
      message.warning(data.detail || 'Already voted.');
    }
  } catch (error) {
    console.error('Failed to vote:', error);
    message.error('Vote failed');
  }
}

async function unvoteProblem(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/problemhub/unvote/${id}/`, {
      method: 'POST',
      headers,
    });
    const data = await res.json();

    if (res.ok) {
      setVotedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setProblems((prev) =>
        prev.map((p) => p.id === id ? { ...p, votes: Math.max(0, p.votes - 1) } : p)
      );
    } else {
      message.warning(data.detail || 'Unvote failed.');
    }
  } catch (error) {
    console.error('Failed to unvote:', error);
    message.error('Unvote failed');
  }
}

async function fetchVotedProblems() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/problemhub/voted-ids/`, { headers });
    const data = await res.json();
    if (Array.isArray(data)) {
      setVotedIds(new Set(data));
    }
  } catch (error) {
    console.error('Failed to fetch voted problems:', error);
  }
}

  async function fetchAllProblems() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/problemhub/all-problems/`, { headers });
    const data = await res.json();
    setProblems(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Failed to fetch all problems:', error);
  }
}

async function deleteProposal(problemId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/problemhub/proposal/${problemId}/`, {
      method: 'DELETE',
      headers,
    });

    if (res.status === 204) {
      message.success('Proposal deleted successfully.');
      // 可选：从本地 state 中移除该问题
      setProblems((prev) => prev.filter((p) => p.id !== problemId));
    } else {
      const data = await res.json();
      message.error(data.detail || 'Failed to delete proposal.');
    }
  } catch (error) {
    console.error('Failed to delete proposal:', error);
    message.error('Failed to delete proposal.');
  }
}


  return {
    cycles,
    problems,
    currentCycle,
    justEndedCycle,
    nextCycle,
    votedIds,
    fetchCycles,
    fetchCurrentProblems,
    fetchAllProblems,
    fetchVotedProblems,
    submitProblem,
    voteProblem,
    unvoteProblem,
    deleteProposal,
    
    setProblems, // ✅ 新增暴露，便于 ProblemHub.js 中直接更新 UI

  };
};

export default useProblemHub;
