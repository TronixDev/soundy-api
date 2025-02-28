import { NextResponse } from "next/server";
import { getTopTracks, getRandomItems } from "@/utils/lastfm";

export async function GET() {
	try {
		// Fetch tracks from different countries
		const [us, id, jp] = await Promise.all([
			getTopTracks("united states"),
			getTopTracks("indonesia"),
			getTopTracks("japan"),
		]);

		// Combine all tracks
		const allTracks = [...us, ...id, ...jp];

		// Get 50 random tracks from the combined list
		const recommendations = getRandomItems(allTracks, 50);

		return NextResponse.json({
			status: "success",
			data: recommendations,
		});
	} catch (error: unknown) {
		console.error("Failed to fetch recommendations:", error);
		return NextResponse.json(
			{ error: "Failed to fetch recommendations" },
			{ status: 500 },
		);
	}
}
