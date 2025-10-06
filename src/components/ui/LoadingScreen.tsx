import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading puzzle..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 to-purple-600 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Connections Icon with animation */}
        <div className="mx-auto w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center animate-pulse">
          <div className="grid grid-cols-2 gap-1 w-12 h-12">
            <div className="bg-purple-100 rounded-sm animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="bg-purple-200 rounded-sm animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="bg-purple-300 rounded-sm animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="bg-purple-400 rounded-sm animate-bounce" style={{ animationDelay: '450ms' }}></div>
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

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-purple-100 text-sm">{message}</p>
        </div>

        {/* Animated Connection Lines */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Compact loading component for inline use
export function InlineLoadingSpinner({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
}