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
    console.log('Square clicked:', position);

    // If no piece is selected
    if (!selectedPosition) {
      const piece = gameState.board[position.rank][position.file];
      console.log('Piece at position:', piece);

      // Only allow selecting pieces of current player's color
      if (piece && piece.color === gameState.currentTurn) {
        console.log('Selecting piece:', piece);
        const moves = MoveGenerator.generateMoves(gameState, position);
        console.log('Valid moves:', moves);

        setSelectedPosition(position);
        setValidMoves(moves);
      }
      return;
    }

    // If a piece is selected
    const move = validMoves.find(
      (move) => move.to.rank === position.rank && move.to.file === position.file
    );

    if (move) {
      console.log('Making move:', move);
      // Make the move
      const newGameState = GameStateManager.applyMove(gameState, move);
      console.log('New game state:', newGameState);
      setGameState(newGameState);
      setSelectedPosition(null);
      setValidMoves([]);
    } else {
      // If clicking on another piece of the same color, select it instead
      const piece = gameState.board[position.rank][position.file];
      if (piece && piece.color === gameState.currentTurn) {
        console.log('Selecting new piece:', piece);
        const moves = MoveGenerator.generateMoves(gameState, position);
        console.log('Valid moves:', moves);

        setSelectedPosition(position);
        setValidMoves(moves);
      } else {
        // Clicking on an invalid square, deselect the piece
        console.log('Deselecting piece');
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
      {gameState.board
        .map((row, rankIndex) => (
          <div key={rankIndex} className={styles.row}>
            {row.map((piece, fileIndex) => {
              const position = { rank: rankIndex, file: fileIndex };
              const isSelected =
                selectedPosition?.rank === rankIndex && selectedPosition?.file === fileIndex;
              const isValidTarget = isValidMoveTarget(position);

              // Calculate square color (flipped pattern)
              const isLightSquare = (rankIndex + fileIndex) % 2 === 0;
              const squareColor = isLightSquare ? styles.light : styles.dark;

              return (
                <div
                  key={`${rankIndex}-${fileIndex}`}
                  className={`${styles.square} ${squareColor} ${isSelected ? styles.selected : ''} ${
                    isValidTarget ? styles.validMove : ''
                  }`}
                  onClick={() => handleSquareClick(position)}
                  data-position={`${rankIndex},${fileIndex}`}
                >
                  {piece && <ChessPiece piece={piece} />}
                </div>
              );
            })}
          </div>
        ))
        .reverse()}
    </div>
  );
}
