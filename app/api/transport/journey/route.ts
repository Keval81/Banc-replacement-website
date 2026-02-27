import { NextRequest, NextResponse } from 'next/server';
import { planJourney } from '@/lib/api/transport';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date') || undefined;
    const time = searchParams.get('time') || undefined;
    const modes = searchParams.get('modes');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Both from and to postcodes are required' },
        { status: 400 }
      );
    }

    // Validate postcode format
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
    if (!postcodeRegex.test(from) || !postcodeRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid postcode format' },
        { status: 400 }
      );
    }

    const journey = await planJourney(from, to, {
      date,
      time,
      mode: modes ? modes.split(',') as any : undefined,
    });

    return NextResponse.json(journey);
  } catch (error) {
    console.error('Error in journey planner API:', error);
    return NextResponse.json(
      { error: 'Failed to plan journey' },
      { status: 500 }
    );
  }
}
