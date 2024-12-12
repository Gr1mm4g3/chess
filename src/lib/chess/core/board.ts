import { Piece, PieceColor, PieceType, Position } from '../types';

/**
 * Creates and returns an initial chess board setup
 * @returns A 2D array representing the chess board with pieces in their starting positions
 */
export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Initialize pawns
  for (let file = 0; file < 8; file++) {
    board[1][file] = { type: PieceType.PAWN, color: PieceColor.WHITE, hasMoved: false };
    board[6][file] = { type: PieceType.PAWN, color: PieceColor.BLACK, hasMoved: false };
  }

  // Initialize other pieces
  const backRankPieces = [
    PieceType.ROOK,
    PieceType.KNIGHT,
    PieceType.BISHOP,
    PieceType.QUEEN,
    PieceType.KING,
    PieceType.BISHOP,
    PieceType.KNIGHT,
    PieceType.ROOK,
  ];

  backRankPieces.forEach((type, file) => {
    board[0][file] = { type, color: PieceColor.WHITE, hasMoved: false };
    board[7][file] = { type, color: PieceColor.BLACK, hasMoved: false };
  });

  return board;
}

/**
 * Checks if a position is within the bounds of the chess board
 * @param position The position to check
 * @returns boolean indicating if the position is valid
 */
export function isValidPosition(position: Position): boolean {
  return position.file >= 0 && position.file < 8 && position.rank >= 0 && position.rank < 8;
}

/**
 * Converts algebraic notation (e.g., "e4") to a Position object
 * @param algebraic The algebraic notation string
 * @returns Position object
 */
export function algebraicToPosition(algebraic: string): Position {
  const file = algebraic.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(algebraic[1]) - 1;
  return { file, rank };
}

/**
 * Converts a Position object to algebraic notation
 * @param position The Position object
 * @returns Algebraic notation string
 */
export function positionToAlgebraic(position: Position): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + position.file);
  const rank = (position.rank + 1).toString();
  return file + rank;
}
