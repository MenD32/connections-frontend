'use client';

import { useState, useEffect } from 'react';
import { ConnectionsLanding } from '@/components/ConnectionsLanding';
import { GameBoard } from '@/components/GameBoard';
import { AboutPage } from '@/components/AboutPage';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { UserStats } from '@/types/game';
import { loadUserStats } from '@/lib/statsUtils';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'game' | 'about'>('landing');
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
    setCurrentView('game');
  };

  const handleBackToMenu = () => {
    setCurrentView('landing');
    setSelectedDate(undefined);
    // Reload stats when returning to menu (in case they were updated)
    setUserStats(loadUserStats());
  };

  const handleShowAbout = () => {
    setCurrentView('about');
  };

  const handleBackFromAbout = () => {
    setCurrentView('landing');
  };

  // Show loading screen while initial data loads
  if (isInitialLoading) {
    return <LoadingScreen message="Preparing your Connections experience..." />;
  }

  return (
    <div>
      {currentView === 'landing' && (
        <ConnectionsLanding 
          onStartGame={handleStartGame}
          onShowAbout={handleShowAbout}
          userStats={userStats || undefined}
        />
      )}
      
      {currentView === 'game' && (
        <GameBoard 
          onBackToMenu={handleBackToMenu} 
          initialDate={selectedDate}
        />
      )}
      
      {currentView === 'about' && (
        <AboutPage onBack={handleBackFromAbout} />
      )}
    </div>
  );
}
