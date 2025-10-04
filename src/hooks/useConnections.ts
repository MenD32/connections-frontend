import { useState, useCallback } from 'react';
import { GameState, WordGroup } from '@/types/game';
import { samplePuzzle, shuffleArray } from '@/data/puzzles';

export function useConnections() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const allWords = shuffleArray(samplePuzzle.groups.flatMap(group => group.words));
    return {
      groups: samplePuzzle.groups,
      allWords,
      selectedWords: [],
      solvedGroups: [],
      mistakesRemaining: 4,
      gameStatus: 'playing',
      showHints: false
    };
  });

  const [lastGuessResult, setLastGuessResult] = useState<'correct' | 'incorrect' | null>(null);
  const [animatingWords, setAnimatingWords] = useState<{
    word: string;
    fromIndex: number;
    toIndex: number;
  }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const selectWord = useCallback((word: string) => {
    if (isAnimating) return;
    
    setGameState(prev => {
      if (prev.selectedWords.includes(word)) {
        // Deselect word
        return {
          ...prev,
          selectedWords: prev.selectedWords.filter(w => w !== word)
        };
      } else if (prev.selectedWords.length < 4) {
        // Select word
        return {
          ...prev,
          selectedWords: [...prev.selectedWords, word]
        };
      }
      return prev;
    });
  }, [isAnimating]);

  const deselectAll = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedWords: []
    }));
  }, []);

  const shuffleWords = useCallback(() => {
    setGameState(prev => {
      const unsolved = prev.allWords.filter(word =>
        !prev.solvedGroups.some(group => group.words.includes(word))
      );
      const solved = prev.allWords.filter(word =>
        prev.solvedGroups.some(group => group.words.includes(word))
      );

      return {
        ...prev,
        allWords: [...solved, ...shuffleArray(unsolved)],
        selectedWords: []
      };
    });
  }, []);

  const submitGuess = useCallback(() => {
    setGameState(prev => {
      if (prev.selectedWords.length !== 4 || isAnimating) return prev;

      // Check if guess matches any group
      const matchingGroup = prev.groups.find(group =>
        prev.selectedWords.every(word => group.words.includes(word)) &&
        prev.selectedWords.length === group.words.length
      );

      if (matchingGroup) {
        // Get only unsolved words for position calculations
        const unsolvedWords = prev.allWords.filter(word => 
          !prev.solvedGroups.some(group => group.words.includes(word))
        );
        
        // Calculate all word movements
        const animations: { word: string; fromIndex: number; toIndex: number; }[] = [];
        const newWordOrder = [...unsolvedWords];
        
        // Move selected words to the beginning (top row)
        const selectedIndices = prev.selectedWords.map(word => unsolvedWords.indexOf(word));
        const otherWords = unsolvedWords.filter(word => !prev.selectedWords.includes(word));
        
        // Create new arrangement: selected words first, then others
        const targetOrder = [...prev.selectedWords, ...otherWords];
        
        // Calculate animations for all words that need to move
        unsolvedWords.forEach((word, currentIndex) => {
          const targetIndex = targetOrder.indexOf(word);
          if (currentIndex !== targetIndex) {
            animations.push({
              word,
              fromIndex: currentIndex,
              toIndex: targetIndex
            });
          }
        });
        
        setIsAnimating(true);
        setAnimatingWords(animations);
        setLastGuessResult('correct');
        
        // Wait for animation to complete, then update state
        setTimeout(() => {
          const newSolvedGroups = [...prev.solvedGroups, matchingGroup];
          const newGameStatus = newSolvedGroups.length === 4 ? 'won' : 'playing';
          
          // Reorganize allWords: solved groups first, then remaining
          const solvedWords = newSolvedGroups.flatMap(group => group.words);
          const remainingWords = prev.allWords.filter(word => 
            !newSolvedGroups.some(group => group.words.includes(word))
          );

          setGameState(current => ({
            ...current,
            solvedGroups: newSolvedGroups,
            allWords: [...solvedWords, ...remainingWords],
            selectedWords: [],
            gameStatus: newGameStatus
          }));
          
          // Clean up animation
          setAnimatingWords([]);
          setLastGuessResult(null);
          setIsAnimating(false);
        }, 1000);

        return {
          ...prev,
          selectedWords: []
        };
      } else {
        // Incorrect guess - trigger shake animation
        setLastGuessResult('incorrect');
        setTimeout(() => setLastGuessResult(null), 600);

        const newMistakes = prev.mistakesRemaining - 1;
        const newGameStatus = newMistakes === 0 ? 'lost' : 'playing';

        return {
          ...prev,
          selectedWords: [],
          mistakesRemaining: newMistakes,
          gameStatus: newGameStatus
        };
      }
    });
  }, [isAnimating]);

  const resetGame = useCallback(() => {
    const allWords = shuffleArray(samplePuzzle.groups.flatMap(group => group.words));
    setGameState({
      groups: samplePuzzle.groups,
      allWords,
      selectedWords: [],
      solvedGroups: [],
      mistakesRemaining: 4,
      gameStatus: 'playing',
      showHints: false
    });
    setLastGuessResult(null);
    setAnimatingWords([]);
    setIsAnimating(false);
  }, []);

  const toggleHints = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showHints: !prev.showHints
    }));
  }, []);

  return {
    gameState,
    lastGuessResult,
    animatingWords,
    isAnimating,
    selectWord,
    deselectAll,
    shuffleWords,
    submitGuess,
    resetGame,
    toggleHints
  };
}
