import Image from 'next/image';
import { Piece } from '@/lib/chess/types';

interface ChessPieceProps {
  piece: Piece;
  size?: number;
}

export function ChessPiece({ piece, size = 50 }: ChessPieceProps) {
  const pieceColor = piece.color.toLowerCase();
  const pieceType = piece.type.toLowerCase();

  // Map our piece types to the correct SVG filenames
  const pieceTypeMap: Record<string, string> = {
    pawn: 'pawn',
    knight: 'knight',
    bishop: 'bishop',
    rook: 'rook',
    queen: 'queen',
    king: 'king',
  };

  const mappedType = pieceTypeMap[pieceType] || pieceType;
  const imagePath = `/pieces/${pieceColor}_${mappedType}.svg`;

  return (
    <div className="pointer-events-none relative" style={{ width: size, height: size }}>
      <Image
        src={imagePath}
        alt={`${piece.color} ${piece.type}`}
        fill
        priority
        className="pointer-events-none object-contain"
        draggable={false}
      />
    </div>
  );
}
