import { Button } from '@/components/ui/button';
import { WordGroup } from '@/types/game';
import { useConnections } from '@/hooks/useConnections';
import { ChevronLeft, Shuffle, Share2, Check, Calendar } from 'lucide-react';
import { generateShareText, copyToClipboard } from '@/lib/shareUtils';
import { EndGameStatsWidget } from '@/components/ui/EndGameStatsWidget';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { getPuzzleResult } from '@/lib/statsUtils';
import { useState } from 'react';

// Helper function to calculate translation between grid positions
const calculateTranslate = (fromIndex: number, toIndex: number) => {
  // Calculate grid positions (4 columns)
  const fromRow = Math.floor(fromIndex / 4);
  const fromCol = fromIndex % 4;
  const toRow = Math.floor(toIndex / 4);
  const toCol = toIndex % 4;
  
  // Calculate translate values based on CSS grid gap
  // Each tile is now rectangular: full width, 4rem height + gap
  const containerWidth = 512; // Approximate max-width of container
  const tileWidth = 130; // Width per column
  const tileHeight = 64 + 8; // 4rem (64px) height + 0.5rem (8px) gap
  
  const translateX = (toCol - fromCol) * tileWidth;
  const translateY = (toRow - fromRow) * tileHeight;
  
  return { translateX, translateY };
};

interface GameBoardProps {
  onBackToMenu: () => void;
  initialDate?: string;
}

export function GameBoard({ onBackToMenu, initialDate }: GameBoardProps) {
  const [copied, setCopied] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<string>('');
  
  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };
  
  const handleDateChange = () => {
    if (tempDate) {
      loadPuzzle(tempDate);
      setShowDatePicker(false);
      setTempDate('');
    }
  };
  
  const {
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
  } = useConnections(initialDate);

  // Early returns for loading and error states
  if (isLoading) {
    return <LoadingScreen message="Loading puzzle..." />;
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => loadPuzzle()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">No puzzle data available</p>
        </div>
      </div>
    );
  }

  const isWordSolved = (word: string) => {
    return gameState.solvedGroups.some(group => group.words.includes(word));
  };

  const isWordSelected = (word: string) => {
    return gameState.selectedWords.includes(word);
  };

  const isWordAnimating = (word: string) => {
    return animatingWords.some(anim => anim.word === word);
  };

  const getWordAnimation = (word: string) => {
    return animatingWords.find(anim => anim.word === word);
  };

  const canSubmit = gameState.selectedWords.length === 4 && gameState.gameStatus === 'playing' && !isAnimating;
  
  // Check if this puzzle was previously completed
  const isPreviouslyCompleted = userStats && getPuzzleResult(userStats, gameState.puzzleNumber.toString()) === 'won' && gameStartTime === null;

  const handleShare = async () => {
    const shareText = generateShareText(gameState, gameState.puzzleNumber);
    const success = await copyToClipboard(shareText);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* One Away Pop-up */}
      {lastGuessResult === 'one-away' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-one-away">
          <div className="bg-black text-white px-6 py-3 rounded-lg font-medium text-sm shadow-lg">
            One away!
          </div>
        </div>
      )}

      {/* Already Guessed Pop-up */}
      {lastGuessResult === 'already-guessed' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-already-guessed">
          <div className="bg-black text-white px-6 py-3 rounded-lg font-medium text-sm shadow-lg">
            Already guessed!
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToMenu}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 -ml-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-center relative">
            <h1 className="text-xl font-bold text-gray-900">Connections</h1>
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto transition-colors"
            >
              <Calendar className="w-3 h-3" />
              {gameState.puzzleDate instanceof Date 
                ? gameState.puzzleDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : gameState.puzzleDate
              }
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 min-w-[250px]">
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium text-gray-700">Select a date:</p>
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    max={getTodayDateString()}
                    min="2023-06-12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleDateChange}
                      disabled={!tempDate || isLoading}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : 'Load Puzzle'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDatePicker(false);
                        setTempDate('');
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={shuffleWords}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 -mr-2"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 pb-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Instructions */}
          {gameState.gameStatus === 'playing' && !isPreviouslyCompleted && (
            <div className="text-center text-gray-700 font-medium">
              <p>Create four groups of four!</p>
            </div>
          )}
          
          {/* Previously Completed Message */}
          {isPreviouslyCompleted && (
            <div className="text-center text-gray-600 font-medium">
              <p>You've already solved this puzzle!</p>
              <p className="text-sm text-gray-500 mt-1">Here's the solution you found:</p>
            </div>
          )}

          {/* Solved Groups */}
          <div className="space-y-2 mt-12">
            {gameState.solvedGroups.map((group, index) => (
              <SolvedGroup
                key={group.category}
                group={group}
                animate={newlySolvedGroup === group.category}
                delay={600}
              />
            ))}
          </div>

          {/* Word Grid */}
          {gameState.gameStatus === 'playing' && gameState.allWords.filter(word => !isWordSolved(word)).length > 0 && (
            <div
              className={`grid grid-cols-4 gap-2 transition-all duration-300 ${
                gameState.solvedGroups.length > 0 ? '' : ''
              } ${(lastGuessResult === 'incorrect' || lastGuessResult === 'one-away') ? 'animate-shake' : ''}`}
              style={{
                marginTop: gameState.solvedGroups.length >= 0 ? '8px' : undefined
              }}
            >
              {gameState.allWords
                .filter(word => !isWordSolved(word))
                .map((word) => (
                  <WordTile
                    key={word}
                    word={word}
                    isSelected={isWordSelected(word)}
                    animation={getWordAnimation(word)}
                    onClick={() => !isPreviouslyCompleted && selectWord(word)}
                    shake={(lastGuessResult === 'incorrect' || lastGuessResult === 'one-away') && isWordSelected(word)}
                    disabled={isPreviouslyCompleted}
                  />
                ))}
            </div>
          )}

          {/* Mistakes */}
          {gameState.gameStatus === 'playing' && (
            <div className="text-center">
              <div className="flex justify-center items-center gap-3 mb-6">
                <span className="text-sm text-gray-600 font-medium">Mistakes remaining:</span>
                <div className="flex gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < gameState.mistakesRemaining ? 'bg-gray-400' : 'bg-gray-700 scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {gameState.gameStatus === 'playing' && !isPreviouslyCompleted && (
            <div className="flex justify-center gap-3 flex-wrap">
              <Button
                onClick={shuffleWords}
                variant="outline"
                className="px-6 py-2 rounded-full border-gray-300 hover:bg-gray-50 font-medium transition-all hover:scale-105"
              >
                Shuffle
              </Button>

              <Button
                onClick={deselectAll}
                variant="outline"
                className="px-6 py-2 rounded-full border-gray-300 hover:bg-gray-50 font-medium transition-all hover:scale-105"
                disabled={gameState.selectedWords.length === 0}
              >
                Deselect All
              </Button>

              <Button
                onClick={submitGuess}
                className={`px-8 py-2 rounded-full font-medium transition-all hover:scale-105 ${
                  canSubmit
                    ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!canSubmit}
              >
                Submit
              </Button>
            </div>
          )}

          {/* Game Over Messages */}
          {gameState.gameStatus === 'won' && (
            <div className="text-center space-y-6 py-8 animate-fade-in">
              <div>
                {isPreviouslyCompleted ? (
                  // Previously completed puzzle
                  <>
                    <h2 className="text-3xl font-bold text-blue-600 mb-2">Already Solved!</h2>
                    <p className="text-gray-600">You've already completed this puzzle.</p>
                  </>
                ) : (
                  // Newly completed puzzle
                  <>
                    <h2 className="text-3xl font-bold text-green-600 mb-2 animate-bounce">Perfect!</h2>
                    <p className="text-gray-600">You solved today's puzzle!</p>
                  </>
                )}
              </div>
              
              {/* Stats Widget */}
              {userStats && (
                <EndGameStatsWidget stats={userStats} className="max-w-sm mx-auto" />
              )}
              
              <div className="flex justify-center">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {gameState.gameStatus === 'lost' && (
            <div className="text-center space-y-6 py-8 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold text-gray-700 mb-2">Next time!</h2>
                <p className="text-gray-600">Better luck with tomorrow's puzzle!</p>
              </div>

              {/* Show remaining unsolved groups */}
              <div className="space-y-2">
                {gameState.groups
                  .filter(group => !gameState.solvedGroups.includes(group))
                  .map((group, index) => (
                    <SolvedGroup key={group.category} group={group} animate={true} delay={index * 100} />
                  ))}
              </div>

              {/* Stats Widget */}
              {userStats && (
                <EndGameStatsWidget stats={userStats} className="max-w-sm mx-auto" />
              )}

              <div className="flex justify-center">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WordTile({ word, isSelected, animation, onClick, shake, disabled }: {
  word: string;
  isSelected: boolean;
  animation?: { word: string; fromIndex: number; toIndex: number; };
  onClick: () => void;
  shake?: boolean;
  disabled?: boolean;
}) {
  const isAnimating = !!animation;
  
  let animationStyle: React.CSSProperties = {};
  if (animation) {
    const { translateX, translateY } = calculateTranslate(animation.fromIndex, animation.toIndex);
    animationStyle = {
      '--translate-x': `${translateX}px`,
      '--translate-y': `${translateY}px`
    } as React.CSSProperties;
  }

  return (
    <button
      onClick={onClick}
      disabled={isAnimating || disabled}
      className={`
        h-16 w-full rounded-lg font-bold text-sm transition-all duration-200
        flex items-center justify-center text-center leading-tight
        ${disabled 
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
          : isSelected
            ? 'bg-gray-800 text-white shadow-lg transform scale-95 border-2 border-gray-900'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-transparent hover:shadow-md active:scale-95'
        }
        ${shake ? 'animate-shake' : ''}
        ${isAnimating ? 'animate-slide-to-position' : (!disabled ? 'hover:scale-105 active:scale-95' : '')}
        ${isAnimating ? 'z-20' : ''}
      `}
      style={isAnimating ? animationStyle : {}}
    >
      <span className="px-1">{word}</span>
    </button>
  );
}

function SolvedGroup({ group, animate, delay }: {
  group: WordGroup;
  animate?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`p-2.5 rounded-lg text-center shadow-sm border transition-all duration-500 border-0`}
      style={{
        backgroundColor: group.color,
        animationDelay: delay ? `${delay}ms` : '0ms'
      }}
    >
      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">
        {group.category}
      </h3>
      <p className="text-gray-800 text-sm font-medium">
        {group.words.join(', ')}
      </p>
    </div>
  );
}
