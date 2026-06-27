import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { nume, email, telefon, judet, mesaj } = await req.json()

    if (!nume || !email || !telefon) {
      return NextResponse.json({ error: 'Nume, email si telefon sunt obligatorii' }, { status: 400 })
    }

    const { error } = await supabase.from('beta_aplicanti').insert([{
      nume, email, telefon, judet: judet || '', mesaj: mesaj || '', status: 'in_asteptare'
    }])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}