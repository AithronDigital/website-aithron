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
  poza_profil_url?: string
}

export default function GhidCumparator() {
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
        .select('poza_profil_url')
        .eq('agent_id', gasit.id)
        .single()
      setAgent({ nume: gasit.nume, telefon: gasit.telefon, poza_profil_url: setari?.poza_profil_url || '' })
      setLoading(false)
    }
    if (slug) cauta()
  }, [slug])

  const telefon = agent?.telefon?.replace(/\s/g, '') || ''
  const telefonWA = telefon.startsWith('0') ? '4' + telefon : telefon
  const whatsappLink = `https://wa.me/${telefonWA}?text=Bună ziua! Am citit Ghidul Cumpărătorului și aș dori să discutăm.`

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #c9a84c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (negasit) return (
    <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Georgia, serif', textAlign: 'center', padding: '20px' }}>
      <div>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
        <h1 style={{ color: '#c9a84c', marginBottom: '8px' }}>Pagina nu a fost găsită</h1>
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
        .btn-download { background: linear-gradient(135deg, #c9a84c, #e8c96d, #c9a84c); background-size: 200% auto; color: #0f1923; border: none; padding: 18px 40px; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 15px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block; }
        .btn-download:hover { background-position: right center; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(201,168,76,0.4); }
        .btn-whatsapp { background: transparent; color: #c9a84c; border: 1px solid #c9a84c; padding: 16px 36px; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 15px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block; }
        .btn-whatsapp:hover { background: rgba(201,168,76,0.1); transform: translateY(-2px); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0f1923', fontFamily: "'Jost', sans-serif" }}>
        <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center', animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'inline-block', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', fontSize: '11px', letterSpacing: '3px', padding: '6px 18px', marginBottom: '50px', textTransform: 'uppercase', fontWeight: 500 }}>
            GHID COMPLET · CUMPĂRARE LOCUINȚĂ
          </div>

          {agent?.poza_profil_url ? (
            <img src={agent.poza_profil_url} alt={agent.nume} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a84c', display: 'block', margin: '0 auto 20px' }} />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>👤</div>
          )}

          <p style={{ color: '#8899aa', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>Ghid pregătit de</p>
          <h2 style={{ color: '#c9a84c', fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, marginBottom: '4px' }}>{agent?.nume}</h2>
          <p style={{ color: '#6677aa', fontSize: '13px', letterSpacing: '1px', marginBottom: '50px' }}>Agent imobiliar</p>

          <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', margin: '0 auto 50px' }} />

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 54px)', fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: '16px' }}>
            Tot ce trebuie să știi<br />
            <em style={{ color: '#c9a84c' }}>înainte să cumperi.</em>
          </h1>

          <p style={{ color: '#8899aa', fontSize: '16px', lineHeight: 1.7, marginBottom: '50px', fontWeight: 300 }}>
            De la primul gând până la cheile în mână — un ghid complet cu 6 capitole esențiale, scris pentru oameni, nu pentru avocați.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '50px', textAlign: 'left' }}>
            {['Bugetul și prioritățile tale','Ce să cauți la o proprietate','Procesul pas cu pas','Actele de care ai nevoie','Greșelile de evitat','Arta negocierii'].map((cap, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '4px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#c9a84c', fontSize: '11px', fontWeight: 500, minWidth: '22px' }}>0{i + 1}</span>
                <span style={{ color: '#aabbcc', fontSize: '13px', fontWeight: 300 }}>{cap}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <a href="/ghiduri/ghid-cumparator.pdf" target="_blank" rel="noopener noreferrer" className="btn-download">↓ Descarcă Ghidul Gratuit</a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">💬 Contactează-l pe {agent?.nume?.split(' ')[0]}</a>
          </div>

          {agent?.telefon && (
            <p style={{ color: '#6677aa', fontSize: '13px', marginTop: '24px', letterSpacing: '1px' }}>
              sau sună direct: <a href={`tel:${telefon}`} style={{ color: '#c9a84c', textDecoration: 'none' }}>{agent.telefon}</a>
            </p>
          )}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '60px', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#3d4f5e', fontSize: '12px', letterSpacing: '1px' }}>© 2026 Aithron Digital · Ghid pentru Cumpărători</p>
        </div>
      </div>
    </>
  )
}