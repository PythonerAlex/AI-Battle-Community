import React, { useState } from 'react';
import './ConnectXBoard.css';

function ConnectXBoard({ board, winningCells = [] }) {
  const [hoverCol, setHoverCol] = useState(null);

  const isWinningCell = (row, col) =>
    winningCells.some(([r, c]) => r === row && c === col);

  const getDropDistance = (row, col) => {
    let emptyBelow = 0;
    for (let r = 0; r < row; r++) {
      if (!board[r][col]) emptyBelow++;
    }
    return emptyBelow;
  };

  return (
    <div className="connectx-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="connectx-row">
          {row.map((cell, colIndex) => {
            const dropDepth = getDropDistance(rowIndex, colIndex);
            const isHover = hoverCol === colIndex;
            return (
              <div
                key={colIndex}
                className={`connectx-cell ${isHover ? 'hovered-col' : ''}`}
                onMouseEnter={() => setHoverCol(colIndex)}
                onMouseLeave={() => setHoverCol(null)}
              >
                {/* hover 提示圆圈（只有最上面一行显示） */}
                {rowIndex === board.length - 1 && isHover && !cell && (
                  <div className="hover-preview" />
                )}
                {cell && (
                  <div
                    className={`disc ${cell === 'A' ? 'red' : 'yellow'} ${
                      isWinningCell(rowIndex, colIndex) ? 'winner' : ''
                    }`}
                    style={{
                      transform: `translateY(-${dropDepth * 65}px)`,
                      animation: `drop ${0.2 + dropDepth * 0.05}s ease-out forwards`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default ConnectXBoard;
