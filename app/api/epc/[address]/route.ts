import { NextRequest, NextResponse } from 'next/server';
import { fetchEPCByAddress, fetchEPCByUPRN } from '@/lib/api/epc';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const postcode = searchParams.get('postcode');
    const uprn = searchParams.get('uprn');

    if (uprn) {
      const certificate = await fetchEPCByUPRN(uprn);
      
      if (!certificate) {
        return NextResponse.json(
          { error: 'EPC certificate not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(certificate);
    }

    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      );
    }

    const { address } = await params;
    const decodedAddress = decodeURIComponent(address);
    const certificate = await fetchEPCByAddress(decodedAddress, postcode);
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'EPC certificate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error in EPC API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch EPC data' },
      { status: 500 }
    );
  }
}
