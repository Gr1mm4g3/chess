import {
  createInitialBoard,
  isValidPosition,
  algebraicToPosition,
  positionToAlgebraic,
} from '../core/board';
import { PieceType, PieceColor } from '../types';

describe('Chess Board', () => {
  describe('createInitialBoard', () => {
    const board = createInitialBoard();

    test('creates an 8x8 board', () => {
      expect(board.length).toBe(8);
      board.forEach((rank) => expect(rank.length).toBe(8));
    });

    test('places white pawns correctly', () => {
      for (let file = 0; file < 8; file++) {
        const piece = board[1][file];
        expect(piece).toEqual({
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          hasMoved: false,
        });
      }
    });

    test('places black pawns correctly', () => {
      for (let file = 0; file < 8; file++) {
        const piece = board[6][file];
        expect(piece).toEqual({
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          hasMoved: false,
        });
      }
    });

    test('places kings correctly', () => {
      expect(board[0][4]).toEqual({
        type: PieceType.KING,
        color: PieceColor.WHITE,
        hasMoved: false,
      });
      expect(board[7][4]).toEqual({
        type: PieceType.KING,
        color: PieceColor.BLACK,
        hasMoved: false,
      });
    });
  });

  describe('position validation and conversion', () => {
    test('validates positions correctly', () => {
      expect(isValidPosition({ file: 0, rank: 0 })).toBe(true);
      expect(isValidPosition({ file: 7, rank: 7 })).toBe(true);
      expect(isValidPosition({ file: -1, rank: 0 })).toBe(false);
      expect(isValidPosition({ file: 8, rank: 0 })).toBe(false);
    });

    test('converts algebraic notation to position', () => {
      expect(algebraicToPosition('e4')).toEqual({ file: 4, rank: 3 });
      expect(algebraicToPosition('a1')).toEqual({ file: 0, rank: 0 });
      expect(algebraicToPosition('h8')).toEqual({ file: 7, rank: 7 });
    });

    test('converts position to algebraic notation', () => {
      expect(positionToAlgebraic({ file: 4, rank: 3 })).toBe('e4');
      expect(positionToAlgebraic({ file: 0, rank: 0 })).toBe('a1');
      expect(positionToAlgebraic({ file: 7, rank: 7 })).toBe('h8');
    });
  });
});
