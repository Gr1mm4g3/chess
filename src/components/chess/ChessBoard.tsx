'use client';

import { createInitialBoard } from '@/lib/chess/core/board';
import styles from './ChessBoard.module.css';
import { ChessPiece } from './ChessPiece';

export function ChessBoard() {
  const board = createInitialBoard();

  return (
    <div className={styles.board}>
      {board.map((row, rankIndex) => (
        <div key={rankIndex} className={styles.row}>
          {row.map((piece, fileIndex) => (
            <div
              key={`${rankIndex}-${fileIndex}`}
              className={`${styles.square} ${
                (rankIndex + fileIndex) % 2 === 0 ? styles.light : styles.dark
              }`}
            >
              {piece && <ChessPiece piece={piece} />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
