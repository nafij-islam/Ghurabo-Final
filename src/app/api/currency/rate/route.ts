import { NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/currency/exchangeRate';

export async function GET() {
  try {
    const { rate, mode } = await getExchangeRate();
    const response = NextResponse.json({
      success: true,
      rate,
      mode,
      currency: 'USD',
      base: 'BDT',
    });

    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return response;
  } catch (error) {
    return NextResponse.json({
      success: true,
      rate: 130,
      mode: 'manual',
      currency: 'USD',
      base: 'BDT',
    });
  }
}
