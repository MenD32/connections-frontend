import { PuzzleData } from '@/types/game';

export const samplePuzzle: PuzzleData = {
  date: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),
  puzzleNumber: (() => {
    // Calculate puzzle number based on days since launch
    const startDate = new Date('2023-06-12'); // NY Times Connections launch date
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  })(),
  groups: [
    {
      category: "VISUAL INTERFACE",
      words: ["DISPLAY", "MONITOR", "SCREEN", "TERMINAL"],
      difficulty: "easy",
      color: "#f9d71c" // Yellow
    },
    {
      category: "BURLESQUE WEAR",
      words: ["BOA", "CORSET", "FAN", "GLOVES"],
      difficulty: "medium",
      color: "#a7c957" // Green
    },
    {
      category: "BEIGE SHADES",
      words: ["BUFF", "CREAM", "FAWN", "TAN"],
      difficulty: "hard",
      color: "#6895d2" // Blue
    },
    {
      category: "LANGUAGE HOMOPHONES",
      words: ["BASK", "CHECK", "FINISH", "TIE"],
      difficulty: "hardest",
      color: "#b19cd9" // Purple
    }
  ]
};

// Shuffle function to randomize word order
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
