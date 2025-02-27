import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Base response schemas
const SuccessResponse = z.object({
  status: z.literal('success'),
});

const ErrorResponse = z.object({
  error: z.string(),
});

// Track schema
export const TrackSchema = z.object({
  name: z.string().openapi({ example: "Song Name" }),
  artist: z.string().openapi({ example: "Artist Name" }),
  listeners: z.number().int().openapi({ example: 1000000 }),
});

// Similar Track schema
export const SimilarTrackSchema = z.object({
  name: z.string().openapi({ example: "Similar Song" }),
  artist: z.string().openapi({ example: "Similar Artist" }),
  match: z.number().openapi({ example: 0.75 }),
});

// Similar Artist schema
export const SimilarArtistSchema = z.object({
  name: z.string().openapi({ example: "Similar Artist" }),
  match: z.number().openapi({ example: 0.75 }),
  image: z.string().openapi({ 
    example: "https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png" 
  }),
});

// Register schemas
registry.register('Track', TrackSchema);
registry.register('SimilarTrack', SimilarTrackSchema);
registry.register('SimilarArtist', SimilarArtistSchema);

// Register API endpoints
registry.registerPath({
  method: 'get',
  path: '/',
  description: 'Get API status and available endpoints',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: "Welcome to the API" }),
            status: z.string().openapi({ example: "running" }),
            endpoints: z.object({
              '/recommendations': z.string(),
              '/similar-tracks': z.string(),
              '/similar-artists': z.string(),
            }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/recommendations',
  description: 'Get music recommendations from different countries (US, Indonesia, Japan)',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: SuccessResponse.extend({
            data: z.array(TrackSchema),
          }),
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/similar-tracks',
  description: 'Get tracks similar to a specified track by an artist',
  request: {
    query: z.object({
      artist: z.string().openapi({ 
        description: 'Artist name',
        example: "Radiohead" 
      }),
      track: z.string().openapi({ 
        description: 'Track name',
        example: "Creep" 
      }),
    }),
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: SuccessResponse.extend({
            data: z.array(SimilarTrackSchema),
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/similar-artists',
  description: 'Get artists similar to a specified artist',
  request: {
    query: z.object({
      artist: z.string().openapi({ 
        description: 'Artist name',
        example: "Radiohead" 
      }),
    }),
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: SuccessResponse.extend({
            data: z.array(SimilarArtistSchema),
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});