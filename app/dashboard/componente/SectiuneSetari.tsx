'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { inp, lbl } from './types'

export default function SectiuneSetari() {
  const [form, setForm] = useState({
    nume: '', email: '', telefon: '', oras: '', agentie: '', despre: '', poza_url: ''
  })
  const [salvare, setSalvare] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pozaFile, setPozaFile] = useState<File | null>(null)
  const [pozaPreview, setPozaPreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')

  useEffect(() => { incarcaSetari() }, [])

  const incarcaSetari = async () => {
    try {
      const { data } = await supabase.from('setari_agent').select('*').single()
      if (data) {
        const dataClean = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v === null ? '' : v])
        )
        setForm(prev => ({ ...prev, ...dataClean }))
        if (data.poza_url) setPozaPreview(data.poza_url)
      }
    } catch (e) { console.log('Eroare la încărcare setări.') }
  }

  const getToken = async () => {
    const { data: setari } = await supabase.from('setari_agent').select('wp_url, wp_username, wp_password').single()
    if (!setari) throw new Error('Nu am găsit credențialele WordPress.')
    const res = await fetch(`${setari.wp_url}/wp-json/jwt-auth/v1/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: setari.wp_username, password: setari.wp_password })
    })
    const data = await res.json()
    if (!data.token) throw new Error('Autentificare eșuată.')
    return { token: data.token, wpUrl: setari.wp_url }
  }

  const uploadPoza = async (file: File): Promise<string> => {
    setUploadProgress('Se încarcă poza...')
    const { token, wpUrl } = await getToken()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    const data = await res.json()
    setUploadProgress('')
    if (!data.source_url) throw new Error('Upload eșuat.')
    return data.source_url
  }

  const salveaza = async () => {
    setSalvare('loading')
    setErrorMsg('')
    try {
      let pozaUrl = form.poza_url
      if (pozaFile) pozaUrl = await uploadPoza(pozaFile)

      const { data: row } = await supabase.from('setari_agent').select('id').single()
      await supabase.from('setari_agent').update({
        nume: form.nume, email: form.email, telefon: form.telefon,
        oras: form.oras, agentie: form.agentie, despre: form.despre, poza_url: pozaUrl,
      }).eq('id', row?.id)

      // Sincronizează și în eCard automat
      const { data: ecard } = await supabase.from('ecard').select('id').limit(1).single()
      if (ecard) {
        await supabase.from('ecard').update({
          nume: form.nume,
          telefon: form.telefon,
          email: form.email,
          agentie: form.agentie,
          despre: form.despre,
          poza_profil_url: pozaUrl,
        }).eq('id', ecard.id)
      }

      setForm(prev => ({ ...prev, poza_url: pozaUrl }))
      if (pozaUrl) setPozaPreview(pozaUrl)
      setPozaFile(null)
      setSalvare('success')
      setTimeout(() => setSalvare('idle'), 3000)
    } catch (e: any) {
      setSalvare('error')
      setErrorMsg(e.message)
    }
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 5px' }}>⚙️ Setări Profil</h1>
      <p style={{ color: '#666', marginBottom: '25px' }}>Actualizează datele tale personale.</p>

      {salvare === 'success' && (
        <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px', color: '#166534', fontWeight: 600 }}>
          ✅ Datele au fost salvate și sincronizate cu eCard!
        </div>
      )}
      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', marginBottom: '20px', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {uploadProgress && (
        <div style={{ background: '#fef9c3', border: '1px solid #fbbf24', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontWeight: 600 }}>
          ⏳ {uploadProgress}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', alignItems: 'start' }}>

        {/* Stânga — card profil vizual */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          borderRadius: '20px', padding: '35px 25px', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%',
            border: '4px solid #e94560',
            background: pozaPreview ? `url(${pozaPreview}) center/cover` : '#e94560',
            backgroundSize: 'cover',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', margin: '0 auto 15px', overflow: 'hidden'
          }}>
            {!pozaPreview && '👤'}
          </div>
          <h3 style={{ color: 'white', margin: '0 0 5px', fontSize: '18px' }}>
            {form.nume || 'Numele tău'}
          </h3>
          <p style={{ color: '#e94560', margin: '0 0 5px', fontWeight: 600, fontSize: '14px' }}>
            {form.agentie || 'Agenția ta'}
          </p>
          <p style={{ color: '#888', margin: '0 0 20px', fontSize: '13px' }}>
            {form.oras || 'Orașul tău'}
          </p>
          <label style={{
            display: 'block', background: '#e94560', color: 'white',
            padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 600
          }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setPozaFile(f); setPozaPreview(URL.createObjectURL(f)) }
            }} />
            📷 {pozaFile ? 'Schimbă poza' : 'Alege poza'}
          </label>
          {pozaFile && (
            <p style={{ color: '#22c55e', fontSize: '12px', margin: '8px 0 0', fontWeight: 600 }}>
              ✅ {pozaFile.name}
            </p>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '25px', paddingTop: '20px' }}>
            <p style={{ color: '#888', fontSize: '12px', margin: '0 0 8px' }}>📧 {form.email || '—'}</p>
            <p style={{ color: '#888', fontSize: '12px', margin: '0 0 8px' }}>📞 {form.telefon || '—'}</p>
          </div>

          <div style={{ background: 'rgba(233,69,96,0.15)', borderRadius: '10px', padding: '12px', marginTop: '15px' }}>
            <p style={{ color: '#e94560', fontSize: '12px', margin: 0, fontWeight: 600 }}>
              💡 Datele se sincronizează automat cu eCard-ul tău
            </p>
          </div>
        </div>

        {/* Dreapta — formular */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 25px', color: '#1a1a2e', fontSize: '16px' }}>📋 Date personale</h3>

          {[
            { key: 'nume', label: 'Nume complet', placeholder: 'Ex: Maria Ionescu', type: 'text' },
            { key: 'email', label: 'Email', placeholder: 'email@exemplu.ro', type: 'email' },
            { key: 'telefon', label: 'Telefon', placeholder: '07XX XXX XXX', type: 'tel' },
            { key: 'oras', label: 'Oraș', placeholder: 'Ex: București', type: 'text' },
            { key: 'agentie', label: 'Agenție imobiliară', placeholder: 'Numele agenției tale', type: 'text' },
          ].map(camp => (
            <div key={camp.key} style={{ marginBottom: '18px' }}>
              <label style={lbl}>{camp.label}</label>
              <input
                type={camp.type}
                value={(form as any)[camp.key] ?? ''}
                onChange={e => setForm({ ...form, [camp.key]: e.target.value })}
                placeholder={camp.placeholder}
                style={inp}
              />
            </div>
          ))}

          <div style={{ marginBottom: '25px' }}>
            <label style={lbl}>Despre mine (Bio)</label>
            <textarea
              value={form.despre ?? ''}
              onChange={e => setForm({ ...form, despre: e.target.value })}
              placeholder="Scrie câteva cuvinte despre tine..."
              rows={4}
              style={{ ...inp, resize: 'vertical' as const }}
            />
          </div>

          <button onClick={salveaza} disabled={salvare === 'loading'}
            style={{
              background: salvare === 'loading' ? '#ccc' : '#e94560',
              color: 'white', border: 'none', padding: '14px 35px',
              borderRadius: '8px', cursor: salvare === 'loading' ? 'not-allowed' : 'pointer',
              fontSize: '16px', fontWeight: 600
            }}>
            {salvare === 'loading' ? '⏳ Se salvează...' : '💾 Salvează modificările'}
          </button>
        </div>
      </div>
    </div>
  )
}