'use client';

import { useState, useEffect } from 'react';
import { ConnectionsLanding } from '@/components/ConnectionsLanding';
import { GameBoard } from '@/components/GameBoard';
import { UserStats } from '@/types/game';
import { loadUserStats } from '@/lib/statsUtils';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Load user stats on mount
  useEffect(() => {
    setUserStats(loadUserStats());
  }, []);

  const handleStartGame = (date?: string) => {
    setSelectedDate(date);
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setSelectedDate(undefined);
    // Reload stats when returning to menu (in case they were updated)
    setUserStats(loadUserStats());
  };

  return (
    <div>
      {!gameStarted ? (
        <ConnectionsLanding 
          onStartGame={handleStartGame}
          userStats={userStats || undefined}
        />
      ) : (
        <GameBoard 
          onBackToMenu={handleBackToMenu} 
          initialDate={selectedDate}
        />
      )}
    </div>
  );
}
