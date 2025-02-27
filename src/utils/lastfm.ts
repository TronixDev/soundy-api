const apiKeys = process.env.LASTFM_API_KEYS?.split(',') || [];

function getRandomApiKey(): string {
  return apiKeys[Math.floor(Math.random() * apiKeys.length)];
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function getTopTracks(country: string) {
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

export async function getSimilarTracks(artist: string, track: string) {
  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${getRandomApiKey()}&format=json`
    );
    const data = await response.json();

    if (!data.similartracks?.track) {
      console.log(`No similar tracks found for ${track} by ${artist}`);
      return [];
    }

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

export async function getSimilarArtists(artist: string) {
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