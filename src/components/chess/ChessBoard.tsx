'use client';

import { useState } from 'react';
import { GameState, Move, Position } from '@/lib/chess/types';
import { GameStateManager } from '@/lib/chess/core/gameStateManager';
import { MoveGenerator } from '@/lib/chess/core/moveGenerator';
import styles from './ChessBoard.module.css';
import { ChessPiece } from './ChessPiece';

export function ChessBoard() {
  const [gameState, setGameState] = useState<GameState>(GameStateManager.createInitialGameState());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);

  // Handle square click
  const handleSquareClick = (position: Position) => {
    // If no piece is selected
    if (!selectedPosition) {
      const piece = gameState.board[position.rank][position.file];
      // Only allow selecting pieces of current player's color
      if (piece && piece.color === gameState.currentTurn) {
        setSelectedPosition(position);
        setValidMoves(MoveGenerator.generateMoves(gameState, position));
      }
      return;
    }

    // If a piece is selected
    const move = validMoves.find(
      (move) => move.to.rank === position.rank && move.to.file === position.file
    );

    if (move) {
      // Make the move
      const newGameState = GameStateManager.applyMove(gameState, move);
      setGameState(newGameState);
      setSelectedPosition(null);
      setValidMoves([]);
    } else {
      // If clicking on another piece of the same color, select it instead
      const piece = gameState.board[position.rank][position.file];
      if (piece && piece.color === gameState.currentTurn) {
        setSelectedPosition(position);
        setValidMoves(MoveGenerator.generateMoves(gameState, position));
      } else {
        // Clicking on an invalid square, deselect the piece
        setSelectedPosition(null);
        setValidMoves([]);
      }
    }
  };

  // Check if a square is a valid move target
  const isValidMoveTarget = (position: Position) =>
    validMoves.some((move) => move.to.rank === position.rank && move.to.file === position.file);

  return (
    <div className={styles.board}>
      {gameState.board.map((row, rankIndex) => (
        <div key={rankIndex} className={styles.row}>
          {row.map((piece, fileIndex) => {
            const position = { rank: rankIndex, file: fileIndex };
            const isSelected =
              selectedPosition?.rank === rankIndex && selectedPosition?.file === fileIndex;
            const isValidTarget = isValidMoveTarget(position);

            return (
              <div
                key={`${rankIndex}-${fileIndex}`}
                className={`${styles.square} ${
                  (rankIndex + fileIndex) % 2 === 0 ? styles.light : styles.dark
                } ${isSelected ? styles.selected : ''} ${isValidTarget ? styles.validMove : ''}`}
                onClick={() => handleSquareClick(position)}
              >
                {piece && <ChessPiece piece={piece} />}
                {isValidTarget && <div className={styles.moveIndicator} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
