import { Button } from '@/components/ui/button';

interface ConnectionsLandingProps {
  onStartGame: () => void;
}

export function ConnectionsLanding({ onStartGame }: ConnectionsLandingProps) {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPuzzleNumber = () => {
    // Calculate puzzle number based on days since launch (you can adjust the start date)
    const startDate = new Date('2023-06-12'); // NY Times Connections launch date
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 to-purple-600 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Connections Icon */}
        <div className="mx-auto w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
          <div className="grid grid-cols-2 gap-1 w-12 h-12">
            <div className="bg-purple-200 rounded-sm"></div>
            <div className="bg-purple-300 rounded-sm"></div>
            <div className="bg-purple-300 rounded-sm"></div>
            <div className="bg-purple-400 rounded-sm"></div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Connections
          </h1>
          <p className="text-purple-100 text-lg">
            Group words that share a common thread
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={onStartGame}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full text-lg"
          >
            Play
          </Button>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full py-3"
            >
              How to Play
            </Button>
          </div>
        </div>

        {/* Game Info */}
        <div className="text-center text-purple-100 space-y-1">
          <p className="text-sm">{getCurrentDate()}</p>
          <p className="text-sm">No. {getPuzzleNumber()}</p>
        </div>
      </div>
    </div>
  );
}
