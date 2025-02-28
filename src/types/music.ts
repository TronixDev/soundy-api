export interface Track {
	name: string;
	artist: string;
	listeners: number;
}

export interface SimilarTrack {
	name: string;
	artist: string;
	match: number;
}

export interface SimilarArtist {
	name: string;
	match: number;
	image: string;
}
