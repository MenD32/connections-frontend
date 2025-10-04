export interface WordGroup {
  category: string;
  words: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'hardest';
  color: string;
}

export interface GameState {
  groups: WordGroup[];
  allWords: string[];
  selectedWords: string[];
  solvedGroups: WordGroup[];
  mistakesRemaining: number;
  gameStatus: 'playing' | 'won' | 'lost';
  showHints: boolean;
}

export interface PuzzleData {
  date: string;
  puzzleNumber: number;
  groups: WordGroup[];
}
