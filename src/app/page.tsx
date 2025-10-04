'use client';

import { useState } from 'react';
import { ConnectionsLanding } from '@/components/ConnectionsLanding';
import { GameBoard } from '@/components/GameBoard';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div>
      {!gameStarted ? (
        <ConnectionsLanding onStartGame={() => setGameStarted(true)} />
      ) : (
        <GameBoard onBackToMenu={() => setGameStarted(false)} />
      )}
    </div>
  );
}
