// src/hooks/usePreviousWinner.js
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/wsConfig';

export default function usePreviousWinner(cycleIndex) {
  const [prevCycle, setPrevCycle] = useState(null);
  const [prevProblem, setPrevProblem] = useState(null);
  const [votes, setVotes] = useState(null);
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
    if (cycleIndex === null || cycleIndex <= 0) return;

    const fetchWinner = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/problemhub/winner/?index=${cycleIndex - 1}`,
          { headers }
        );
        if (!res.ok) throw new Error(`Winner HTTP ${res.status}`);
        const data = await res.json();

        setPrevCycle(data.cycle);
        setPrevProblem(data.problem);
        setVotes(data.votes);
      } catch (err) {
        console.error('Error in usePreviousWinner:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWinner();
  }, [cycleIndex]);

  return { prevCycle, prevProblem, votes, isLoading, error };
}
