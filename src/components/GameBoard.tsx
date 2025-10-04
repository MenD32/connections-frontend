import { Button } from '@/components/ui/button';
import { WordGroup } from '@/types/game';
import { useConnections } from '@/hooks/useConnections';
import { ChevronLeft, RotateCcw, Share2, Check } from 'lucide-react';
import { generateShareText, copyToClipboard } from '@/lib/shareUtils';
import { samplePuzzle } from '@/data/puzzles';
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
}

export function GameBoard({ onBackToMenu }: GameBoardProps) {
  const [copied, setCopied] = useState(false);
  
  const {
    gameState,
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
  } = useConnections();

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const handleShare = async () => {
    const shareText = generateShareText(gameState, samplePuzzle.puzzleNumber);
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

          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Connections</h1>
            <p className="text-xs text-gray-500">{getCurrentDate()}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetGame}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 -mr-2"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 pb-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Instructions */}
          {gameState.gameStatus === 'playing' && (
            <div className="text-center text-gray-700 font-medium">
              <p>Create four groups of four!</p>
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
                    onClick={() => selectWord(word)}
                    shake={(lastGuessResult === 'incorrect' || lastGuessResult === 'one-away') && isWordSelected(word)}
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
          {gameState.gameStatus === 'playing' && (
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
                <h2 className="text-3xl font-bold text-green-600 mb-2 animate-bounce">Perfect!</h2>
                <p className="text-gray-600">You solved today's puzzle!</p>
              </div>
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

          {/* Hint System */}
          {gameState.gameStatus === 'playing' && (
            <div className="text-center">
              <Button
                onClick={toggleHints}
                variant="ghost"
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-all hover:scale-105"
              >
                {gameState.showHints ? 'Hide Hints' : 'View difficulty'}
              </Button>

              {gameState.showHints && (
                <div className="mt-4 flex justify-center gap-2 flex-wrap animate-fade-in">
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Easy</div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Medium</div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Hard</div>
                  <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Hardest</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WordTile({ word, isSelected, animation, onClick, shake }: {
  word: string;
  isSelected: boolean;
  animation?: { word: string; fromIndex: number; toIndex: number; };
  onClick: () => void;
  shake?: boolean;
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
      disabled={isAnimating}
      className={`
        h-16 w-full rounded-lg font-bold text-sm transition-all duration-200
        flex items-center justify-center text-center leading-tight
        ${isSelected
          ? 'bg-gray-800 text-white shadow-lg transform scale-95 border-2 border-gray-900'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-transparent hover:shadow-md active:scale-95'
        }
        ${shake ? 'animate-shake' : ''}
        ${isAnimating ? 'animate-slide-to-position' : 'hover:scale-105 active:scale-95'}
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
      className={`p-2.5 rounded-lg text-center shadow-sm border transition-all duration-500 border-0 ${
        animate ? 'animate-pop-up' : ''
      }`}
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
