import { useState, useCallback, useEffect } from 'react';
import { GameState, WordGroup, GuessResult, PuzzleData, UserStats, GameResult } from '@/types/game';
import { shuffleArray } from '@/data/puzzles';
import { loadUserStats, saveUserStats, updateStatsWithGameResult, getPuzzleResult } from '@/lib/statsUtils';

export function useConnections(initialDate?: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats());
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Function to load puzzle data from API
  const loadPuzzle = useCallback(async (date?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get API host from runtime config or fallback to localhost
      let apiHost = 'localhost:8000';
      
      // Try to get runtime config (available in browser)
      if (typeof window !== 'undefined') {
        try {
          const configResponse = await fetch('/config.js');
          const configText = await configResponse.text();
          const configMatch = configText.match(/window\.ENV\s*=\s*{[^}]*CONNECTIONS_API_HOST:\s*['"]([^'"]+)['"]/);
          if (configMatch) {
            apiHost = configMatch[1];
          }
        } catch (e) {
          // Runtime config not available, use fallback
          console.log('Runtime config not available, using fallback API host');
        }
      }
      
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
      
      // Type the external API response
      interface ExternalCard {
        content?: string; // For text-based cards
        image_alt_text?: string; // For image-based cards (symbols, etc.)
        image_url?: string; // For visual cards
        position: number;
      }
      
      interface ExternalCategory {
        title: string;
        cards: ExternalCard[];
      }
      
      interface ExternalPuzzleData {
        print_date: string;
        id: string | number;
        categories: ExternalCategory[];
      }
      
      const typedExternalData = externalData as ExternalPuzzleData;
      
      const puzzleData: PuzzleData = {
        date: new Date(typedExternalData.print_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        puzzleNumber: typeof typedExternalData.id === 'string' ? parseInt(typedExternalData.id) || 1 : typedExternalData.id,
        groups: typedExternalData.categories.map((category, index: number) => {
          // Sort cards by position to get original word order
          const sortedCards = [...category.cards].sort((a, b) => a.position - b.position);
          
          return {
            category: category.title,
            words: sortedCards.map((card) => {
              // Use image_alt_text for symbol-based puzzles, fallback to content for text-based
              return card.image_alt_text || card.content || '';
            }).filter(word => word !== ''), // Remove any empty strings
            difficulty: difficultyMap[index] || 'easy',
            color: colorMap[difficultyMap[index] || 'easy']
          };
        })
      };
      
      // Initialize game state with fetched puzzle data
      const allWords = shuffleArray(puzzleData.groups.flatMap(group => group.words));
      
      // Check if this puzzle has already been completed
      const puzzleResult = getPuzzleResult(userStats, puzzleData.puzzleNumber.toString());
      const isAlreadyCompleted = puzzleResult === 'won';
      
      setGameState({
        groups: puzzleData.groups,
        allWords,
        selectedWords: [],
        solvedGroups: isAlreadyCompleted ? puzzleData.groups : [], // Show all groups as solved if already won
        mistakesRemaining: isAlreadyCompleted ? 0 : 4,
        gameStatus: isAlreadyCompleted ? 'won' : 'playing',
        showHints: false,
        guessHistory: [],
        puzzleNumber: puzzleData.puzzleNumber,
        puzzleDate: new Date(typedExternalData.print_date)
      });
      
      // Start the game timer only if not already completed
      if (!isAlreadyCompleted) {
        setGameStartTime(Date.now());
      }
    } catch (err) {
      console.error('Error loading puzzle:', err);
      setError(err instanceof Error ? err.message : 'Failed to load puzzle');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load puzzle on mount (with initial date if provided)
  useEffect(() => {
    loadPuzzle(initialDate);
  }, [loadPuzzle, initialDate]);

  // Helper function to update stats when game ends
  const updateGameStats = useCallback((won: boolean, mistakesUsed: number, puzzleId: string) => {
    const gameResult: GameResult = {
      puzzleId: puzzleId.toString(),
      date: new Date().toISOString().split('T')[0],
      won,
      mistakesUsed,
      timeToComplete: gameStartTime ? Date.now() - gameStartTime : undefined
    };

    const newStats = updateStatsWithGameResult(userStats, gameResult);
    setUserStats(newStats);
    saveUserStats(newStats);
  }, [userStats, gameStartTime]);

  const [lastGuessResult, setLastGuessResult] = useState<'correct' | 'incorrect' | 'one-away' | 'already-guessed' | null>(null);
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
            
            // Update stats if game is won
            if (newGameStatus === 'won') {
              updateGameStats(true, 4 - current.mistakesRemaining, current.puzzleNumber.toString());
            }
            
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
        // Check if this guess has already been made
        const guessAlreadyExists = guessExists(prev.guessHistory, prev.selectedWords);
        if (guessAlreadyExists) {
          setLastGuessResult('already-guessed');
          setTimeout(() => setLastGuessResult(null), 1200);
          return {
            ...prev,
            selectedWords: []
          };
        }

        // Check if the guess is "one away" from a correct group
        const oneAway = isOneAway(prev.selectedWords, prev.groups, prev.solvedGroups);
        
        // Incorrect guess - trigger shake animation and check for "one away"
        setLastGuessResult(oneAway ? 'one-away' : 'incorrect');
        setTimeout(() => setLastGuessResult(null), oneAway ? 1600 : 600);

        const newMistakes = prev.mistakesRemaining - 1;
        const newGameStatus = newMistakes === 0 ? 'lost' : 'playing';

        // Update stats if game is lost
        if (newGameStatus === 'lost') {
          updateGameStats(false, 4 - newMistakes, prev.puzzleNumber.toString());
        }

        return {
          ...prev,
          selectedWords: [],
          mistakesRemaining: newMistakes,
          gameStatus: newGameStatus,
          guessHistory: [...prev.guessHistory, {
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
    setGameStartTime(null);
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
    userStats,
    gameStartTime,
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
