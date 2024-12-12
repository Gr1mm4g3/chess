import { MoveGenerator } from '../core/moveGenerator';
import { createInitialBoard } from '../core/board';
import { GameState, PieceColor, PieceType, Position } from '../types';

describe('MoveGenerator', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = {
      board: createInitialBoard(),
      currentTurn: PieceColor.WHITE,
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      capturedPieces: [],
    };
  });

  describe('generateMoves for Pawns', () => {
    it('should generate correct initial moves for white pawn', () => {
      const position: Position = { rank: 1, file: 4 }; // e2 pawn
      const moves = MoveGenerator.generateMoves(gameState, position);

      expect(moves).toHaveLength(2); // Should be able to move one or two squares forward
      expect(moves[0].to).toEqual({ rank: 2, file: 4 }); // e3
      expect(moves[1].to).toEqual({ rank: 3, file: 4 }); // e4
    });

    it('should generate correct initial moves for black pawn', () => {
      const position: Position = { rank: 6, file: 4 }; // e7 pawn
      gameState.currentTurn = PieceColor.BLACK;
      const moves = MoveGenerator.generateMoves(gameState, position);

      expect(moves).toHaveLength(2); // Should be able to move one or two squares forward
      expect(moves[0].to).toEqual({ rank: 5, file: 4 }); // e6
      expect(moves[1].to).toEqual({ rank: 4, file: 4 }); // e5
    });

    it('should allow pawn captures', () => {
      // Place a white pawn at e4
      gameState.board[3][4] = { type: PieceType.PAWN, color: PieceColor.WHITE, hasMoved: true };
      // Place black pieces at d5 and f5 for capture
      gameState.board[4][3] = { type: PieceType.PAWN, color: PieceColor.BLACK, hasMoved: true };
      gameState.board[4][5] = { type: PieceType.PAWN, color: PieceColor.BLACK, hasMoved: true };

      const position: Position = { rank: 3, file: 4 }; // e4 pawn
      const moves = MoveGenerator.generateMoves(gameState, position);

      expect(moves).toHaveLength(3); // One forward and two captures
      expect(moves.some((m) => m.to.file === 3 && m.to.rank === 4 && m.capturedPiece)).toBeTruthy(); // d5 capture
      expect(moves.some((m) => m.to.file === 5 && m.to.rank === 4 && m.capturedPiece)).toBeTruthy(); // f5 capture
    });
  });

  // TODO: Add tests for other piece types and special moves
});
