'use client';

import { useState } from 'react';
import { ConnectionsLanding } from '@/components/ConnectionsLanding';
import { GameBoard } from '@/components/GameBoard';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const handleStartGame = (date?: string) => {
    setSelectedDate(date);
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setSelectedDate(undefined);
  };

  return (
    <div>
      {!gameStarted ? (
        <ConnectionsLanding onStartGame={handleStartGame} />
      ) : (
        <GameBoard 
          onBackToMenu={handleBackToMenu} 
          initialDate={selectedDate}
        />
      )}
    </div>
  );
}
