import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface ConnectionsLandingProps {
  onStartGame: (date?: string) => void;
}

export function ConnectionsLanding({ onStartGame }: ConnectionsLandingProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateForAPI = (dateStr: string) => {
    // Convert YYYY-MM-DD to API format
    return dateStr;
  };

  const handleDateSubmit = () => {
    if (selectedDate) {
      onStartGame(formatDateForAPI(selectedDate));
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
            <div className="bg-purple-100 rounded-sm"></div>
            <div className="bg-purple-200 rounded-sm"></div>
            <div className="bg-purple-300 rounded-sm"></div>
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
            onClick={() => onStartGame()}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full text-lg"
          >
            Play
          </Button>
          
          <Button
            onClick={() => setShowDatePicker(!showDatePicker)}
            variant="outline"
            className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-full text-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Choose Date
          </Button>
          
          {showDatePicker && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <div className="text-center">
                <p className="text-gray-700 font-medium mb-2">Select a date:</p>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={getTodayDateString()}
                  min="2023-06-12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleDateSubmit}
                  disabled={!selectedDate}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Play This Date
                </Button>
                <Button
                  onClick={() => {
                    setShowDatePicker(false);
                    setSelectedDate('');
                  }}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
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
