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

    it('should generate pawn promotion moves', () => {
      // Place a white pawn one step away from promotion
      const position: Position = { rank: 6, file: 4 }; // e7
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      gameState.board[6][4] = { type: PieceType.PAWN, color: PieceColor.WHITE, hasMoved: true };

      const moves = MoveGenerator.generateMoves(gameState, position);

      // Should have 4 promotion moves (Queen, Rook, Bishop, Knight)
      expect(moves).toHaveLength(4);
      expect(moves.every((m) => m.isPromotion)).toBeTruthy();
      expect(moves.some((m) => m.promotionPiece === PieceType.QUEEN)).toBeTruthy();
      expect(moves.some((m) => m.promotionPiece === PieceType.ROOK)).toBeTruthy();
      expect(moves.some((m) => m.promotionPiece === PieceType.BISHOP)).toBeTruthy();
      expect(moves.some((m) => m.promotionPiece === PieceType.KNIGHT)).toBeTruthy();
    });

    it('should generate en passant moves', () => {
      // Set up an en passant position
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const whitePawn = { type: PieceType.PAWN, color: PieceColor.WHITE, hasMoved: true };
      const blackPawn = { type: PieceType.PAWN, color: PieceColor.BLACK, hasMoved: true };

      // Place white pawn at e5
      gameState.board[4][4] = whitePawn;
      // Place black pawn that just moved from f7 to f5
      gameState.board[4][5] = blackPawn;

      // Add the last move to history
      gameState.moveHistory = [
        {
          from: { rank: 6, file: 5 }, // f7
          to: { rank: 4, file: 5 }, // f5
          piece: blackPawn,
        },
      ];

      const position: Position = { rank: 4, file: 4 }; // e5
      const moves = MoveGenerator.generateMoves(gameState, position);

      // Should find the en passant move
      const enPassantMove = moves.find((m) => m.isEnPassant);
      expect(enPassantMove).toBeTruthy();
      expect(enPassantMove?.to).toEqual({ rank: 5, file: 5 }); // e6
      expect(enPassantMove?.capturedPiece).toEqual(blackPawn);
    });
  });

  describe('generateMoves for Knights', () => {
    it('should generate all valid knight moves from center position', () => {
      // Place a white knight in the center of an empty board
      const position: Position = { rank: 3, file: 3 }; // d4
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      gameState.board[3][3] = { type: PieceType.KNIGHT, color: PieceColor.WHITE, hasMoved: false };

      const moves = MoveGenerator.generateMoves(gameState, position);

      // Knight should have all 8 possible moves from a center position
      expect(moves).toHaveLength(8);

      // Check all possible knight moves are generated
      const expectedMoves = [
        { rank: 1, file: 2 },
        { rank: 1, file: 4 }, // Up 2, left/right 1
        { rank: 2, file: 1 },
        { rank: 2, file: 5 }, // Up 1, left/right 2
        { rank: 4, file: 1 },
        { rank: 4, file: 5 }, // Down 1, left/right 2
        { rank: 5, file: 2 },
        { rank: 5, file: 4 }, // Down 2, left/right 1
      ];

      expectedMoves.forEach((expected) => {
        expect(
          moves.some((m) => m.to.rank === expected.rank && m.to.file === expected.file)
        ).toBeTruthy();
      });
    });

    it('should not allow knight to move to squares occupied by friendly pieces', () => {
      // Place a white knight and some white pieces around it
      const position: Position = { rank: 3, file: 3 }; // d4
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      gameState.board[3][3] = { type: PieceType.KNIGHT, color: PieceColor.WHITE, hasMoved: false };
      gameState.board[1][2] = { type: PieceType.PAWN, color: PieceColor.WHITE, hasMoved: false }; // Block one move

      const moves = MoveGenerator.generateMoves(gameState, position);

      // Should have 7 moves (one blocked by friendly piece)
      expect(moves).toHaveLength(7);
      // Ensure the blocked square is not in the moves
      expect(moves.some((m) => m.to.rank === 1 && m.to.file === 2)).toBeFalsy();
    });
  });

  describe('generateMoves for Bishops', () => {
    it('should generate all valid bishop moves from center position', () => {
      // Place a white bishop in the center of an empty board
      const position: Position = { rank: 3, file: 3 }; // d4
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      gameState.board[3][3] = { type: PieceType.BISHOP, color: PieceColor.WHITE, hasMoved: false };

      const moves = MoveGenerator.generateMoves(gameState, position);

      // Bishop should be able to move to all squares on its diagonals
      // From d4, it can move to: a1, b2, c3, e5, f6, g7, h8 (one diagonal)
      // and: a7, b6, c5, e3, f2, g1 (other diagonal)
      expect(moves).toHaveLength(13);

      // Check some specific diagonal moves
      const expectedMoves = [
        { rank: 0, file: 0 }, // a1
        { rank: 6, file: 6 }, // g7
        { rank: 0, file: 6 }, // a7
        { rank: 6, file: 0 }, // g1
      ];

      expectedMoves.forEach((expected) => {
        expect(
          moves.some((m) => m.to.rank === expected.rank && m.to.file === expected.file)
        ).toBeTruthy();
      });
    });
  });

  describe('generateMoves for Rooks', () => {
    it('should generate all valid rook moves from center position', () => {
      // Place a white rook in the center of an empty board
      const position: Position = { rank: 3, file: 3 }; // d4
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      gameState.board[3][3] = { type: PieceType.ROOK, color: PieceColor.WHITE, hasMoved: false };

      const moves = MoveGenerator.generateMoves(gameState, position);

      // Rook should be able to move to all squares on its rank and file
      // From d4, it can move to: d1-d3, d5-d8 (file moves)
      // and: a4-c4, e4-h4 (rank moves)
      expect(moves).toHaveLength(14);

      // Check some specific moves
      const expectedMoves = [
        { rank: 0, file: 3 }, // d1
        { rank: 7, file: 3 }, // d8
        { rank: 3, file: 0 }, // a4
        { rank: 3, file: 7 }, // h4
      ];

      expectedMoves.forEach((expected) => {
        expect(
          moves.some((m) => m.to.rank === expected.rank && m.to.file === expected.file)
        ).toBeTruthy();
      });
    });
  });

  describe('generateMoves for Queens', () => {
    it('should generate all valid queen moves from center position', () => {
      // Place a white queen in the center of an empty board
      const position: Position = { rank: 3, file: 3 }; // d4
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      gameState.board[3][3] = { type: PieceType.QUEEN, color: PieceColor.WHITE, hasMoved: false };

      const moves = MoveGenerator.generateMoves(gameState, position);

      // Queen should be able to move in all directions
      // This combines rook moves (14) and bishop moves (13), total 27
      expect(moves).toHaveLength(27);

      // Check some specific moves
      const expectedMoves = [
        { rank: 0, file: 0 }, // a1 (diagonal)
        { rank: 7, file: 7 }, // h8 (diagonal)
        { rank: 0, file: 3 }, // d1 (vertical)
        { rank: 3, file: 0 }, // a4 (horizontal)
      ];

      expectedMoves.forEach((expected) => {
        expect(
          moves.some((m) => m.to.rank === expected.rank && m.to.file === expected.file)
        ).toBeTruthy();
      });
    });
  });

  describe('generateMoves for Kings', () => {
    it('should generate all valid king moves from center position', () => {
      // Place a white king in the center of an empty board
      const position: Position = { rank: 3, file: 3 }; // d4
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      gameState.board[3][3] = { type: PieceType.KING, color: PieceColor.WHITE, hasMoved: false };

      const moves = MoveGenerator.generateMoves(gameState, position);

      // King should be able to move one square in any direction
      expect(moves).toHaveLength(8);

      // Check all adjacent squares
      const expectedMoves = [
        { rank: 2, file: 2 },
        { rank: 2, file: 3 },
        { rank: 2, file: 4 },
        { rank: 3, file: 2 },
        { rank: 3, file: 4 },
        { rank: 4, file: 2 },
        { rank: 4, file: 3 },
        { rank: 4, file: 4 },
      ];

      expectedMoves.forEach((expected) => {
        expect(
          moves.some((m) => m.to.rank === expected.rank && m.to.file === expected.file)
        ).toBeTruthy();
      });
    });

    it('should allow kingside castling when conditions are met', () => {
      // Set up a position where white can castle kingside
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const whiteKing = { type: PieceType.KING, color: PieceColor.WHITE, hasMoved: false };
      const whiteRook = { type: PieceType.ROOK, color: PieceColor.WHITE, hasMoved: false };

      // Place pieces for kingside castle
      gameState.board[0][4] = whiteKing; // e1
      gameState.board[0][7] = whiteRook; // h1

      const position: Position = { rank: 0, file: 4 }; // e1
      const moves = MoveGenerator.generateMoves(gameState, position);

      // Find the castling move
      const castlingMove = moves.find((m) => m.isCastling);
      expect(castlingMove).toBeTruthy();
      expect(castlingMove?.to).toEqual({ rank: 0, file: 6 }); // g1
    });

    it('should allow queenside castling when conditions are met', () => {
      // Set up a position where white can castle queenside
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const whiteKing = { type: PieceType.KING, color: PieceColor.WHITE, hasMoved: false };
      const whiteRook = { type: PieceType.ROOK, color: PieceColor.WHITE, hasMoved: false };

      // Place pieces for queenside castle
      gameState.board[0][4] = whiteKing; // e1
      gameState.board[0][0] = whiteRook; // a1

      const position: Position = { rank: 0, file: 4 }; // e1
      const moves = MoveGenerator.generateMoves(gameState, position);

      // Find the castling move
      const castlingMove = moves.find((m) => m.isCastling);
      expect(castlingMove).toBeTruthy();
      expect(castlingMove?.to).toEqual({ rank: 0, file: 2 }); // c1
    });

    it('should not allow castling through check', () => {
      // Set up a position where white could castle but the squares are attacked
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const whiteKing = { type: PieceType.KING, color: PieceColor.WHITE, hasMoved: false };
      const whiteRook = { type: PieceType.ROOK, color: PieceColor.WHITE, hasMoved: false };
      const blackRook = { type: PieceType.ROOK, color: PieceColor.BLACK, hasMoved: true };

      // Place pieces for kingside castle
      gameState.board[0][4] = whiteKing; // e1
      gameState.board[0][7] = whiteRook; // h1
      // Place black rook attacking f1
      gameState.board[7][5] = blackRook; // f8

      const position: Position = { rank: 0, file: 4 }; // e1
      const moves = MoveGenerator.generateMoves(gameState, position);

      // Should not find any castling moves
      expect(moves.some((m) => m.isCastling)).toBeFalsy();
    });

    it('should not allow castling when in check', () => {
      // Set up a position where white is in check
      gameState.board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const whiteKing = { type: PieceType.KING, color: PieceColor.WHITE, hasMoved: false };
      const whiteRook = { type: PieceType.ROOK, color: PieceColor.WHITE, hasMoved: false };
      const blackRook = { type: PieceType.ROOK, color: PieceColor.BLACK, hasMoved: true };

      // Place pieces
      gameState.board[0][4] = whiteKing; // e1
      gameState.board[0][7] = whiteRook; // h1
      gameState.board[7][4] = blackRook; // e8 (checking white king)

      gameState.isCheck = true;

      const position: Position = { rank: 0, file: 4 }; // e1
      const moves = MoveGenerator.generateMoves(gameState, position);

      // Should not find any castling moves
      expect(moves.some((m) => m.isCastling)).toBeFalsy();
    });
  });
});
