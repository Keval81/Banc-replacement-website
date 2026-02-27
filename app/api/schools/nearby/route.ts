import { NextRequest, NextResponse } from 'next/server';
import { fetchSchoolsNearby } from '@/lib/api/schools';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postcode = searchParams.get('postcode');
    const phase = searchParams.get('phase') as 'primary' | 'secondary' | 'all-through' | 'sixth-form' | undefined;
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

    const schools = await fetchSchoolsNearby(postcode, {
      phase,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      postcode,
      count: schools.length,
      schools,
    });
  } catch (error) {
    console.error('Error in schools API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school data' },
      { status: 500 }
    );
  }
}
