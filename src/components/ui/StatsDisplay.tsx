import { UserStats } from '@/types/game';

interface StatsDisplayProps {
  stats: UserStats;
  className?: string;
}

export function StatsDisplay({ stats, className = '' }: StatsDisplayProps) {
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-3 text-center">Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Games Played */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
          <div className="text-sm text-purple-100">Played</div>
        </div>
        
        {/* Win Percentage */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.winPercentage}%</div>
          <div className="text-sm text-purple-100">Win %</div>
        </div>
        
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
          <div className="text-sm text-purple-100">Current Streak</div>
        </div>
        
        {/* Max Streak */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.maxStreak}</div>
          <div className="text-sm text-purple-100">Max Streak</div>
        </div>
      </div>
      
      {/* Games Won - Shown prominently */}
      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{stats.gamesWon}</div>
          <div className="text-sm text-purple-100">Games Won</div>
        </div>
      </div>
      
      {stats.lastPlayedDate && (
        <div className="mt-3 text-center">
          <div className="text-xs text-purple-200">
            Last played: {new Date(stats.lastPlayedDate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatsModalProps {
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
}

export function StatsModal({ stats, isOpen, onClose }: StatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-purple-600 rounded-lg p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Your Statistics</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <StatsDisplay stats={stats} />
        
        <button
          onClick={onClose}
          className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}