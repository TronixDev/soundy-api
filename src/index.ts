import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import dotenv from "dotenv/config";

// Replace the API key initialization with this
const apiKeys = process.env.LASTFM_API_KEYS?.split(',') || [];
if (apiKeys.length === 0) {
  throw new Error('LASTFM_API_KEYS environment variable is not set');
}

// Add this function to get random API key
function getRandomApiKey(): string {
  return apiKeys[Math.floor(Math.random() * apiKeys.length)];
}

// Interface for track data
interface Track {
  name: string;
  artist: string;
  listeners: number;
}

// Interface for similar track data
interface SimilarTrack {
  name: string;
  artist: string;
  match: number;
}

// Add this interface after the SimilarTrack interface
interface SimilarArtist {
  name: string;
  match: number;
  image: string;
}

// Function to fetch tracks from Last.fm API
async function getTopTracks(country: string): Promise<Track[]> {
  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=${country}&api_key=${getRandomApiKey()}&format=json`
    );
    const data = await response.json();

    return data.tracks.track.map((track: any) => ({
      name: track.name,
      artist: track.artist.name,
      listeners: parseInt(track.listeners)
    }));
  } catch (error) {
    console.error(`Error fetching tracks for ${country}:`, error);
    return [];
  }
}

// Function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Function to fetch similar tracks from Last.fm API
async function getSimilarTracks(artist: string, track: string): Promise<SimilarTrack[]> {
  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${getRandomApiKey()}&format=json`
    );
    const data = await response.json();

    // Check if similartracks and track array exist
    if (!data.similartracks?.track) {
      console.log(`No similar tracks found for ${track} by ${artist}`);
      return [];
    }

    // Handle case where only one similar track is returned (it won't be an array)
    const tracks = Array.isArray(data.similartracks.track) 
      ? data.similartracks.track 
      : [data.similartracks.track];

    return tracks.map((track: any) => ({
      name: track.name,
      artist: track.artist.name,
      match: parseFloat(track.match)
    }));
  } catch (error) {
    console.error(`Error fetching similar tracks for ${track} by ${artist}:`, error);
    return [];
  }
}

// Add this function after getSimilarTracks function
async function getSimilarArtists(artist: string): Promise<SimilarArtist[]> {
  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${getRandomApiKey()}&format=json`
    );
    const data = await response.json();

    if (!data.similarartists?.artist) {
      console.log(`No similar artists found for ${artist}`);
      return [];
    }

    const artists = Array.isArray(data.similarartists.artist)
      ? data.similarartists.artist
      : [data.similarartists.artist];

    return artists.map((artist: any) => ({
      name: artist.name,
      match: parseFloat(artist.match),
      image: artist.image?.[2]?.['#text'] || ''
    }));
  } catch (error) {
    console.error(`Error fetching similar artists for ${artist}:`, error);
    return [];
  }
}

const app = new Elysia()
  .use(swagger({
    path: '/',
    documentation: {
      info: {
        title: 'Soundy OpenAPI Docs',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }))
  // Root endpoint moved to /api
  .get("/api", () => ({
    message: "Welcome to the API",
    status: "running"
  }))
  
  // Hello endpoint with name parameter
  .get("/hello/:name", ({ params: { name } }) => ({
    message: `Hello ${name}!`
  }), {
    params: t.Object({
      name: t.String()
    })
  })
  
  // Music recommendations endpoint
  .get("/recommendations", async () => {
    try {
      // Fetch tracks from different countries
      const [us, id, jp] = await Promise.all([
        getTopTracks('united states'),
        getTopTracks('indonesia'),
        getTopTracks('japan')
      ]);

      // Combine all tracks
      const allTracks = [...us, ...id, ...jp];

      // Get 50 random tracks from the combined list
      const recommendations = getRandomItems(allTracks, 50);

      return {
        status: 'success',
        data: recommendations
      };
    } catch (error) {
      throw new Error('Failed to fetch recommendations');
    }
  }, {
    detail: {
      tags: ['Music'],
      security: [{ bearerAuth: [] }]
    }
  })
  
  // Similar tracks endpoint
  .get("/similar-tracks", async ({ query }) => {
    const { artist, track } = query;

    if (!artist || !track) {
      throw new Error('Artist and track parameters are required');
    }

    const similarTracks = await getSimilarTracks(artist, track);

    return {
      status: 'success',
      data: similarTracks
    };
  }, {
    query: t.Object({
      artist: t.String(),
      track: t.String()
    }),
    detail: {
      tags: ['Music'],
      security: [{ bearerAuth: [] }]
    }
  })
  
  // Similar artists endpoint
  .get("/similar-artists", async ({ query }) => {
    const { artist } = query;

    if (!artist) {
      throw new Error('Artist parameter is required');
    }

    const similarArtists = await getSimilarArtists(artist);

    return {
      status: 'success',
      data: similarArtists
    };
  }, {
    query: t.Object({
      artist: t.String()
    }),
    detail: {
      tags: ['Music'],
      security: [{ bearerAuth: [] }]
    }
  })
  
  // Error handling
  .onError(({ error }) => {
    console.error(`${error}`);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  })
  
  // Not found handler
  .get("/*", () => ({
    error: 'Not Found',
    message: 'The requested resource was not found'
  }))
  
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
