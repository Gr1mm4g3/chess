import { Piece, PieceType, PieceColor, Position, Move, GameState } from '../types';
import { isValidPosition } from './board';

/**
 * MoveGenerator class handles all chess move generation and validation
 * This includes:
 * - Basic piece movements
 * - Special moves (castling, en passant, pawn promotion)
 * - Move validation considering piece-specific rules
 * - Check and pin detection
 */
export class MoveGenerator {
  /**
   * Generates all possible moves for a piece at a given position
   * @param gameState Current game state
   * @param position Position of the piece to generate moves for
   * @returns Array of valid moves
   */
  public static generateMoves(gameState: GameState, position: Position): Move[] {
    const piece = gameState.board[position.rank][position.file];
    if (!piece) return [];

    let moves: Move[] = [];

    switch (piece.type) {
      case PieceType.PAWN:
        moves = this.generatePawnMoves(gameState, position);
        break;
      case PieceType.KNIGHT:
        moves = this.generateKnightMoves(gameState, position);
        break;
      case PieceType.BISHOP:
        moves = this.generateBishopMoves(gameState, position);
        break;
      case PieceType.ROOK:
        moves = this.generateRookMoves(gameState, position);
        break;
      case PieceType.QUEEN:
        moves = this.generateQueenMoves(gameState, position);
        break;
      case PieceType.KING:
        moves = this.generateKingMoves(gameState, position);
        break;
    }

    // Filter out moves that would leave the king in check
    return moves.filter((move) => !this.wouldResultInCheck(gameState, move));
  }

  /**
   * Generates all possible pawn moves from a given position
   * Includes: forward moves, captures, en passant, and promotions
   */
  private static generatePawnMoves(gameState: GameState, position: Position): Move[] {
    const moves: Move[] = [];
    const piece = gameState.board[position.rank][position.file];
    if (!piece || piece.type !== PieceType.PAWN) return moves;

    const direction = piece.color === PieceColor.WHITE ? 1 : -1;
    const startingRank = piece.color === PieceColor.WHITE ? 1 : 6;

    // Forward move
    const oneForward: Position = { rank: position.rank + direction, file: position.file };
    if (isValidPosition(oneForward) && !gameState.board[oneForward.rank][oneForward.file]) {
      moves.push(this.createMove(position, oneForward, piece));

      // Double forward on first move
      if (position.rank === startingRank) {
        const twoForward: Position = { rank: position.rank + 2 * direction, file: position.file };
        if (!gameState.board[twoForward.rank][twoForward.file]) {
          moves.push(this.createMove(position, twoForward, piece));
        }
      }
    }

    // Captures
    const captureFiles = [position.file - 1, position.file + 1];
    captureFiles.forEach((file) => {
      const capturePos: Position = { rank: position.rank + direction, file };
      if (isValidPosition(capturePos)) {
        const targetPiece = gameState.board[capturePos.rank][capturePos.file];
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push(this.createMove(position, capturePos, piece, targetPiece));
        }
      }
    });

    // TODO: Implement en passant and promotion
    return moves;
  }

  /**
   * Creates a Move object with the given parameters
   */
  private static createMove(
    from: Position,
    to: Position,
    piece: Piece,
    capturedPiece?: Piece,
    isPromotion = false,
    promotionPiece?: PieceType,
    isCastling = false,
    isEnPassant = false
  ): Move {
    return {
      from,
      to,
      piece,
      capturedPiece,
      isPromotion,
      promotionPiece,
      isCastling,
      isEnPassant,
    };
  }

  /**
   * Checks if a move would result in the current player's king being in check
   * @param gameState Current game state
   * @param move Move to validate
   * @returns boolean indicating if the move would result in check
   */
  private static wouldResultInCheck(gameState: GameState, move: Move): boolean {
    // Create a new game state with the move applied
    const newBoard = gameState.board.map((row) => [...row]);
    newBoard[move.to.rank][move.to.file] = move.piece;
    newBoard[move.from.rank][move.from.file] = null;

    // TODO: Check if the king is under attack in this position
    return false;
  }

  private static generateKnightMoves(gameState: GameState, position: Position): Move[] {
    const piece = gameState.board[position.rank][position.file];
    if (!piece || piece.type !== PieceType.KNIGHT) return [];

    // Knight move offsets
    const offsets = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    const moves: Move[] = [];

    // Check each possible knight move
    for (const [rankOffset, fileOffset] of offsets) {
      const targetRank = position.rank + rankOffset;
      const targetFile = position.file + fileOffset;

      // Check if the target position is on the board
      if (!isValidPosition({ rank: targetRank, file: targetFile })) continue;

      // Get the piece at the target position
      const targetPiece = gameState.board[targetRank][targetFile];

      // Can move if square is empty or occupied by opponent's piece
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(
          this.createMove(position, { rank: targetRank, file: targetFile }, piece, targetPiece)
        );
      }
    }

    return moves;
  }

  private static generateBishopMoves(gameState: GameState, position: Position): Move[] {
    const piece = gameState.board[position.rank][position.file];
    if (!piece || piece.type !== PieceType.BISHOP) return [];

    // Bishop moves diagonally
    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    return this.generateSlidingMoves(gameState, position, piece, directions);
  }

  private static generateRookMoves(gameState: GameState, position: Position): Move[] {
    const piece = gameState.board[position.rank][position.file];
    if (!piece || piece.type !== PieceType.ROOK) return [];

    // Rook moves horizontally and vertically
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    return this.generateSlidingMoves(gameState, position, piece, directions);
  }

  private static generateQueenMoves(gameState: GameState, position: Position): Move[] {
    const piece = gameState.board[position.rank][position.file];
    if (!piece || piece.type !== PieceType.QUEEN) return [];

    // Queen moves in all directions
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    return this.generateSlidingMoves(gameState, position, piece, directions);
  }

  private static generateKingMoves(gameState: GameState, position: Position): Move[] {
    const piece = gameState.board[position.rank][position.file];
    if (!piece || piece.type !== PieceType.KING) return [];

    // King moves one square in any direction
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    const moves: Move[] = [];

    // Normal king moves
    for (const [rankOffset, fileOffset] of directions) {
      const targetRank = position.rank + rankOffset;
      const targetFile = position.file + fileOffset;

      if (!isValidPosition({ rank: targetRank, file: targetFile })) continue;

      const targetPiece = gameState.board[targetRank][targetFile];
      if (!targetPiece || targetPiece.color !== piece.color) {
        // Don't allow moves into check (this will be handled by wouldResultInCheck)
        moves.push(
          this.createMove(position, { rank: targetRank, file: targetFile }, piece, targetPiece)
        );
      }
    }

    // TODO: Add castling moves when implementing special moves

    return moves;
  }

  /**
   * Helper method to generate moves for sliding pieces (Bishop, Rook, Queen)
   */
  private static generateSlidingMoves(
    gameState: GameState,
    position: Position,
    piece: Piece,
    directions: [number, number][]
  ): Move[] {
    const moves: Move[] = [];

    // Check each direction
    for (const [rankDirection, fileDirection] of directions) {
      let targetRank = position.rank + rankDirection;
      let targetFile = position.file + fileDirection;

      // Continue in this direction until we hit a piece or the board edge
      while (isValidPosition({ rank: targetRank, file: targetFile })) {
        const targetPiece = gameState.board[targetRank][targetFile];

        if (!targetPiece) {
          // Empty square - add move and continue in this direction
          moves.push(this.createMove(position, { rank: targetRank, file: targetFile }, piece));
        } else {
          // Hit a piece
          if (targetPiece.color !== piece.color) {
            // Can capture opponent's piece
            moves.push(
              this.createMove(position, { rank: targetRank, file: targetFile }, piece, targetPiece)
            );
          }
          // Stop looking in this direction
          break;
        }

        targetRank += rankDirection;
        targetFile += fileDirection;
      }
    }

    return moves;
  }
}
