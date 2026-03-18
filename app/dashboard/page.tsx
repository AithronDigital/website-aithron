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

  useEffect(() => {
    const verificaSesiunea = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/')
      } else {
        setVerificat(true)
      }
    }
    verificaSesiunea()
  }, [])

  if (!verificat) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '230px', background: '#1a1a2e', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column', position: 'sticky' as const, top: 0, height: '100vh' }}>
        <h2 style={{ color: '#e94560', marginBottom: '40px', fontSize: '20px' }}>🏠 Aithron Digital</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {meniu.map(item => (
            <button key={item.id} onClick={() => setSectiune(item.id)} style={{
              background: sectiune === item.id ? '#e94560' : 'transparent',
              color: 'white', border: 'none', padding: '12px 15px',
              borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '15px'
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.replace('/')
          }}
          style={{ background: 'transparent', color: '#e94560', border: 'none', cursor: 'pointer', textAlign: 'left' as const, padding: '12px 15px', fontSize: '15px', width: '100%' }}
        >
          🚪 Deconectare
        </button>
      </div>

      <div style={{ flex: 1, padding: '40px', background: '#f5f5f5', overflowY: 'auto' as const }}>
        {sectiune === 'dashboard' && <SectiuneDashboard onNavigate={setSectiune} />}
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