import { UserStats } from '@/types/game';
import { Trophy, TrendingUp } from 'lucide-react';

interface EndGameStatsWidgetProps {
  stats: UserStats;
  className?: string;
}

export function EndGameStatsWidget({ stats, className = '' }: EndGameStatsWidgetProps) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-center gap-6">
        {/* Win Percentage */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.winPercentage}%</div>
          <div className="text-xs text-gray-500">{stats.gamesWon}/{stats.gamesPlayed}</div>
        </div>

        {/* Current Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500">current</div>
        </div>
      </div>
    </div>
  );
}