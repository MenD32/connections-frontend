import { useState, useCallback, useEffect } from 'react';
import { GameState, WordGroup, GuessResult, PuzzleData } from '@/types/game';
import { shuffleArray } from '@/data/puzzles';

export function useConnections() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load puzzle data from API
  const loadPuzzle = useCallback(async (date?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch directly from the backend API
      const apiHost = process.env.NEXT_PUBLIC_CONNECTIONS_API_HOST || 'localhost:8000';
      const now = new Date();
      const targetDate = date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; // Use provided date or today's date (YYYY-MM-DD)
      
      const response = await fetch(`http://${apiHost}/v1/connections/${targetDate}`, {
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
      }
      
      const externalData = await response.json();
      
      // Transform external API format to our game format
      const difficultyMap = ['easy', 'medium', 'hard', 'hardest'] as const;
      const colorMap = {
        easy: '#f9d71c',    // Yellow
        medium: '#a7c957',  // Green  
        hard: '#6895d2',    // Blue
        hardest: '#b19cd9'  // Purple
      };
      
      const puzzleData: PuzzleData = {
        date: new Date(externalData.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        puzzleNumber: parseInt(externalData.id) || 1,
        groups: externalData.categories.map((category: any, index: number) => {
          // Sort cards by position to get original word order
          const sortedCards = [...category.cards].sort((a: any, b: any) => a.position - b.position);
          
          return {
            category: category.title,
            words: sortedCards.map((card: any) => card.content),
            difficulty: difficultyMap[index] || 'easy',
            color: colorMap[difficultyMap[index] || 'easy']
          };
        })
      };
      
      // Initialize game state with fetched puzzle data
      const allWords = shuffleArray(puzzleData.groups.flatMap(group => group.words));
      setGameState({
        groups: puzzleData.groups,
        allWords,
        selectedWords: [],
        solvedGroups: [],
        mistakesRemaining: 4,
        gameStatus: 'playing',
        showHints: false,
        guessHistory: [],
        puzzleNumber: puzzleData.puzzleNumber,
        puzzleDate: puzzleData.date
      });
    } catch (err) {
      console.error('Error loading puzzle:', err);
      setError(err instanceof Error ? err.message : 'Failed to load puzzle');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load today's puzzle on mount
  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  const [lastGuessResult, setLastGuessResult] = useState<'correct' | 'incorrect' | 'one-away' | null>(null);
  const [newlySolvedGroup, setNewlySolvedGroup] = useState<string | null>(null);
  const [animatingWords, setAnimatingWords] = useState<{
    word: string;
    fromIndex: number;
    toIndex: number;
  }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper function to check if a guess already exists
  const guessExists = (guessHistory: GuessResult[], words: string[]) => {
    return guessHistory.some(guess => 
      guess.words.length === words.length &&
      guess.words.every(word => words.includes(word)) &&
      words.every(word => guess.words.includes(word))
    );
  };

  // Helper function to check if a guess is "one away" from a correct group
  const isOneAway = (selectedWords: string[], groups: WordGroup[], solvedGroups: WordGroup[]) => {
    const unsolvedGroups = groups.filter(group => !solvedGroups.includes(group));
    
    return unsolvedGroups.some(group => {
      const matches = selectedWords.filter(word => group.words.includes(word));
      return matches.length === 3; // Exactly 3 out of 4 words match
    });
  };

  const selectWord = useCallback((word: string) => {
    if (isAnimating || !gameState) return;
    
    setGameState(prev => {
      if (!prev) return prev;
      
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
  }, [isAnimating, gameState]);

  const deselectAll = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedWords: []
      };
    });
  }, []);

  const shuffleWords = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      
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
      if (!prev || prev.selectedWords.length !== 4 || isAnimating) return prev;

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
        setNewlySolvedGroup(matchingGroup.category);
        
        // Wait for animation to complete, then update state
        setTimeout(() => {
          const newSolvedGroups = [...prev.solvedGroups, matchingGroup];
          const newGameStatus = newSolvedGroups.length === 4 ? 'won' : 'playing';
          
          // Reorganize allWords: solved groups first, then remaining
          const solvedWords = newSolvedGroups.flatMap(group => group.words);
          const remainingWords = prev.allWords.filter(word => 
            !newSolvedGroups.some(group => group.words.includes(word))
          );

          setGameState(current => {
            if (!current) return current;
            
            // Check if this guess already exists
            const guessAlreadyExists = guessExists(current.guessHistory, prev.selectedWords);
            
            return {
              ...current,
              solvedGroups: newSolvedGroups,
              allWords: [...solvedWords, ...remainingWords],
              selectedWords: [],
              gameStatus: newGameStatus,
              guessHistory: guessAlreadyExists 
                ? current.guessHistory 
                : [...current.guessHistory, {
                    words: [...prev.selectedWords],
                    isCorrect: true,
                    solvedGroup: matchingGroup
                  }]
            };
          });
          
          // Clean up animation
          setAnimatingWords([]);
          setLastGuessResult(null);
          setNewlySolvedGroup(null);
          setIsAnimating(false);
        }, 1000);

        return {
          ...prev,
          selectedWords: []
        };
      } else {
        // Check if the guess is "one away" from a correct group
        const oneAway = isOneAway(prev.selectedWords, prev.groups, prev.solvedGroups);
        
        // Incorrect guess - trigger shake animation and check for "one away"
        setLastGuessResult(oneAway ? 'one-away' : 'incorrect');
        setTimeout(() => setLastGuessResult(null), oneAway ? 1600 : 600);

        const newMistakes = prev.mistakesRemaining - 1;
        const newGameStatus = newMistakes === 0 ? 'lost' : 'playing';
        
        // Check if this guess already exists
        const guessAlreadyExists = guessExists(prev.guessHistory, prev.selectedWords);

        return {
          ...prev,
          selectedWords: [],
          mistakesRemaining: newMistakes,
          gameStatus: newGameStatus,
          guessHistory: guessAlreadyExists 
            ? prev.guessHistory 
            : [...prev.guessHistory, {
                words: [...prev.selectedWords],
                isCorrect: false
              }]
        };
      }
    });
  }, [isAnimating]);

  const resetGame = useCallback(() => {
    setLastGuessResult(null);
    setNewlySolvedGroup(null);
    setAnimatingWords([]);
    setIsAnimating(false);
    loadPuzzle();
  }, [loadPuzzle]);

  const toggleHints = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        showHints: !prev.showHints
      };
    });
  }, []);

  return {
    gameState,
    isLoading,
    error,
    loadPuzzle,
    lastGuessResult,
    newlySolvedGroup,
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
