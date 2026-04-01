'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { meniu } from './componente/types'
import SectiuneDashboard from './componente/SectiuneDashboard'
import SectiuneProprietati from './componente/SectiuneProprietati'
import SectiuneCRM from './componente/SectiuneCRM'
import SectiuneSetari from './componente/SectiuneSetari'
import SectiuneBlog from './componente/SectiuneBlog'
import SectiuneEditareSite from './componente/SectiuneEditareSite'
import SectiuneEcard from './componente/SectiuneEcard'

export default function Dashboard() {
  const router = useRouter()
  const [verificat, setVerificat] = useState(false)
  const [sectiune, setSectiune] = useState('dashboard')
  const [menuDeschis, setMenuDeschis] = useState(false)
  const [esteDesktop, setEsteDesktop] = useState(true)

  useEffect(() => {
    const verificaSesiunea = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/')
        return
      }
      if (session.user.email === 'mirela25lili@gmail.com') {
        router.replace('/admin')
        return
      }
      setVerificat(true)
    }
    verificaSesiunea()

    const verificaDimensiune = () => setEsteDesktop(window.innerWidth >= 900)
    verificaDimensiune()
    window.addEventListener('resize', verificaDimensiune)
    return () => window.removeEventListener('resize', verificaDimensiune)
  }, [])

  useEffect(() => {
    if (!verificat) return
    window.history.pushState({ sectiune }, '', window.location.pathname)
  }, [sectiune, verificat])

  useEffect(() => {
    if (!verificat) return
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.sectiune) {
        setSectiune(e.state.sectiune)
      } else {
        setSectiune('dashboard')
      }
      setMenuDeschis(false)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [verificat])

  if (!verificat) return null

  const navigheaza = (id: string) => {
    setSectiune(id)
    setMenuDeschis(false)
  }

  if (esteDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div style={{ width: '230px', background: '#1a1a2e', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column', position: 'sticky' as const, top: 0, height: '100vh' }}>
          <h2 style={{ color: '#e94560', marginBottom: '40px', fontSize: '20px' }}>🏠 Aithron Digital</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {meniu.map(item => (
              <button key={item.id} onClick={() => navigheaza(item.id)} style={{
                background: sectiune === item.id ? '#e94560' : 'transparent',
                color: 'white', border: 'none', padding: '12px 15px',
                borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '15px'
              }}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.replace('/') }}
            style={{ background: 'transparent', color: '#e94560', border: 'none', cursor: 'pointer', textAlign: 'left' as const, padding: '12px 15px', fontSize: '15px', width: '100%' }}
          >
            🚪 Deconectare
          </button>
        </div>
        <div style={{ flex: 1, padding: '40px', background: '#f5f5f5', overflowY: 'auto' as const }}>
          {sectiune === 'dashboard' && <SectiuneDashboard onNavigate={navigheaza} />}
          {sectiune === 'proprietati' && <SectiuneProprietati />}
          {sectiune === 'crm' && <SectiuneCRM />}
          {sectiune === 'blog' && <SectiuneBlog />}
          {sectiune === 'site' && <SectiuneEditareSite />}
          {sectiune === 'ecard' && <SectiuneEcard />}
          {sectiune === 'setari' && <SectiuneSetari />}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', background: '#f5f5f5' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#1a1a2e', color: 'white', padding: '15px 20px',
        position: 'sticky' as const, top: 0, zIndex: 100
      }}>
        <h2 style={{ color: '#e94560', margin: 0, fontSize: '18px' }}>🏠 Aithron Digital</h2>
        <button
          onClick={() => setMenuDeschis(!menuDeschis)}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '26px', cursor: 'pointer', padding: '0 5px' }}
        >
          {menuDeschis ? '✕' : '☰'}
        </button>
      </div>

      {menuDeschis && (
        <div style={{
          position: 'fixed', top: '57px', left: 0, right: 0, bottom: 0,
          background: '#1a1a2e', zIndex: 99, padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          {meniu.map(item => (
            <button key={item.id} onClick={() => navigheaza(item.id)} style={{
              background: sectiune === item.id ? '#e94560' : 'transparent',
              color: 'white', border: 'none', padding: '15px 20px',
              borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontSize: '17px'
            }}>
              {item.icon} {item.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={async () => { await supabase.auth.signOut(); router.replace('/') }}
            style={{ background: 'transparent', color: '#e94560', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '15px 20px', fontSize: '17px' }}
          >
            🚪 Deconectare
          </button>
        </div>
      )}

      <div style={{ padding: '25px 20px' }}>
        {sectiune === 'dashboard' && <SectiuneDashboard onNavigate={navigheaza} />}
        {sectiune === 'proprietati' && <SectiuneProprietati />}
        {sectiune === 'crm' && <SectiuneCRM />}
        {sectiune === 'blog' && <SectiuneBlog />}
        {sectiune === 'site' && <SectiuneEditareSite />}
        {sectiune === 'ecard' && <SectiuneEcard />}
        {sectiune === 'setari' && <SectiuneSetari />}
      </div>
    </div>
  )
}