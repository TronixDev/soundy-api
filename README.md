# Soundy API

A modern API for music recommendations and sound processing built with Next.js. This API provides endpoints for getting music recommendations, similar tracks, and similar artists using the Last.fm API.

## Features

- Get top tracks by country
- Find similar tracks based on artist and track name
- Get similar artists recommendations
- OpenAPI documentation
- Multiple Last.fm API key support for load balancing
- Turborepo for faster builds

## Documentations

- [Click here to view the API documentation](https://api.soundy.my.id/)

## Getting Started

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/idMJA/soundy-api)

### Prerequisites

- Node.js 18+ 
- Last.fm API key(s)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/idMJA/soundy-api.git
cd soundy-api
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set your Last.fm API key(s) in the `.env` file.

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Access the API documentation at [http://localhost:3000/](http://localhost:3000/).

You can also edit the API documentation in the `src/lib/openapi.ts` file.
