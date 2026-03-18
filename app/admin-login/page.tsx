'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Completează toate câmpurile!'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email sau parolă incorectă!')
      setLoading(false)
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email === 'mirela25lili@gmail.com') {
      router.replace('/admin')
    } else {
      await supabase.auth.signOut()
      setError('Nu ai acces la această pagină!')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '45px 40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>👑</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}>
            Admin Panel
          </h1>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Aithron Digital</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Email</label>
          <input
            type="email"
            placeholder="admin@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '13px 15px', fontSize: '15px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' as const }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Parolă</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '13px 15px', fontSize: '15px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' as const }}
          />
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: '14px',
          background: loading ? '#ccc' : '#e94560',
          color: 'white', border: 'none', borderRadius: '10px',
          fontSize: '16px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}>
          {loading ? '⏳ Se verifică...' : '🔐 Intră în Admin'}
        </button>
      </div>
    </div>
  )
}