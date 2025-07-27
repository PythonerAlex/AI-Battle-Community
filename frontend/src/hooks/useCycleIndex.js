// src/hooks/useCycleIndex.js
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/wsConfig';

export default function useCycleIndex() {
  const [cycleIndex, setCycleIndex] = useState(null);
  const [status, setStatus] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [problem, setProblem] = useState(null);
  const [nextCycleStartTime, setNextCycleStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');
  const headers = token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : { 'Content-Type': 'application/json' };

  useEffect(() => {
    const fetchContext = async () => {
      try {
        // Step 1: 获取上下文
        const contextRes = await fetch(`${API_BASE_URL}/api/problemhub/active-context/`, { headers });
        if (!contextRes.ok) throw new Error(`Context HTTP ${contextRes.status}`);
        const contextData = await contextRes.json();

        // Step 2: 获取所有问题
        const problemsRes = await fetch(`${API_BASE_URL}/api/problemhub/all-problems/`, { headers });
        if (!problemsRes.ok) throw new Error(`Problems HTTP ${problemsRes.status}`);
        const problemsData = await problemsRes.json();

        // Step 3: 获取所有周期并排序
        const allCyclesRes = await fetch(`${API_BASE_URL}/api/problemhub/cycles/`, { headers });
        if (!allCyclesRes.ok) throw new Error(`Cycles HTTP ${allCyclesRes.status}`);
        const cyclesData = await allCyclesRes.json();
        const sortedCycles = [...cyclesData].sort(
          (a, b) => new Date(a.start_time) - new Date(b.start_time)
        );

        // Step 4: 根据 context index 获取当前和下一周期
        const index = contextData.cycle_index;
        const currCycle = index >= 0 && index < sortedCycles.length ? sortedCycles[index] : null;
        const nextCycle = index + 1 < sortedCycles.length ? sortedCycles[index + 1] : null;

        // Step 5: 找到当前周期对应的问题（只取一个获胜问题）
        const winningProblem = currCycle
          ? problemsData.find((p) => p.cycle?.id === currCycle.id)
          : null;

        setCycleIndex(index);
        setStatus(contextData.status);
        setCycle(currCycle);
        setProblem(winningProblem);
        setNextCycleStartTime(nextCycle?.start_time || null);
        setError(null);
      } catch (err) {
        console.error('Error in useCycleIndex:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContext();
  }, []);

  return { cycleIndex, status, cycle, problem, nextCycleStartTime, isLoading, error };
}




/*import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/wsConfig';

export default function useCycleIndex() {
  const [cycleIndex, setCycleIndex] = useState(null);
  const [status, setStatus] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [problem, setProblem] = useState(null);
  const [nextCycleStartTime, setNextCycleStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

const token = localStorage.getItem('access_token');
const headers = token
  ? {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  : { 'Content-Type': 'application/json' };

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const contextRes = await fetch(`${API_BASE_URL}/api/problemhub/active-context/`, { headers} );
        if (!contextRes.ok) throw new Error(`Context HTTP ${contextRes.status}`);
        const contextData = await contextRes.json();

        const problemsRes = await fetch(`${API_BASE_URL}/api/problemhub/all-problems/`, { headers} );
        if (!problemsRes.ok) throw new Error(`Problems HTTP ${problemsRes.status}`);
        const problemsData = await problemsRes.json();

        const allCyclesRes = await fetch(`${API_BASE_URL}/api/problemhub/cycles/`, { headers} );
        if (!allCyclesRes.ok) throw new Error(`Cycles HTTP ${allCyclesRes.status}`);
        const allCycles = await allCyclesRes.json();

        const index = contextData.cycle_index;
        const status = contextData.status;

        const currCycle = index >= 0 && index < allCycles.length ? allCycles[index] : null;
        const nextCycle = index + 1 < allCycles.length ? allCycles[index + 1] : null;

        const winningProblem = currCycle
          ? problemsData.find((p) => p.cycle.id === currCycle.id)
          : null;

        setCycleIndex(index);
        setStatus(status);
        setCycle(currCycle);
        setProblem(winningProblem);
        setNextCycleStartTime(nextCycle?.start_time || null);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContext();
  }, []);

  return { cycleIndex, status, cycle, problem, nextCycleStartTime, isLoading, error };
}
*/