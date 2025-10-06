export interface WordGroup {
  category: string;
  words: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'hardest';
  color: string;
}

export interface GuessResult {
  words: string[];
  isCorrect: boolean;
  solvedGroup?: WordGroup;
}

export interface GameState {
  groups: WordGroup[];
  allWords: string[];
  selectedWords: string[];
  solvedGroups: WordGroup[];
  mistakesRemaining: number;
  gameStatus: 'playing' | 'won' | 'lost';
  showHints: boolean;
  guessHistory: GuessResult[];
  puzzleNumber: number;
  puzzleDate: Date;
}

export interface PuzzleData {
  date: string;
  puzzleNumber: number;
  groups: WordGroup[];
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string;
  puzzleResults: { [puzzleId: string]: 'won' | 'lost' };
}

export interface GameResult {
  puzzleId: string;
  date: string;
  won: boolean;
  mistakesUsed: number;
  timeToComplete?: number;
}
