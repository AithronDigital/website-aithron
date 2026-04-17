'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function numeToSlug(nume: string): string {
  return nume
    .toLowerCase()
    .replace(/[ăâ]/g, 'a')
    .replace(/[î]/g, 'i')
    .replace(/[șşśš]/g, 's')
    .replace(/[țţ]/g, 't')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim()
}

export default function SectiuneMarketing() {
  const [slug, setSlug] = useState('')
  const [copiat, setCopiat] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const incarca = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('agenti')
        .select('nume')
        .eq('email', session.user.email)
        .single()
      if (data?.nume) setSlug(numeToSlug(data.nume))
      setLoading(false)
    }
    incarca()
  }, [])

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://website.aithrondigital.com'
  const linkCumparator = `${baseUrl}/ghid-cumparator/${slug}`
  const linkVanzator = `${baseUrl}/ghid-vanzator/${slug}`

  const copiaza = async (tip: string, link: string) => {
    await navigator.clipboard.writeText(link)
    setCopiat(tip)
    setTimeout(() => setCopiat(null), 2500)
  }

  const ghiduri = [
    {
      id: 'cumparator',
      titlu: 'Ghid pentru Cumparatori',
      descriere: 'Trimite-l clientilor care vor sa cumpere o proprietate. Contine 6 capitole esentiale — buget, vizionari, acte, negociere.',
      link: linkCumparator,
      culoare: '#e94560',
      bg: 'rgba(233,69,96,0.12)',
      border: 'rgba(233,69,96,0.3)',
    },
    {
      id: 'vanzator',
      titlu: 'Ghid pentru Vanzatori',
      descriere: 'Trimite-l clientilor care vor sa vanda. Contine pretul corect, pregatirea proprietatii, procesul complet in 8 pasi.',
      link: linkVanzator,
      culoare: '#c9a84c',
      bg: 'rgba(201,168,76,0.12)',
      border: 'rgba(201,168,76,0.3)',
    },
  ]

  return (
    <div style={{ minHeight: '100%' }}>
      <div style={{ background: '#1a1a2e', borderRadius: '14px', padding: '28px 32px', marginBottom: '24px' }}>
        <h1 style={{ color: '#c9a84c', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>
          Materiale Marketing
        </h1>
        <p style={{ color: '#8899bb', fontSize: '14px', margin: 0 }}>
          Ghiduri profesionale pentru clientii tai — cu numele tau, gata de trimis pe WhatsApp.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Se incarca...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {ghiduri.map(ghid => (
            <div key={ghid.id} style={{ background: '#1a1a2e', border: `1px solid ${ghid.border}`, borderRadius: '14px', padding: '28px' }}>
              <div style={{ display: 'inline-block', background: ghid.bg, border: `1px solid ${ghid.border}`, borderRadius: '6px', padding: '4px 12px', marginBottom: '16px' }}>
                <span style={{ color: ghid.culoare, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const }}>
                  PDF · 11 PAGINI
                </span>
              </div>

              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 10px' }}>
                {ghid.titlu}
              </h3>

              <p style={{ color: '#8899bb', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
                {ghid.descriere}
              </p>

              <div style={{ background: '#0f3460', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                <span style={{ color: '#aabbdd', fontSize: '12px', wordBreak: 'break-all' as const, display: 'block' }}>
                  {ghid.link}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => copiaza(ghid.id, ghid.link)}
                  style={{ flex: 1, background: copiat === ghid.id ? '#1a4a2e' : ghid.culoare, color: copiat === ghid.id ? '#4caf50' : '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {copiat === ghid.id ? 'Link copiat!' : 'Copiaza link'}
                </button>
                <a href={ghid.link} target="_blank" rel="noopener noreferrer" style={{ background: '#0f3460', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  Vezi
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#1a1a2e', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '12px', padding: '18px 24px' }}>
        <p style={{ color: '#8899bb', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
          Fiecare link este personalizat cu datele tale. Clientul vede numele tau, poza ta si un buton de contact direct pe WhatsApp.
        </p>
      </div>
    </div>
  )
}