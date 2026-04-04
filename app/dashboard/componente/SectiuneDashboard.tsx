'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SectiuneDashboard({ onNavigate }: { onNavigate: (sectiune: string) => void }) {
  const [stats, setStats] = useState({ proprietati: 0, contacte: 0, blog: 0 })
  const [nume, setNume] = useState('')
  const [wpUrl, setWpUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { incarcaDate() }, [])

  const incarcaDate = async () => {
    try {
      const { data: setari } = await supabase.from('setari_agent').select('nume, wp_url, wp_username, wp_password').single()
      if (setari?.nume) setNume(setari.nume)
      if (setari?.wp_url) setWpUrl(setari.wp_url)

      const { count: contacte } = await supabase.from('contacte_crm').select('*', { count: 'exact', head: true })

      let proprietati = 0
      let blog = 0
      if (setari?.wp_url) {
        try {
          const tokenRes = await fetch(`${setari.wp_url}/wp-json/jwt-auth/v1/token`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: setari.wp_username, password: setari.wp_password })
          })
          const tokenData = await tokenRes.json()
          if (tokenData.token) {
            const [propRes, blogRes] = await Promise.all([
              fetch(`${setari.wp_url}/wp-json/wp/v2/proprietati?per_page=1&status=publish`, { headers: { 'Authorization': `Bearer ${tokenData.token}` } }),
              fetch(`${setari.wp_url}/wp-json/wp/v2/posts?per_page=1&status=publish`, { headers: { 'Authorization': `Bearer ${tokenData.token}` } })
            ])
            proprietati = parseInt(propRes.headers.get('X-WP-Total') || '0')
            blog = parseInt(blogRes.headers.get('X-WP-Total') || '0')
          }
        } catch (e) { console.log('WordPress offline') }
      }

      setStats({ proprietati, contacte: contacte || 0, blog })
    } catch (e) { console.log('Eroare dashboard') }
    finally { setLoading(false) }
  }

  const ora = new Date().getHours()
  const salut = ora < 12 ? 'Bună dimineața' : ora < 18 ? 'Bună ziua' : 'Bună seara'

  const carduri = [
    { label: 'Proprietăți active', value: stats.proprietati, icon: '🏡', color: '#e94560', bg: '#fff0f3' },
    { label: 'Contacte CRM', value: stats.contacte, icon: '👥', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Articole blog', value: stats.blog, icon: '📝', color: '#22c55e', bg: '#f0fdf4' },
  ]

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', borderRadius: '16px', padding: '30px 35px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', color: 'white', fontSize: '24px' }}>
            {salut}{nume ? `, ${nume}` : ''}! 👋
          </h1>
          <p style={{ color: '#888', margin: 0, fontSize: '15px' }}>
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ fontSize: '60px' }}>🏠</div>
      </div>

      {wpUrl && (
        <a href={wpUrl} target="_blank" rel="noreferrer" style={{
          display: 'block', background: '#e94560', color: 'white',
          padding: '18px 30px', borderRadius: '14px', textDecoration: 'none',
          fontSize: '17px', fontWeight: 700, textAlign: 'center' as const,
          marginBottom: '20px', boxShadow: '0 4px 15px rgba(233,69,96,0.4)'
        }}>
          🌐 Vezi website-ul meu
        </a>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {carduri.map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '14px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderLeft: `4px solid ${card.color}` }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '15px' }}>
              {card.icon}
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a2e', marginBottom: '5px' }}>
              {loading ? '...' : card.value}
            </div>
            <div style={{ color: '#888', fontSize: '14px', fontWeight: 500 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '14px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ margin: '0 0 20px', color: '#1a1a2e', fontSize: '16px' }}>⚡ Acțiuni rapide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Proprietate nouă', icon: '🏡', color: '#e94560', sectiune: 'proprietati' },
            { label: 'Client nou CRM', icon: '👤', color: '#3b82f6', sectiune: 'crm' },
            { label: 'Articol nou', icon: '📝', color: '#22c55e', sectiune: 'blog' },
            { label: 'Editează site', icon: '🌐', color: '#8b5cf6', sectiune: 'site' },
          ].map(actiune => (
            <div key={actiune.label}
              onClick={() => onNavigate(actiune.sectiune)}
              style={{ background: '#f8f9fa', borderRadius: '10px', padding: '15px', textAlign: 'center', cursor: 'pointer', border: '1px solid #f0f0f0' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = actiune.color; (e.currentTarget as HTMLDivElement).style.color = 'white' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#f8f9fa'; (e.currentTarget as HTMLDivElement).style.color = '#333' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{actiune.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{actiune.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}