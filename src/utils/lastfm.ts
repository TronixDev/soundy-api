import type { Track, SimilarTrack, SimilarArtist } from "@/types/music";

interface LastFMTrack {
	name: string;
	artist: {
		name: string;
	};
	listeners: string;
}

interface LastFMSimilarTrack {
	name: string;
	artist: {
		name: string;
	};
	match: string;
}

interface LastFMSimilarArtist {
	name: string;
	match: string;
	image: Array<{
		"#text": string;
		size: string;
	}>;
}

interface LastFMTopTracksResponse {
	tracks: {
		track: LastFMTrack[];
	};
}

interface LastFMSimilarTracksResponse {
	similartracks?: {
		track: LastFMSimilarTrack | LastFMSimilarTrack[];
	};
}

interface LastFMSimilarArtistsResponse {
	similarartists?: {
		artist: LastFMSimilarArtist | LastFMSimilarArtist[];
	};
}

const apiKeys = process.env.LASTFM_API_KEYS?.split(",") || [];

function getRandomApiKey(): string {
	return apiKeys[Math.floor(Math.random() * apiKeys.length)];
}

export function getRandomItems<T>(array: T[], count: number): T[] {
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

export async function getTopTracks(country: string): Promise<Track[]> {
	try {
		const response = await fetch(
			`https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=${country}&api_key=${getRandomApiKey()}&format=json`,
		);
		const data = (await response.json()) as LastFMTopTracksResponse;

		return data.tracks.track.map((track) => ({
			name: track.name,
			artist: track.artist.name,
			listeners: Number.parseInt(track.listeners),
		}));
	} catch (error) {
		console.error(`Error fetching tracks for ${country}:`, error);
		return [];
	}
}

export async function getSimilarTracks(
	artist: string,
	track: string,
): Promise<SimilarTrack[]> {
	try {
		const response = await fetch(
			`https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${getRandomApiKey()}&format=json`,
		);
		const data = (await response.json()) as LastFMSimilarTracksResponse;

		if (!data.similartracks?.track) {
			console.log(`No similar tracks found for ${track} by ${artist}`);
			return [];
		}

		const tracks = Array.isArray(data.similartracks.track)
			? data.similartracks.track
			: [data.similartracks.track];

		return tracks.map((track) => ({
			name: track.name,
			artist: track.artist.name,
			match: Number.parseFloat(track.match),
		}));
	} catch (error) {
		console.error(
			`Error fetching similar tracks for ${track} by ${artist}:`,
			error,
		);
		return [];
	}
}

export async function getSimilarArtists(
	artist: string,
): Promise<SimilarArtist[]> {
	try {
		const response = await fetch(
			`https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${getRandomApiKey()}&format=json`,
		);
		const data = (await response.json()) as LastFMSimilarArtistsResponse;

		if (!data.similarartists?.artist) {
			console.log(`No similar artists found for ${artist}`);
			return [];
		}

		const artists = Array.isArray(data.similarartists.artist)
			? data.similarartists.artist
			: [data.similarartists.artist];

		return artists.map((artist) => ({
			name: artist.name,
			match: Number.parseFloat(artist.match),
			image: artist.image?.[2]?.["#text"] || "",
		}));
	} catch (error) {
		console.error(`Error fetching similar artists for ${artist}:`, error);
		return [];
	}
}
