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
      icon: '🏠',
      titlu: 'Ghid pentru Cumpărători',
      descriere: 'Trimite-l clienților care vor să cumpere o proprietate. Conține 6 capitole esențiale — buget, vizionări, acte, negociere.',
      link: linkCumparator,
      culoare: '#e94560',
    },
    {
      id: 'vanzator',
      icon: '🔑',
      titlu: 'Ghid pentru Vânzători',
      descriere: 'Trimite-l clienților care vor să vândă. Conține prețul corect, pregătirea proprietății, procesul complet în 8 pași.',
      link: linkVanzator,
      culoare: '#c9a84c',
    },
  ]

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
        📣 Materiale Marketing
      </h1>
      <p style={{ color: '#8899aa', fontSize: '14px', marginBottom: '32px' }}>
        Ghiduri profesionale pentru clienții tăi — cu numele tău, gata de trimis pe WhatsApp.
      </p>

      {loading ? (
        <div style={{ color: '#8899aa', textAlign: 'center', padding: '40px' }}>Se încarcă...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {ghiduri.map(ghid => (
            <div key={ghid.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '28px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${ghid.culoare}22`,
                  border: `1px solid ${ghid.culoare}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0
                }}>
                  {ghid.icon}
                </div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>{ghid.titlu}</h3>
                  <span style={{ color: ghid.culoare, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, fontWeight: 500 }}>
                    PDF · 11 pagini
                  </span>
                </div>
              </div>

              <p style={{ color: '#8899aa', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
                {ghid.descriere}
              </p>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px',
                overflow: 'hidden'
              }}>
                <span style={{ color: '#7788aa', fontSize: '12px', wordBreak: 'break-all' as const }}>
                  {ghid.link}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => copiaza(ghid.id, ghid.link)}
                  style={{
                    flex: 1,
                    background: copiat === ghid.id ? '#1a4a2e' : ghid.culoare,
                    color: copiat === ghid.id ? '#4caf50' : (ghid.id === 'vanzator' ? '#0f1923' : 'white'),
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copiat === ghid.id ? '✓ Link copiat!' : '📋 Copiază link'}
                </button>
                
                  href={ghid.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#aabbcc',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  👁️
                </a>
              </div>

              <p style={{ color: '#445566', fontSize: '11px', marginTop: '12px', textAlign: 'center' as const }}>
                Copiază linkul și trimite-l pe WhatsApp clienților tăi
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '28px',
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
        <p style={{ color: '#8899aa', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
          Fiecare link este personalizat cu datele tale — clientul vede numele tău, poza ta și un buton de contact direct. Ghidurile sunt gratuite pentru clienții tăi și te poziționează ca un profesionist de încredere.
        </p>
      </div>
    </div>
  )
}