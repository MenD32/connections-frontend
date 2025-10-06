'use client';

import { useState, useEffect } from 'react';
import { ConnectionsLanding } from '@/components/ConnectionsLanding';
import { GameBoard } from '@/components/GameBoard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { UserStats } from '@/types/game';
import { loadUserStats } from '@/lib/statsUtils';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load user stats on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Add a small delay to show the loading screen briefly
      await new Promise(resolve => setTimeout(resolve, 500));
      setUserStats(loadUserStats());
      setIsInitialLoading(false);
    };
    
    loadInitialData();
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

  // Show loading screen while initial data loads
  if (isInitialLoading) {
    return <LoadingScreen message="Preparing your Connections experience..." />;
  }

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
