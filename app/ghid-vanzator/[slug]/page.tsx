'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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

interface Agent {
  nume: string
  telefon: string
  agentie: string
  poza_url?: string
}

export default function GhidVanzator() {
  const params = useParams()
  const slug = params?.slug as string
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [negasit, setNegasit] = useState(false)

  useEffect(() => {
    const cauta = async () => {
      const { data: agenti } = await supabase.from('agenti').select('id, nume, telefon')
      if (!agenti) { setNegasit(true); setLoading(false); return }
      const gasit = agenti.find(a => numeToSlug(a.nume) === slug)
      if (!gasit) { setNegasit(true); setLoading(false); return }
      const { data: setari } = await supabase
        .from('setari_agent')
        .select('poza_url, agentie, telefon')
        .eq('user_id', gasit.id)
        .single()
      setAgent({
        nume: gasit.nume,
        telefon: setari?.telefon || gasit.telefon,
        agentie: setari?.agentie || 'Agent imobiliar',
        poza_url: setari?.poza_url || ''
      })
      setLoading(false)
    }
    if (slug) cauta()
  }, [slug])

  const telefon = agent?.telefon?.replace(/\s/g, '') || ''
  const telefonWA = telefon.startsWith('0') ? '4' + telefon : telefon
  const whatsappLink = `https://wa.me/${telefonWA}?text=Buna ziua! Am citit Ghidul Vanzatorului si as dori sa discutam despre proprietatea mea.`

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #c9a84c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (negasit) return (
    <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '20px' }}>
      <div>
        <h1 style={{ color: '#c9a84c', marginBottom: '8px' }}>Pagina nu a fost gasita</h1>
        <p style={{ color: '#8899aa' }}>Linkul este incorect sau agentul nu mai este activ.</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0f1923; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .btn-gold { background: linear-gradient(135deg, #c9a84c, #e8c96d, #c9a84c); background-size: 200% auto; color: #0f1923; border: none; padding: 18px 40px; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block; width: 100%; text-align: center; }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(201,168,76,0.4); }
        .btn-wa { background: #1a3a5c; color: #c9a84c; border: 1px solid rgba(201,168,76,0.4); padding: 16px 40px; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block; width: 100%; text-align: center; }
        .btn-wa:hover { background: #1f4a78; transform: translateY(-2px); }
        .btn-tel { background: transparent; color: #8899aa; border: 1px solid rgba(255,255,255,0.1); padding: 14px 40px; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 400; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block; width: 100%; text-align: center; }
        .btn-tel:hover { border-color: rgba(201,168,76,0.3); color: #c9a84c; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0f1923', fontFamily: "'Jost', sans-serif" }}>
        <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

        <div style={{ maxWidth: '620px', margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center', animation: 'fadeUp 0.7s ease both' }}>

          <div style={{ display: 'inline-block', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', fontSize: '10px', letterSpacing: '3px', padding: '5px 16px', marginBottom: '48px', textTransform: 'uppercase' as const }}>
            GHID COMPLET · VANZARE IMOBILIARA
          </div>

          {agent?.poza_url ? (
            <img src={agent.poza_url} alt={agent.nume} style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a84c', display: 'block', margin: '0 auto 16px' }} />
          ) : (
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
          )}

          <h2 style={{ color: 'white', fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, marginBottom: '4px' }}>{agent?.nume}</h2>
          <p style={{ color: '#c9a84c', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '48px' }}>{agent?.agentie}</p>

          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', margin: '0 auto 48px' }} />

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 6vw, 52px)', fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: '16px' }}>
            Vinde-ti proprietatea<br />
            <em style={{ color: '#c9a84c' }}>la pretul corect.</em>
          </h1>

          <p style={{ color: '#8899aa', fontSize: '15px', lineHeight: 1.8, marginBottom: '40px', fontWeight: 300 }}>
            Tot ce trebuie sa stii inainte sa pui proprietatea pe piata — informatii reale, pasi clari, greseli de evitat.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '40px', textAlign: 'left' }}>
            {['Cum stabilesti pretul corect','Pregatirea proprietatii','Procesul pas cu pas','Actele necesare vanzarii','Greselile care costa','De ce sa lucrezi cu un agent'].map((cap, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '4px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#c9a84c', fontSize: '11px', fontWeight: 600, minWidth: '20px' }}>0{i + 1}</span>
                <span style={{ color: '#aabbcc', fontSize: '12px', fontWeight: 300 }}>{cap}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="https://vmmkvbmuhyhmeaplwptk.supabase.co/storage/v1/object/public/ghiduri/ghid-vanzator.pdf" target="_blank" rel="noopener noreferrer" className="btn-gold">
              Vezi Ghidul Gratuit
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-wa">
              Scrie pe WhatsApp agentului tau
            </a>
            {agent?.telefon && (
              <a href={`tel:${telefon}`} className="btn-tel">
                Suna direct: {agent.telefon}
              </a>
            )}
          </div>

        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '60px', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#2d3f50', fontSize: '11px', letterSpacing: '1px' }}>2026 Aithron Digital · Ghid pentru Vanzatori</p>
        </div>
      </div>
    </>
  )
}