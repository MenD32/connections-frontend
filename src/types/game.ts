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
}

export interface PuzzleData {
  date: string;
  puzzleNumber: number;
  groups: WordGroup[];
}
