# NYT Connections Clone

A recreation of the New York Times Connections game built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✨ Authentic NYT Connections-style solve animations
- 🎯 One-away feedback for near-miss guesses
- 🔄 Word shuffling functionality
- 📱 Responsive design for all devices
- 🎨 Smooth animations and transitions
- 📊 Share results functionality
- 🎮 Complete game mechanics (4 mistakes, win/lose states)

## Setup

### Prerequisites

- Node.js 18+ 
- A running Connections API server (see API Configuration below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd connections-clone
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Configure the API connection (see API Configuration below)

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Configuration

This application fetches puzzle data from an external Connections API. You need to configure the API host.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
CONNECTIONS_API_HOST=localhost:8000
```

Or set the environment variable in your deployment environment.

### API Endpoint

The application expects the API to be available at:
```
GET http://{CONNECTIONS_API_HOST}/v1/connections/{date}
```

Where `{date}` is in YYYY-MM-DD format (e.g., `2025-04-04`).

### Expected API Response Format

The API should return JSON in the following format:

```json
{
  "id": "1",
  "date": "2025-04-04",
  "categories": [
    {
      "title": "FISHING GEAR",
      "cards": [
        {"content": "BAIT", "position": 0},
        {"content": "HOOK", "position": 1},
        {"content": "LINE", "position": 2},
        {"content": "SINKER", "position": 3}
      ]
    },
    // ... 3 more categories
  ]
}
```

### Testing the API

You can test your API connection with:

```bash
curl -X 'GET' \
  'http://localhost:8000/v1/connections/2025-04-04' \
  -H 'accept: application/json'
```

## Development

### Project Structure

- `/src/components/` - React components
- `/src/hooks/` - Custom React hooks
- `/src/lib/` - Utility functions
- `/src/types/` - TypeScript type definitions
- `/src/app/api/` - Next.js API routes

### Key Components

- `GameBoard.tsx` - Main game interface
- `useConnections.ts` - Game logic hook
- `/api/puzzle/route.ts` - API route that fetches from external service

## Deployment

### Docker Deployment (Recommended)

This application includes a production-ready Docker setup with multi-environment support.

#### Quick Start with Docker

```bash
# Build the image
docker build -t connections-frontend .

# Run with default settings (API at localhost:8000)
docker run -p 80:80 connections-frontend

# Run with custom API host
docker run -p 80:80 -e CONNECTIONS_API_HOST=api.example.com:8080 connections-frontend
```

#### Multi-Environment Support

The Docker image supports runtime configuration through environment variables:

```bash
# Development
docker run -p 3000:80 -e CONNECTIONS_API_HOST=localhost:8000 connections-frontend

# Staging
docker run -p 80:80 -e CONNECTIONS_API_HOST=staging-api.example.com connections-frontend

# Production
docker run -p 80:80 -e CONNECTIONS_API_HOST=api.example.com connections-frontend
```

#### Docker Compose

Use the included `docker-compose.yml` for easy deployment:

```bash
# Edit docker-compose.yml to set your API host
docker-compose up -d
```

#### Container Registry

Images are automatically built and published to GitHub Container Registry:

```bash
# Pull and run the latest image
docker run -p 80:80 -e CONNECTIONS_API_HOST=your-api.com ghcr.io/mend32/connections-frontend:latest
```

### Traditional Deployment

#### Environment Variables for Production

Set the following environment variable in your production environment:

```env
CONNECTIONS_API_HOST=your-api-host.com
```

#### Build

```bash
npm run build
npm start
```

## License

[Add your license here]