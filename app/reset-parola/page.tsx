'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetParola() {
  const [parola, setParola] = useState('')
  const [confirmaParola, setConfirmaParola] = useState('')
  const [loading, setLoading] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [eroare, setEroare] = useState('')

  const handleReset = async () => {
    if (!parola || !confirmaParola) { setEroare('Completează ambele câmpuri!'); return }
    if (parola !== confirmaParola) { setEroare('Parolele nu coincid!'); return }
    if (parola.length < 6) { setEroare('Parola trebuie să aibă minim 6 caractere!'); return }
    setLoading(true)
    setEroare('')
    const { error } = await supabase.auth.updateUser({ password: parola })
    if (error) {
      setEroare('Eroare la resetarea parolei!')
    } else {
      setMesaj('✅ Parola a fost schimbată cu succes!')
      setTimeout(() => { window.location.href = '/' }, 3000)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(https://webmaster.aithrondigital.com/wp-content/uploads/2026/03/poza-pentru-panel.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,10,30,0.65)' }} />
      <div style={{
        position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.97)',
        borderRadius: '20px', padding: '45px 40px', width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔑</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 800, color: '#1a1a2e' }}>Parolă nouă</h1>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Introdu noua ta parolă</p>
        </div>

        {mesaj ? (
          <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '10px', padding: '20px', textAlign: 'center', color: '#166534', fontWeight: 600 }}>
            {mesaj}
            <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#888' }}>Te redirecționăm la login...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Parolă nouă</label>
              <input type="password" placeholder="••••••••" value={parola}
                onChange={e => setParola(e.target.value)}
                style={{ width: '100%', padding: '13px 15px', fontSize: '15px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' as const }}
                onFocus={e => e.target.style.borderColor = '#1a1a2e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Confirmă parola</label>
              <input type="password" placeholder="••••••••" value={confirmaParola}
                onChange={e => setConfirmaParola(e.target.value)}
                style={{ width: '100%', padding: '13px 15px', fontSize: '15px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' as const }}
                onFocus={e => e.target.style.borderColor = '#1a1a2e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            {eroare && (
              <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                ⚠️ {eroare}
              </div>
            )}
            <button onClick={handleReset} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#ccc' : '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Se salvează...' : '🔐 Salvează parola nouă'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}