import { GameState, Move, PieceColor, Position } from '../types';
import { createInitialBoard } from './board';

/**
 * GameStateManager handles game state updates and transitions
 * This includes:
 * - Creating initial game state
 * - Applying moves to the game state
 * - Tracking game status (check, checkmate, stalemate)
 */
export class GameStateManager {
  /**
   * Creates a new game state with initial board setup
   * @returns Initial game state
   */
  public static createInitialGameState(): GameState {
    const board = createInitialBoard();

    // Find initial king positions
    let whiteKingPosition: Position | undefined;
    let blackKingPosition: Position | undefined;

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece?.type === 'KING') {
          if (piece.color === 'WHITE') {
            whiteKingPosition = { rank, file };
          } else {
            blackKingPosition = { rank, file };
          }
        }
      }
    }

    if (!whiteKingPosition || !blackKingPosition) {
      throw new Error('Invalid initial board setup: missing kings');
    }

    return {
      board,
      currentTurn: PieceColor.WHITE,
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      capturedPieces: [],
      whiteKingPosition,
      blackKingPosition,
    };
  }

  /**
   * Creates a deep copy of a game state
   * @param gameState Game state to copy
   * @returns New game state object
   */
  private static cloneGameState(gameState: GameState): GameState {
    return {
      board: gameState.board.map((row) => [...row]),
      currentTurn: gameState.currentTurn,
      moveHistory: [...gameState.moveHistory],
      isCheck: gameState.isCheck,
      isCheckmate: gameState.isCheckmate,
      isStalemate: gameState.isStalemate,
      capturedPieces: [...gameState.capturedPieces],
      whiteKingPosition: { ...gameState.whiteKingPosition },
      blackKingPosition: { ...gameState.blackKingPosition },
    };
  }

  /**
   * Applies a move to the game state
   * @param gameState Current game state
   * @param move Move to apply
   * @returns New game state after the move
   */
  public static applyMove(gameState: GameState, move: Move): GameState {
    const newState = this.cloneGameState(gameState);
    const { from, to, piece, capturedPiece, isPromotion, promotionPiece, isCastling, isEnPassant } =
      move;

    // Update board
    newState.board[from.rank][from.file] = null;
    newState.board[to.rank][to.file] =
      isPromotion && promotionPiece
        ? { ...piece, type: promotionPiece, hasMoved: true }
        : { ...piece, hasMoved: true };

    // Handle captured pieces
    if (capturedPiece) {
      newState.capturedPieces.push(capturedPiece);
    }

    // Handle en passant capture
    if (isEnPassant) {
      const capturedPawnRank = from.rank;
      const capturedPawnFile = to.file;
      const capturedPawn = newState.board[capturedPawnRank][capturedPawnFile];
      if (capturedPawn) {
        newState.capturedPieces.push(capturedPawn);
        newState.board[capturedPawnRank][capturedPawnFile] = null;
      }
    }

    // Handle castling
    if (isCastling) {
      const isKingside = to.file > from.file;
      const rookFromFile = isKingside ? 7 : 0;
      const rookToFile = isKingside ? 5 : 3;
      const rookRank = from.rank;

      const rook = newState.board[rookRank][rookFromFile];
      if (rook) {
        newState.board[rookRank][rookFromFile] = null;
        newState.board[rookRank][rookToFile] = { ...rook, hasMoved: true };
      }
    }

    // Update king position if king moved
    if (piece.type === 'KING') {
      if (piece.color === 'WHITE') {
        newState.whiteKingPosition = to;
      } else {
        newState.blackKingPosition = to;
      }
    }

    // Update move history
    newState.moveHistory.push(move);

    // Switch turns
    newState.currentTurn =
      newState.currentTurn === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

    return newState;
  }
}
