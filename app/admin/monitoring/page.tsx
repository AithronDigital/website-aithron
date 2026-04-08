'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const ADMIN_EMAIL = 'mirela25lili@gmail.com'

type Agent = {
  id: number
  nume: string
  email: string
  wp_url: string
  activ: boolean
  status?: string
  last_check?: string
  pagespeed_score?: number
  seo_score?: number
  ssl_status?: string
  last_error?: string
}

export default function Monitoring() {
  const router = useRouter()
  const [verificat, setVerificat] = useState(false)
  const [agenti, setAgenti] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [verificandId, setVerificandId] = useState<number | null>(null)

  useEffect(() => {
    const verificaSesiunea = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.replace('/')
      } else {
        setVerificat(true)
        incarcaAgenti()
      }
    }
    verificaSesiunea()
  }, [])

  const incarcaAgenti = async () => {
    const { data } = await supabase.from('agenti').select('*').order('created_at', { ascending: false })
    if (data) setAgenti(data)
  }

  const verificaSite = async (agent: Agent) => {
    if (!agent.wp_url) return
    setVerificandId(agent.id)

    try {
      const url = agent.wp_url.startsWith('http') ? agent.wp_url : `https://${agent.wp_url}`

      // Verificare uptime
      let status = 'offline'
      let last_error = ''
      try {
        const resp = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(10000) })
        if (resp.ok) status = 'online'
      } catch {
        status = 'offline'
        last_error = 'Site inaccessibil'
      }

      // Verificare PageSpeed
      let pagespeed_score = null
      try {
        const psResp = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile`)
        if (psResp.ok) {
          const psData = await psResp.json()
          pagespeed_score = Math.round((psData.lighthouseResult?.categories?.performance?.score || 0) * 100)
        }
      } catch {}

      // Verificare SEO basic
      let seo_score = 0
      try {
        const seoResp = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        if (seoResp.ok) {
          const seoData = await seoResp.json()
          const html = seoData.contents || ''
          if (html.includes('<title>') && !html.includes('<title></title>')) seo_score += 25
          if (html.includes('meta name="description"')) seo_score += 25
          if (html.includes('<h1')) seo_score += 25
          if (html.includes('robots')) seo_score += 25
        }
      } catch {}

      // Verificare SSL
      const ssl_status = url.startsWith('https') ? 'valid' : 'missing'

      // Salvare în Supabase
      await supabase.from('agenti').update({
        status,
        last_check: new Date().toISOString(),
        pagespeed_score,
        seo_score,
        ssl_status,
        last_error: last_error || null
      }).eq('id', agent.id)

      incarcaAgenti()
    } catch (err) {
      console.error(err)
    } finally {
      setVerificandId(null)
    }
  }

  const verificaToti = async () => {
    setLoading(true)
    for (const agent of agenti) {
      if (agent.wp_url) await verificaSite(agent)
    }
    setLoading(false)
  }

  const getStatusColor = (status?: string) => {
    if (status === 'online') return '#22c55e'
    if (status === 'offline') return '#ef4444'
    return '#f59e0b'
  }

  const getStatusIcon = (status?: string) => {
    if (status === 'online') return '🟢'
    if (status === 'offline') return '🔴'
    return '🟡'
  }

  const getScoreColor = (score?: number) => {
    if (!score) return '#888'
    if (score >= 90) return '#22c55e'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const formatData = (data?: string) => {
    if (!data) return 'Neverificat'
    return new Date(data).toLocaleString('ro-RO')
  }

  if (!verificat) return null

  const online = agenti.filter(a => a.status === 'online').length
  const offline = agenti.filter(a => a.status === 'offline').length
  const necunoscut = agenti.filter(a => !a.status || a.status === 'unknown').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: '#1a1a2e', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column', position: 'sticky' as const, top: 0, height: '100vh' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#e94560', fontSize: '20px', margin: '0 0 5px' }}>👑 Admin Panel</h2>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Aithron Digital</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'agenti', icon: '👥', label: 'Agenți', path: '/admin' },
            { id: 'monitoring', icon: '📡', label: 'Monitoring', path: '/admin/monitoring' },
            { id: 'abonamente', icon: '💰', label: 'Abonamente', path: '/admin' },
            { id: 'statistici', icon: '📊', label: 'Statistici', path: '/admin' },
            { id: 'setari', icon: '⚙️', label: 'Setări platformă', path: '/admin' },
          ].map(item => (
            <button key={item.id} onClick={() => router.push(item.path)} style={{
              background: item.id === 'monitoring' ? '#e94560' : 'transparent',
              color: 'white', border: 'none', padding: '12px 15px',
              borderRadius: '8px', cursor: 'pointer', textAlign: 'left' as const, fontSize: '15px'
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); router.replace('/') }}
          style={{ background: 'transparent', color: '#e94560', border: 'none', cursor: 'pointer', textAlign: 'left' as const, padding: '12px 15px', fontSize: '15px' }}>
          🚪 Deconectare
        </button>
      </div>

      {/* Conținut */}
      <div style={{ flex: 1, padding: '40px', background: '#f5f5f5', overflowY: 'auto' as const }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#1a1a2e' }}>📡 Monitoring</h1>
          <button onClick={verificaToti} disabled={loading} style={{
            background: '#e94560', color: 'white', border: 'none', padding: '12px 25px',
            borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 600,
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? '⏳ Verificare...' : '🔄 Verifică toate site-urile'}
          </button>
        </div>

        {/* Statistici rapide */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Online', value: online, icon: '🟢', color: '#22c55e' },
            { label: 'Offline', value: offline, icon: '🔴', color: '#ef4444' },
            { label: 'Necunoscut', value: necunoscut, icon: '🟡', color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>{stat.icon}</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Lista site-uri */}
        {agenti.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📡</div>
            <p>Nu ai agenți cu site-uri configurate.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {agenti.map(a => (
              <div key={a.id} style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '20px' }}>{getStatusIcon(a.status)}</span>
                      <span style={{ fontWeight: 700, fontSize: '18px' }}>{a.nume}</span>
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>{a.wp_url || 'URL nedefinit'}</div>
                    <div style={{ color: '#aaa', fontSize: '12px', marginTop: '4px' }}>
                      Ultima verificare: {formatData(a.last_check)}
                    </div>
                    {a.last_error && (
                      <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                        ⚠️ {a.last_error}
                      </div>
                    )}
                  </div>
                  <button onClick={() => verificaSite(a)} disabled={verificandId === a.id} style={{
                    background: '#f5f5f5', color: '#333', border: '1px solid #ddd',
                    padding: '8px 16px', borderRadius: '8px', cursor: verificandId === a.id ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 600
                  }}>
                    {verificandId === a.id ? '⏳ ...' : '🔍 Verifică'}
                  </button>
                </div>

                {/* Scoruri */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                  <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Status</div>
                    <div style={{ fontWeight: 700, color: getStatusColor(a.status), fontSize: '16px' }}>
                      {a.status === 'online' ? 'Online' : a.status === 'offline' ? 'Offline' : 'Necunoscut'}
                    </div>
                  </div>
                  <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>⚡ Viteză</div>
                    <div style={{ fontWeight: 700, color: getScoreColor(a.pagespeed_score), fontSize: '22px' }}>
                      {a.pagespeed_score ?? '—'}
                    </div>
                  </div>
                  <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>🔍 SEO</div>
                    <div style={{ fontWeight: 700, color: getScoreColor(a.seo_score), fontSize: '22px' }}>
                      {a.seo_score ?? '—'}
                    </div>
                  </div>
                  <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>🔒 SSL</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: a.ssl_status === 'valid' ? '#22c55e' : a.ssl_status === 'missing' ? '#ef4444' : '#888' }}>
                      {a.ssl_status === 'valid' ? '✅ Valid' : a.ssl_status === 'missing' ? '❌ Lipsă' : '—'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}