import { NextRequest, NextResponse } from 'next/server';
import { PuzzleData } from '@/types/game';

// Required for static export compatibility
export const dynamic = 'force-dynamic';

// Interface for the external API response
interface ExternalPuzzleResponse {
  id: string;
  date: string;
  categories: Array<{
    title: string;
    cards: Array<{
      content: string;
      position: number;
    }>;
  }>;
}

// Difficulty mapping based on category position (0=easy, 1=medium, 2=hard, 3=hardest)
const difficultyMap = ['easy', 'medium', 'hard', 'hardest'] as const;

// Color mapping for difficulty levels
const colorMap = {
  easy: '#f9d71c',    // Yellow
  medium: '#a7c957',  // Green  
  hard: '#6895d2',    // Blue
  hardest: '#b19cd9'  // Purple
};

export async function GET(request: NextRequest) {
  try {
    // Get API host from environment variable or default to localhost
    const apiHost = process.env.CONNECTIONS_API_HOST || 'localhost:8000';
    
    // For now, always fetch the specific date 2025-04-04
    const targetDate = '2025-04-04';

    // Fetch from external API
    const apiUrl = `http://${apiHost}/v1/connections/${targetDate}`;
    const response = await fetch(apiUrl, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Puzzle not found for the specified date' },
          { status: 404 }
        );
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const externalData: ExternalPuzzleResponse = await response.json();
    
    // Transform external API format to our game format
    const puzzle: PuzzleData = {
      date: new Date(externalData.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      puzzleNumber: parseInt(externalData.id) || 1,
      groups: externalData.categories.map((category, index) => {
        // Sort cards by position to get original word order
        const sortedCards = [...category.cards].sort((a, b) => a.position - b.position);
        
        return {
          category: category.title,
          words: sortedCards.map(card => card.content),
          difficulty: difficultyMap[index] || 'easy',
          color: colorMap[difficultyMap[index] || 'easy']
        };
      })
    };

    return NextResponse.json(puzzle);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}