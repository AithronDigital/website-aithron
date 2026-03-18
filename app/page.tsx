'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modParola, setModParola] = useState(false)
  const [mesajParola, setMesajParola] = useState('')

  useEffect(() => {
    const verificaSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) window.location.href = '/dashboard'
    }
    verificaSession()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) { setError('Completează emailul și parola!'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email sau parolă incorectă!')
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleResetParola = async () => {
    if (!email) { setError('Introdu emailul tău mai întâi!'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-parola`
    })
    if (error) {
      setError('Eroare la trimiterea emailului!')
    } else {
      setMesajParola('✅ Am trimis un link de resetare pe emailul tău!')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(https://webmaster.aithrondigital.com/wp-content/uploads/2026/03/poza-pentru-panel.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(10, 10, 30, 0.65)'
      }} />

      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '20px', padding: '45px 40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏠</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 800, color: '#1a1a2e' }}>
            Aithron Digital
          </h1>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
            {modParola ? 'Resetează parola' : 'Panoul tău de control imobiliar'}
          </p>
        </div>

        {!modParola ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#333' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="agent@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '13px 15px', fontSize: '15px',
                  border: '2px solid #e5e7eb', borderRadius: '10px',
                  outline: 'none', boxSizing: 'border-box' as const
                }}
                onFocus={e => e.target.style.borderColor = '#1a1a2e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#333' }}>
                Parolă
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '13px 15px', fontSize: '15px',
                  border: '2px solid #e5e7eb', borderRadius: '10px',
                  outline: 'none', boxSizing: 'border-box' as const
                }}
                onFocus={e => e.target.style.borderColor = '#1a1a2e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button onClick={() => { setModParola(true); setError('') }}
                style={{ background: 'none', border: 'none', color: '#1a1a2e', fontSize: '13px', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                Am uitat parola
              </button>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleLogin} disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#ccc' : '#1a1a2e',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '16px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}>
              {loading ? '⏳ Se verifică...' : '🔐 Intră în cont'}
            </button>

            <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', margin: 0 }}>
              Probleme cu accesul? Contactează{' '}
              <span style={{ color: '#1a1a2e', fontWeight: 600 }}>AithronDigital</span>
            </p>
          </>
        ) : (
          <>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              Introdu emailul tău și îți trimitem un link pentru a-ți reseta parola.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#333' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="agent@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '13px 15px', fontSize: '15px',
                  border: '2px solid #e5e7eb', borderRadius: '10px',
                  outline: 'none', boxSizing: 'border-box' as const
                }}
                onFocus={e => e.target.style.borderColor = '#1a1a2e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                ⚠️ {error}
              </div>
            )}

            {mesajParola && (
              <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '8px', padding: '10px 14px', color: '#166534', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                {mesajParola}
              </div>
            )}

            <button onClick={handleResetParola} disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#ccc' : '#1a1a2e',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '16px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '15px'
              }}>
              {loading ? '⏳ Se trimite...' : '📧 Trimite link resetare'}
            </button>

            <button onClick={() => { setModParola(false); setError(''); setMesajParola('') }}
              style={{
                width: '100%', padding: '14px',
                background: 'white', color: '#1a1a2e',
                border: '2px solid #1a1a2e', borderRadius: '10px',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer'
              }}>
              ← Înapoi la login
            </button>
          </>
        )}
      </div>
    </div>
  )
}