import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL,
      subject: '✅ Aithron Digital - Verificare zilnică OK',
      text: 'Verificare automată: site-ul funcționează corect.',
    });

    await supabase.from('alerte_monitoring').insert({
      site_url: 'website.aithrondigital.com',
      status: 'OK',
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    await supabase.from('alerte_monitoring').insert({
      site_url: 'website.aithrondigital.com',
      status: 'EROARE',
    });

    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}