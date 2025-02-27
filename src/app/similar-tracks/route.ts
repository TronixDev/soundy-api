import { NextResponse } from 'next/server';
import { getSimilarTracks } from '@/utils/lastfm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artist = searchParams.get('artist');
    const track = searchParams.get('track');

    if (!artist || !track) {
      return NextResponse.json(
        { error: 'Artist and track parameters are required' },
        { status: 400 }
      );
    }

    const similarTracks = await getSimilarTracks(artist, track);

    return NextResponse.json({
      status: 'success',
      data: similarTracks
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch similar tracks' },
      { status: 500 }
    );
  }
} 