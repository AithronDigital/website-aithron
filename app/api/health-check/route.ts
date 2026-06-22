export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { error } = await supabase.from('health_ping').select('id').limit(1);

    if (error) {
      return NextResponse.json(
        { status: 'error', code: error.code, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: 'ok', supabase: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    );
  }
}