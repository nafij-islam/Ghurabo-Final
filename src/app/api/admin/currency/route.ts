import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/serverAuth';
import { updateExchangeRate, getExchangeRate } from '@/lib/currency/exchangeRate';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const data = await getExchangeRate();
  return NextResponse.json({ success: true, ...data });
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { rate, mode } = await request.json();

    if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid exchange rate number' }, { status: 400 });
    }

    const success = await updateExchangeRate(rate, mode === 'automatic' ? 'automatic' : 'manual');
    if (success) {
      return NextResponse.json({ success: true, rate, mode, message: 'Exchange rate updated successfully' });
    }

    return NextResponse.json({ success: false, error: 'Failed to update rate' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update exchange rate' }, { status: 500 });
  }
}
