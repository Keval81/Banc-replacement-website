import { NextRequest, NextResponse } from 'next/server';
import { fetchNearbyStations } from '@/lib/api/transport';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postcode = searchParams.get('postcode');
    const maxDistance = searchParams.get('maxDistance');
    const limit = searchParams.get('limit');

    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      );
    }

    // Validate postcode format
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode)) {
      return NextResponse.json(
        { error: 'Invalid postcode format' },
        { status: 400 }
      );
    }

    const stations = await fetchNearbyStations(postcode, {
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      postcode,
      count: stations.length,
      stations,
    });
  } catch (error) {
    console.error('Error in transport stations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transport data' },
      { status: 500 }
    );
  }
}
