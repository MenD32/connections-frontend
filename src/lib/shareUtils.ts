import { GameState, GuessResult, WordGroup } from '@/types/game';

// Emoji colors for each difficulty level (matching NYT Connections)
const DIFFICULTY_COLORS = {
  easy: '🟨',     // Yellow
  medium: '🟩',   // Green  
  hard: '🟦',     // Blue
  hardest: '🟪'   // Purple
};

export function generateShareText(gameState: GameState, puzzleNumber: number): string {
  const { guessHistory, gameStatus } = gameState;
  
  // Header
  let shareText = `Connections\nPuzzle #${puzzleNumber}\n`;
  
  // Convert each guess to emoji representation
  const emojiLines: string[] = [];
  
  for (const guess of guessHistory) {
    if (guess.isCorrect && guess.solvedGroup) {
      // For correct guesses, show 4 squares of the solved group's color
      const emoji = DIFFICULTY_COLORS[guess.solvedGroup.difficulty];
      emojiLines.push(emoji.repeat(4));
    } else {
      // For incorrect guesses, show the colors of the groups each word belongs to
      const emojiLine = guess.words.map(word => {
        // Find which group this word belongs to
        const group = gameState.groups.find(g => g.words.includes(word));
        return group ? DIFFICULTY_COLORS[group.difficulty] : '⬜';
      }).join('');
      emojiLines.push(emojiLine);
    }
  }
  
  // Add the emoji lines to share text
  shareText += emojiLines.join('\n');
  
  // Add result if game is finished
  if (gameStatus === 'won') {
    shareText += '\n\nPerfect!';
  } else if (gameStatus === 'lost') {
    shareText += '\n\nNext time!';
  }
  
  return shareText;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}