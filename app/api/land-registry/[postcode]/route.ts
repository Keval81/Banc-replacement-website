import { NextRequest, NextResponse } from 'next/server';
import { fetchSoldPrices, fetchSoldPriceStats } from '@/lib/api/landRegistry';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postcode: string }> }
) {
  try {
    const { postcode: rawPostcode } = await params;
    const postcode = decodeURIComponent(rawPostcode);
    
    // Validate postcode format
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode)) {
      return NextResponse.json(
        { error: 'Invalid postcode format' },
        { status: 400 }
      );
    }

    const [prices, stats] = await Promise.all([
      fetchSoldPrices(postcode),
      fetchSoldPriceStats(postcode),
    ]);

    return NextResponse.json({
      postcode,
      prices,
      stats,
    });
  } catch (error) {
    console.error('Error in land registry API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sold price data' },
      { status: 500 }
    );
  }
}
