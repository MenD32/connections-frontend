import { UserStats, GameResult } from '@/types/game';

const STATS_STORAGE_KEY = 'connections-user-stats';

// Default stats for new users
const defaultStats: UserStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  winPercentage: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: '',
  puzzleResults: {}
};

/**
 * Safely parse JSON from localStorage with error handling
 */
function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error);
    return fallback;
  }
}

/**
 * Load user stats from localStorage
 */
export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') {
    return defaultStats; // Return default for SSR
  }

  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (!stored) {
      return defaultStats;
    }

    const stats = safeParseJSON(stored, defaultStats);
    
    // Ensure all required properties exist (for backwards compatibility)
    return {
      ...defaultStats,
      ...stats,
      winPercentage: stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0
    };
  } catch (error) {
    console.error('Error loading user stats:', error);
    return defaultStats;
  }
}

/**
 * Save user stats to localStorage
 */
export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') {
    return; // Skip saving during SSR
  }

  try {
    // Recalculate win percentage to ensure accuracy
    const updatedStats = {
      ...stats,
      winPercentage: stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0
    };
    
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updatedStats));
  } catch (error) {
    console.error('Error saving user stats:', error);
  }
}

/**
 * Update stats based on a game result
 */
export function updateStatsWithGameResult(currentStats: UserStats, gameResult: GameResult): UserStats {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const isNewDay = currentStats.lastPlayedDate !== today;
  
  // Check if this puzzle was already played
  const alreadyPlayed = currentStats.puzzleResults[gameResult.puzzleId] !== undefined;
  
  // If already played, don't update stats (except maybe replace the result)
  if (alreadyPlayed) {
    return {
      ...currentStats,
      puzzleResults: {
        ...currentStats.puzzleResults,
        [gameResult.puzzleId]: gameResult.won ? 'won' : 'lost'
      }
    };
  }

  const newGamesPlayed = currentStats.gamesPlayed + 1;
  const newGamesWon = currentStats.gamesWon + (gameResult.won ? 1 : 0);
  
  // Calculate streaks
  let newCurrentStreak = currentStats.currentStreak;
  let newMaxStreak = currentStats.maxStreak;
  
  if (gameResult.won) {
    // Extend or start a new streak
    if (isNewDay) {
      newCurrentStreak = currentStats.currentStreak + 1;
    } else {
      // Same day win, but first play of the day
      newCurrentStreak = currentStats.currentStreak + 1;
    }
  } else {
    // Loss breaks the streak
    newCurrentStreak = 0;
  }
  
  // Update max streak if current streak is higher
  newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);

  return {
    gamesPlayed: newGamesPlayed,
    gamesWon: newGamesWon,
    winPercentage: Math.round((newGamesWon / newGamesPlayed) * 100),
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    lastPlayedDate: today,
    puzzleResults: {
      ...currentStats.puzzleResults,
      [gameResult.puzzleId]: gameResult.won ? 'won' : 'lost'
    }
  };
}

/**
 * Check if a specific puzzle has been played
 */
export function hasPuzzleBeenPlayed(stats: UserStats, puzzleId: string): boolean {
  return stats.puzzleResults[puzzleId] !== undefined;
}

/**
 * Get the result for a specific puzzle
 */
export function getPuzzleResult(stats: UserStats, puzzleId: string): 'won' | 'lost' | 'not-played' {
  return stats.puzzleResults[puzzleId] || 'not-played';
}

/**
 * Clear all user stats (useful for reset functionality)
 */
export function clearUserStats(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STATS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user stats:', error);
  }
}