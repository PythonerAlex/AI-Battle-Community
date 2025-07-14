// src/components/battles/useConnectXGame.js
import { useState, useEffect, useCallback } from 'react';

const ROWS = 6;
const COLS = 7;
//mockMoves
export function useConnectXGame({ start, mockMoves }) {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [moveIndex, setMoveIndex] = useState(0);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [isReplaying, setIsReplaying] = useState(true);

  const checkWinner = useCallback((board) => {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const player = board[row][col];
        if (!player) continue;
        for (let [dr, dc] of directions) {
          const cells = [[row, col]];
          for (let k = 1; k < 4; k++) {
            const r = row + dr * k;
            const c = col + dc * k;
            if (
              r >= 0 && r < ROWS &&
              c >= 0 && c < COLS &&
              board[r][c] === player
            ) {
              cells.push([r, c]);
            } else break;
          }
          if (cells.length === 4) {
            return { winner: player, cells };
          }
        }
      }
    }
    const isDraw = board.every(row => row.every(cell => cell));
    if (isDraw) return { winner: 'Draw', cells: [] };
    return null;
  }, []);

const makeMove = useCallback((player, col) => {
  setBoard(prevBoard => {
    const newBoard = prevBoard.map(row => [...row]);
    for (let row = 0; row < ROWS; row++) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = player;
        break;
      }
    }
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningCells(result.cells);
      setIsReplaying(false);
    }
    return newBoard;
  });
}, [checkWinner]);
  useEffect(() => {
    if (!start || winner || moveIndex >= mockMoves.length || !isReplaying) return;
    const timer = setTimeout(() => {
      const { player, col } = mockMoves[moveIndex];
      makeMove(player, col);
      setMoveIndex(prev => prev + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [start, winner, moveIndex, isReplaying, makeMove, mockMoves]);

  const reset = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setMoveIndex(0);
    setWinner(null);
    setWinningCells([]);
    setIsReplaying(true);
  };

  return {
    board,
    winner,
    winningCells,
    moveIndex,
    isReplaying,
    setIsReplaying,
    reset,
  };
}
