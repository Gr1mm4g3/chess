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
    console.log('Generating moves for piece:', piece, 'at position:', position);

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

    console.log('Generated moves before check filter:', moves);
    // Filter out moves that would leave the king in check
    const validMoves = moves.filter((move) => !this.wouldResultInCheck(gameState, move));
    console.log('Valid moves after check filter:', validMoves);

    return validMoves;
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
    const promotionRank = piece.color === PieceColor.WHITE ? 7 : 0;

    // Forward move
    const oneForward: Position = { rank: position.rank + direction, file: position.file };
    if (isValidPosition(oneForward) && !gameState.board[oneForward.rank][oneForward.file]) {
      // Check for promotion
      if (oneForward.rank === promotionRank) {
        // Add moves for each possible promotion piece
        [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].forEach(
          (promotionPiece) => {
            moves.push(
              this.createMove(position, oneForward, piece, undefined, true, promotionPiece)
            );
          }
        );
      } else {
        moves.push(this.createMove(position, oneForward, piece));
      }

      // Double forward on first move
      if (position.rank === startingRank) {
        const twoForward: Position = { rank: position.rank + 2 * direction, file: position.file };
        if (!gameState.board[twoForward.rank][twoForward.file]) {
          moves.push(this.createMove(position, twoForward, piece));
        }
      }
    }

    // Regular captures and promotions via capture
    const captureFiles = [position.file - 1, position.file + 1];
    captureFiles.forEach((file) => {
      const capturePos: Position = { rank: position.rank + direction, file };
      if (isValidPosition(capturePos)) {
        const targetPiece = gameState.board[capturePos.rank][capturePos.file];
        if (targetPiece && targetPiece.color !== piece.color) {
          if (capturePos.rank === promotionRank) {
            // Add promotion moves for captures
            [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].forEach(
              (promotionPiece) => {
                moves.push(
                  this.createMove(position, capturePos, piece, targetPiece, true, promotionPiece)
                );
              }
            );
          } else {
            moves.push(this.createMove(position, capturePos, piece, targetPiece));
          }
        }
      }
    });

    // En passant
    if (gameState.moveHistory.length > 0) {
      const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
      if (
        lastMove.piece.type === PieceType.PAWN &&
        Math.abs(lastMove.to.rank - lastMove.from.rank) === 2 && // Double pawn move
        lastMove.to.rank === position.rank && // Same rank as our pawn
        Math.abs(lastMove.to.file - position.file) === 1 // Adjacent file
      ) {
        const enPassantPos: Position = {
          rank: position.rank + direction,
          file: lastMove.to.file,
        };
        moves.push(
          this.createMove(
            position,
            enPassantPos,
            piece,
            lastMove.piece,
            false,
            undefined,
            false,
            true
          )
        );
      }
    }

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
        moves.push(
          this.createMove(position, { rank: targetRank, file: targetFile }, piece, targetPiece)
        );
      }
    }

    // Castling
    if (!piece.hasMoved && !gameState.isCheck) {
      const rank = piece.color === PieceColor.WHITE ? 0 : 7;

      // Kingside castling
      const kingsideRook = gameState.board[rank][7];
      if (
        kingsideRook &&
        kingsideRook.type === PieceType.ROOK &&
        !kingsideRook.hasMoved &&
        !gameState.board[rank][5] &&
        !gameState.board[rank][6] &&
        !this.isSquareUnderAttack(gameState, { rank, file: 5 }, piece.color) &&
        !this.isSquareUnderAttack(gameState, { rank, file: 6 }, piece.color)
      ) {
        moves.push(
          this.createMove(position, { rank, file: 6 }, piece, undefined, false, undefined, true)
        );
      }

      // Queenside castling
      const queensideRook = gameState.board[rank][0];
      if (
        queensideRook &&
        queensideRook.type === PieceType.ROOK &&
        !queensideRook.hasMoved &&
        !gameState.board[rank][1] &&
        !gameState.board[rank][2] &&
        !gameState.board[rank][3] &&
        !this.isSquareUnderAttack(gameState, { rank, file: 2 }, piece.color) &&
        !this.isSquareUnderAttack(gameState, { rank, file: 3 }, piece.color)
      ) {
        moves.push(
          this.createMove(position, { rank, file: 2 }, piece, undefined, false, undefined, true)
        );
      }
    }

    return moves;
  }

  /**
   * Checks if a square is under attack by the opponent
   * @param gameState Current game state
   * @param position Position to check
   * @param friendlyColor Color of the friendly pieces
   * @returns boolean indicating if the square is under attack
   */
  private static isSquareUnderAttack(
    gameState: GameState,
    position: Position,
    friendlyColor: PieceColor
  ): boolean {
    // Create a temporary piece to check for attacks
    const tempPiece: Piece = {
      type: PieceType.KING, // Use king to check all possible attack vectors
      color: friendlyColor,
      hasMoved: false,
    };

    // Save the original piece at this position
    const originalPiece = gameState.board[position.rank][position.file];

    // Place our temporary piece
    gameState.board[position.rank][position.file] = tempPiece;

    // Check if any opponent's piece can capture our temporary piece
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const attackerPiece = gameState.board[rank][file];
        if (attackerPiece && attackerPiece.color !== friendlyColor) {
          const moves = this.generateBasicMoves(gameState, { rank, file });
          if (
            moves.some((move) => move.to.rank === position.rank && move.to.file === position.file)
          ) {
            // Restore the original piece
            gameState.board[position.rank][position.file] = originalPiece;
            return true;
          }
        }
      }
    }

    // Restore the original piece
    gameState.board[position.rank][position.file] = originalPiece;
    return false;
  }

  /**
   * Generates basic moves without considering check or special moves
   * Used internally to prevent infinite recursion in isSquareUnderAttack
   */
  private static generateBasicMoves(gameState: GameState, position: Position): Move[] {
    const piece = gameState.board[position.rank][position.file];
    if (!piece) return [];

    switch (piece.type) {
      case PieceType.PAWN:
        return this.generatePawnMoves(gameState, position);
      case PieceType.KNIGHT:
        return this.generateKnightMoves(gameState, position);
      case PieceType.BISHOP:
        return this.generateBishopMoves(gameState, position);
      case PieceType.ROOK:
        return this.generateRookMoves(gameState, position);
      case PieceType.QUEEN:
        return this.generateQueenMoves(gameState, position);
      case PieceType.KING:
        // For basic moves, only generate normal king moves without castling
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
        for (const [rankOffset, fileOffset] of directions) {
          const targetRank = position.rank + rankOffset;
          const targetFile = position.file + fileOffset;
          if (!isValidPosition({ rank: targetRank, file: targetFile })) continue;
          const targetPiece = gameState.board[targetRank][targetFile];
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(
              this.createMove(position, { rank: targetRank, file: targetFile }, piece, targetPiece)
            );
          }
        }
        return moves;
    }
    return [];
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
