/**
 * Chess piece types
 */
export enum PieceType {
  PAWN = 'PAWN',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  ROOK = 'ROOK',
  QUEEN = 'QUEEN',
  KING = 'KING',
}

/**
 * Chess piece colors
 */
export enum PieceColor {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

/**
 * Represents a chess piece
 */
export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean; // Useful for castling and pawn first move
}

/**
 * Represents a position on the chess board
 */
export interface Position {
  file: number; // 0-7 (a-h)
  rank: number; // 0-7 (1-8)
}

/**
 * Represents a chess move
 */
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

/**
 * Game state
 */
export interface GameState {
  board: (Piece | null)[][];
  currentTurn: PieceColor;
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  capturedPieces: Piece[];
}
