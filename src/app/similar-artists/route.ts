import { NextResponse } from "next/server";
import { getSimilarArtists } from "@/utils/lastfm";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const artist = searchParams.get("artist");

		if (!artist) {
			return NextResponse.json(
				{ error: "Artist parameter is required" },
				{ status: 400 },
			);
		}

		const similarArtists = await getSimilarArtists(artist);

		return NextResponse.json({
			status: "success",
			data: similarArtists,
		});
	} catch (error: unknown) {
		console.error("Failed to fetch similar artists:", error);
		return NextResponse.json(
			{ error: "Failed to fetch similar artists" },
			{ status: 500 },
		);
	}
}
