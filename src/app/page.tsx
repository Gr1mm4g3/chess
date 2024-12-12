'use client';

import { useState } from 'react';
import { createInitialBoard } from '@/lib/chess/core/board';
import { ChessBoard } from '@/components/chess/ChessBoard';

export default function Home() {
  const [board] = useState(createInitialBoard());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-24">
      <ChessBoard board={board} squareSize={80} />
    </main>
  );
}
