'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function EcardPublic() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const incarca = async () => {
      const { data } = await supabase.from('ecard').select('*').limit(1).single()
      setData(data)
      setLoading(false)
    }
    incarca()
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: 'white', background: '#1a1a2e', minHeight: '100vh' }}>⏳ Se încarcă...</div>
  if (!data) return <div style={{ textAlign: 'center', padding: '50px' }}>Cardul electronic este indisponibil.</div>

  const c = data.culoare_principala || '#3b82f6'
  const cInchis = '#1a1a2e'
  const linkEcard = typeof window !== 'undefined' ? `${window.location.origin}/ecard` : '/ecard'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkEcard)}`

  const btn = (culoare: string) => ({
    background: culoare, color: 'white', padding: '14px',
    borderRadius: '12px', textDecoration: 'none', fontWeight: 700 as const,
    fontSize: '16px', textAlign: 'center' as const, display: 'block', marginBottom: '10px'
  })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

        {/* HERO FUNDAL */}
        <div style={{
          height: '220px',
          background: data.poza_fundal_url ? `url(${data.poza_fundal_url}) center/cover` : `linear-gradient(135deg, ${c}, ${cInchis})`,
          position: 'relative'
        }}>
          {/* POZA PROFIL 150px */}
          <div style={{
            width: '150px', height: '150px', borderRadius: '50%',
            border: '4px solid white',
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
            position: 'absolute', bottom: '-75px', left: '50%', transform: 'translateX(-50%)',
            background: data.poza_profil_url ? `url(${data.poza_profil_url}) center/cover` : c,
            backgroundSize: 'cover',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '50px', overflow: 'hidden'
          }}>
            {!data.poza_profil_url && '👤'}
          </div>
        </div>

        {/* CONTINUT ALB */}
        <div style={{ background: 'white', paddingTop: '85px', paddingBottom: '0px', paddingLeft: '25px', paddingRight: '25px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 5px', fontSize: '24px', color: cInchis }}>{data.nume}</h1>
          <p style={{ margin: '0 0 5px', color: c, fontWeight: 700, fontSize: '16px' }}>{data.titlu}</p>
          {data.agentie && <p style={{ margin: '0 0 20px', color: '#888', fontSize: '14px' }}>{data.agentie}</p>}
          {data.despre && <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px', lineHeight: 1.7 }}>{data.despre}</p>}

          {data.whatsapp && <a href={`https://wa.me/${data.whatsapp}`} style={{ ...btn('#25D366'), marginBottom: '10px' }}>💬 WhatsApp</a>}
          {data.telefon && <a href={`tel:${data.telefon}`} style={btn(c)}>📞 {data.telefon}</a>}
          {data.email && <a href={`mailto:${data.email}`} style={btn(c)}>✉️ {data.email}</a>}
          {data.link_site && <a href={data.link_site} target="_blank" rel="noreferrer" style={btn(c)}>🌐 Vizitează Site-ul</a>}
          {data.link_proprietati && <a href={data.link_proprietati} target="_blank" rel="noreferrer" style={btn(c)}>🏡 Proprietăți</a>}
          {data.link_servicii && <a href={data.link_servicii} target="_blank" rel="noreferrer" style={btn(c)}>🛠️ Servicii</a>}
          {data.link_despre_noi && <a href={data.link_despre_noi} target="_blank" rel="noreferrer" style={btn(c)}>👤 Despre noi</a>}

          {data.whatsapp_ghid_vanzator && (
            <a href={`https://wa.me/${data.whatsapp_ghid_vanzator}?text=${encodeURIComponent('Bună ziua! Doresc Ghidul Vânzătorului Gratuit.')}`}
              target="_blank" rel="noreferrer" style={btn(cInchis)}>
              🏠 Solicită Ghidul Vânzătorului Gratuit
            </a>
          )}
          {data.whatsapp_ghid_cumparator && (
            <a href={`https://wa.me/${data.whatsapp_ghid_cumparator}?text=${encodeURIComponent('Bună ziua! Doresc Ghidul Cumpărătorului Gratuit.')}`}
              target="_blank" rel="noreferrer" style={btn(cInchis)}>
              🔑 Solicită Ghidul Cumpărătorului Gratuit
            </a>
          )}

          {(data.facebook || data.instagram || data.linkedin || data.youtube || data.tiktok) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', margin: '15px 0' }}>
              {data.facebook && <a href={data.facebook} target="_blank" rel="noreferrer" style={{ fontSize: '32px', textDecoration: 'none' }}>📘</a>}
              {data.instagram && <a href={data.instagram} target="_blank" rel="noreferrer" style={{ fontSize: '32px', textDecoration: 'none' }}>📷</a>}
              {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: '32px', textDecoration: 'none' }}>💼</a>}
              {data.youtube && <a href={data.youtube} target="_blank" rel="noreferrer" style={{ fontSize: '32px', textDecoration: 'none' }}>▶️</a>}
              {data.tiktok && <a href={data.tiktok} target="_blank" rel="noreferrer" style={{ fontSize: '32px', textDecoration: 'none' }}>🎵</a>}
            </div>
          )}

          {/* QR - footer dark, fara branding */}
          <div style={{
            background: cInchis,
            margin: '15px -25px 0',
            padding: '20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
          }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Scanează pentru eCard
            </p>
            <div style={{ background: 'white', padding: '8px', borderRadius: '10px', display: 'inline-block' }}>
              <img src={qrUrl} alt="QR" style={{ width: '90px', height: '90px', display: 'block' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}