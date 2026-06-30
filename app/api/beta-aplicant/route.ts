import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nume, email, telefon, judet, mesaj } = body

    if (!nume || !email || !telefon) {
      return NextResponse.json({ error: 'Campuri obligatorii lipsa' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('beta_aplicanti')
      .insert([{
        nume: String(nume),
        email: String(email),
        telefon: String(telefon),
        judet: judet ? String(judet) : '',
        mesaj: mesaj ? String(mesaj) : '',
        status: 'in_asteptare'
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Eroare server', details: String(err) }, { status: 500 })
  }
}