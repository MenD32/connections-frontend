import { Button } from '@/components/ui/button';
import { Github, ArrowLeft, Code, Bug } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 to-purple-600 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Back Button */}
        <div className="flex justify-start">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/20 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Connections Icon */}
        <div className="mx-auto w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
          <div className="grid grid-cols-2 gap-1 w-12 h-12">
            <div className="bg-purple-100 rounded-sm"></div>
            <div className="bg-purple-200 rounded-sm"></div>
            <div className="bg-purple-300 rounded-sm"></div>
            <div className="bg-purple-400 rounded-sm"></div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            About Connections
          </h1>
          <p className="text-purple-100 text-lg">
            An open-source remake of the popular word puzzle
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 text-purple-100">
          <p className="text-sm leading-relaxed">
            An open-source remake of The New York Times Connections puzzle game. 
            Find groups of four words that share something in common across four 
            different difficulty levels.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Code className="w-5 h-5 text-blue-300" />
              <span>Built with Next.js, TypeScript & Tailwind CSS</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Github className="w-5 h-5 text-gray-300" />
              <span>Open source and freely available</span>
            </div>
          </div>
        </div>

        {/* GitHub Link */}
        <div className="space-y-4">
          <Button
            onClick={() => window.open('https://github.com/MenD32/connections-frontend', '_blank')}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full text-lg flex items-center justify-center gap-3"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://github.com/MenD32/connections-frontend/issues/new?template=bug_report.md', '_blank')}
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-full flex items-center justify-center gap-2"
            >
              <Bug className="w-4 h-4" />
              Report Bug
            </Button>
            
            <Button
              onClick={() => window.open('https://github.com/MenD32/connections-frontend/issues/new?template=feature_request.md', '_blank')}
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-full flex items-center justify-center gap-2"
            >
              <Code className="w-4 h-4" />
              Request Feature
            </Button>
          </div>
          
          <p className="text-purple-200 text-xs">
            Open source • MIT License • Contributions welcome
          </p>
        </div>

        {/* Version Info */}
        <div className="text-purple-200 text-xs">
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}