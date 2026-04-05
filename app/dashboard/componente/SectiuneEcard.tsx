'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { inp, lbl } from './types'

const formGol = {
  nume: '', titlu: '', agentie: '', telefon: '', email: '',
  whatsapp: '', facebook: '', instagram: '', linkedin: '',
  youtube: '', tiktok: '', website: '', despre: '',
  poza_profil_url: '', poza_fundal_url: '',
  link_proprietati: '', link_servicii: '', link_despre_noi: '',
  link_site: '', link_ecard: '',
  culoare_principala: '#3b82f6',
  whatsapp_ghid_vanzator: '', whatsapp_ghid_cumparator: '',
}

export default function SectiuneEcard() {
  const [form, setForm] = useState({ ...formGol })
  const [salvare, setSalvare] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pozaProfilFile, setPozaProfilFile] = useState<File | null>(null)
  const [pozaFundalFile, setPozaFundalFile] = useState<File | null>(null)
  const [pozaProfilPreview, setPozaProfilPreview] = useState('')
  const [pozaFundalPreview, setPozaFundalPreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [ecardId, setEcardId] = useState<number | null>(null)
  const [preview, setPreview] = useState(false)
  const [copiat, setCopiat] = useState(false)
  const [copiatQR, setCopiatQR] = useState(false)
  const [aratQR, setAratQR] = useState(false)
  const [esteDesktop, setEsteDesktop] = useState(true)

  useEffect(() => {
    incarcaEcard()
    const verificaDimensiune = () => setEsteDesktop(window.innerWidth >= 900)
    verificaDimensiune()
    window.addEventListener('resize', verificaDimensiune)
    return () => window.removeEventListener('resize', verificaDimensiune)
  }, [])

  const incarcaEcard = async () => {
    try {
      const { data } = await supabase.from('ecard').select('*').limit(1).single()
      if (data) {
        const dataClean = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v === null ? '' : v])
        )
        setForm({ ...formGol, ...dataClean })
        setEcardId(data.id)
        if (data.poza_profil_url) setPozaProfilPreview(data.poza_profil_url)
        if (data.poza_fundal_url) setPozaFundalPreview(data.poza_fundal_url)
      }
    } catch (e) { console.log('Nu există ecard salvat încă.') }
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

  const uploadPoza = async (file: File, label: string): Promise<string> => {
    setUploadProgress(`Se încarcă ${label}...`)
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
    if (!form.nume) { setErrorMsg('Numele este obligatoriu!'); return }
    setSalvare('loading')
    setErrorMsg('')
    try {
      let pozaProfilUrl = form.poza_profil_url
      let pozaFundalUrl = form.poza_fundal_url
      if (pozaProfilFile) pozaProfilUrl = await uploadPoza(pozaProfilFile, 'poza profil')
      if (pozaFundalFile) pozaFundalUrl = await uploadPoza(pozaFundalFile, 'imagine fundal')
      const dataToSave = { ...form, poza_profil_url: pozaProfilUrl, poza_fundal_url: pozaFundalUrl }

      if (ecardId) {
        await supabase.from('ecard').update(dataToSave).eq('id', ecardId)
      } else {
        const { data } = await supabase.from('ecard').insert([dataToSave]).select().single()
        if (data) setEcardId(data.id)
      }

      // Sync poza profil si in setari_agent ca sa apara peste tot
      if (pozaProfilUrl) {
        await supabase.from('setari_agent').update({ poza_profil_url: pozaProfilUrl }).not('id', 'is', null)
      }

      setForm(dataToSave)
      if (pozaProfilUrl) setPozaProfilPreview(pozaProfilUrl)
      if (pozaFundalUrl) setPozaFundalPreview(pozaFundalUrl)
      setPozaProfilFile(null)
      setPozaFundalFile(null)
      setSalvare('success')
      setTimeout(() => setSalvare('idle'), 3000)
    } catch (e: any) {
      setSalvare('error')
      setErrorMsg(e.message)
    }
  }

  const copiazaLink = async () => {
    const link = `${window.location.origin}/ecard`
    await navigator.clipboard.writeText(link)
    setCopiat(true)
    setTimeout(() => setCopiat(false), 3000)
  }

  const descarcaQR = () => {
    const link = `${window.location.origin}/ecard`
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}`
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr-ecard.png'
    a.target = '_blank'
    a.click()
  }

  const copiazaQR = async () => {
    const link = `${window.location.origin}/ecard`
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}`
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopiatQR(true)
      setTimeout(() => setCopiatQR(false), 3000)
    } catch {
      await navigator.clipboard.writeText(url)
      setCopiatQR(true)
      setTimeout(() => setCopiatQR(false), 3000)
    }
  }

  const linkEcard = `${typeof window !== 'undefined' ? window.location.origin : ''}/ecard`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkEcard)}`
  const c = form.culoare_principala || '#3b82f6'
  const cInchis = '#1a1a2e'

  const btnStyle = (culoare: string) => ({
    background: culoare, color: 'white', padding: '12px',
    borderRadius: '10px', textDecoration: 'none', fontWeight: 600,
    fontSize: '15px', textAlign: 'center' as const, display: 'block',
  })

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ margin: 0 }}>👤 eCard</h1>
          <p style={{ color: '#666', margin: '5px 0 0' }}>Cartea ta de vizită digitală.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={copiazaLink}
            style={{ background: copiat ? '#22c55e' : c, color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {copiat ? '✅ Copiat!' : '🔗 Copiază eCard'}
          </button>
          <button onClick={() => setPreview(!preview)}
            style={{ background: preview ? cInchis : 'white', color: preview ? 'white' : '#333', border: '1px solid #ddd', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {preview ? '✏️ Editează' : '👁️ Preview eCard'}
          </button>
          <button onClick={() => setAratQR(!aratQR)}
            style={{ background: aratQR ? c : 'white', color: aratQR ? 'white' : '#333', border: '1px solid #ddd', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            📱 QR Code
          </button>
          <button onClick={copiazaQR}
            style={{ background: copiatQR ? '#22c55e' : cInchis, color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {copiatQR ? '✅ QR Copiat!' : '📋 Copiază QR'}
          </button>
        </div>
      </div>

      {/* QR CODE PANEL */}
      {aratQR && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '25px', display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <img src={qrUrl} alt="QR eCard" style={{ width: '180px', height: '180px', borderRadius: '10px', border: `4px solid ${c}` }} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', color: cInchis }}>📱 QR Code eCard</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 5px' }}>
              Link: <strong>{linkEcard}</strong>
            </p>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 20px' }}>
              Clientul scanează codul și deschide direct eCard-ul tău.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={descarcaQR}
                style={{ background: c, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                ⬇️ Descarcă QR
              </button>
              <button onClick={copiazaQR}
                style={{ background: copiatQR ? '#22c55e' : cInchis, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                {copiatQR ? '✅ Copiat!' : '📋 Copiază QR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {salvare === 'success' && (
        <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px', color: '#166534', fontWeight: 600 }}>
          ✅ eCard salvat cu succes!
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

      {/* PREVIEW */}
      {preview && (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          borderRadius: '16px', padding: '40px 20px', marginBottom: '30px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px'
        }}>
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {/* HERO FUNDAL */}
            <div style={{
              height: '200px',
              background: pozaFundalPreview ? `url(${pozaFundalPreview}) center/cover` : `linear-gradient(135deg, ${c}, ${cInchis})`,
              position: 'relative',
            }}>
              {/* POZA PROFIL - marita la 130px */}
              <div style={{
                width: '130px', height: '130px', borderRadius: '50%',
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                position: 'absolute', bottom: '-65px', left: '50%', transform: 'translateX(-50%)',
                background: pozaProfilPreview ? `url(${pozaProfilPreview}) center/cover` : c,
                backgroundSize: 'cover',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '44px', overflow: 'hidden'
              }}>
                {!pozaProfilPreview && '👤'}
              </div>
            </div>

            {/* CONTINUT ALB */}
            <div style={{ background: 'white', paddingTop: '75px', paddingBottom: '0px', paddingLeft: '20px', paddingRight: '20px', textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: cInchis }}>{form.nume || 'Numele Agentului'}</h2>
              <p style={{ margin: '0 0 4px', color: c, fontWeight: 600 }}>{form.titlu || 'Agent Imobiliar'}</p>
              {form.agentie && <p style={{ margin: '0 0 15px', color: '#888', fontSize: '14px' }}>{form.agentie}</p>}
              {form.despre && <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px', lineHeight: 1.6 }}>{form.despre}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                {form.whatsapp && <a href={`https://wa.me/${form.whatsapp}`} target="_blank" rel="noreferrer" style={btnStyle('#25D366')}>💬 WhatsApp</a>}
                {form.telefon && <a href={`tel:${form.telefon}`} style={btnStyle(c)}>📞 {form.telefon}</a>}
                {form.email && <a href={`mailto:${form.email}`} style={btnStyle(c)}>✉️ {form.email}</a>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                {form.link_site && <a href={form.link_site} target="_blank" rel="noreferrer" style={btnStyle(c)}>🌐 Vizitează Site-ul</a>}
                {form.link_proprietati && <a href={form.link_proprietati} target="_blank" rel="noreferrer" style={btnStyle(c)}>🏡 Proprietăți</a>}
                {form.link_servicii && <a href={form.link_servicii} target="_blank" rel="noreferrer" style={btnStyle(c)}>🛠️ Servicii</a>}
                {form.link_despre_noi && <a href={form.link_despre_noi} target="_blank" rel="noreferrer" style={btnStyle(c)}>👤 Despre noi</a>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                {form.whatsapp_ghid_vanzator && (
                  <a href={`https://wa.me/${form.whatsapp_ghid_vanzator}?text=${encodeURIComponent('Bună ziua! Doresc Ghidul Vânzătorului Gratuit.')}`}
                    target="_blank" rel="noreferrer" style={btnStyle(cInchis)}>
                    🏠 Solicită Ghidul Vânzătorului Gratuit
                  </a>
                )}
                {form.whatsapp_ghid_cumparator && (
                  <a href={`https://wa.me/${form.whatsapp_ghid_cumparator}?text=${encodeURIComponent('Bună ziua! Doresc Ghidul Cumpărătorului Gratuit.')}`}
                    target="_blank" rel="noreferrer" style={btnStyle(cInchis)}>
                    🔑 Solicită Ghidul Cumpărătorului Gratuit
                  </a>
                )}
              </div>
              {(form.facebook || form.instagram || form.linkedin || form.youtube || form.tiktok) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {form.facebook && <a href={form.facebook} target="_blank" rel="noreferrer" style={{ fontSize: '28px', textDecoration: 'none' }}>📘</a>}
                  {form.instagram && <a href={form.instagram} target="_blank" rel="noreferrer" style={{ fontSize: '28px', textDecoration: 'none' }}>📷</a>}
                  {form.linkedin && <a href={form.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: '28px', textDecoration: 'none' }}>💼</a>}
                  {form.youtube && <a href={form.youtube} target="_blank" rel="noreferrer" style={{ fontSize: '28px', textDecoration: 'none' }}>▶️</a>}
                  {form.tiktok && <a href={form.tiktok} target="_blank" rel="noreferrer" style={{ fontSize: '28px', textDecoration: 'none' }}>🎵</a>}
                </div>
              )}

              {/* QR - footer dark, integrat in design */}
              <div style={{
                background: cInchis,
                margin: '0 -20px',
                padding: '20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
              }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Scanează pentru eCard
                </p>
                <div style={{ background: 'white', padding: '8px', borderRadius: '10px', display: 'inline-block' }}>
                  <img src={qrUrl} alt="QR" style={{ width: '90px', height: '90px', display: 'block' }} />
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  Aithron Digital
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORMULAR */}
      {!preview && (
        <div style={{ display: 'grid', gridTemplateColumns: esteDesktop ? '1fr 1fr' : '1fr', gap: '25px' }}>
          <div>
            <div style={{ background: 'white', borderRadius: '14px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 20px', color: cInchis }}>📸 Fotografii</h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={lbl}>Imagine fundal (hero)</label>
                {pozaFundalPreview && (
                  <img src={pozaFundalPreview} alt="Fundal" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                )}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '2px dashed #ddd', borderRadius: '10px', padding: '15px', cursor: 'pointer', color: '#888', fontSize: '14px', fontWeight: 600, background: '#fafafa' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setPozaFundalFile(f); setPozaFundalPreview(URL.createObjectURL(f)) }
                  }} />
                  🖼️ {pozaFundalFile ? 'Schimbă fundalul' : 'Alege imagine fundal'}
                </label>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={lbl}>Poza profil agent</label>
                {pozaProfilPreview && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <img src={pozaProfilPreview} alt="Profil" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #e94560' }} />
                  </div>
                )}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '2px dashed #ddd', borderRadius: '10px', padding: '15px', cursor: 'pointer', color: '#888', fontSize: '14px', fontWeight: 600, background: '#fafafa' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setPozaProfilFile(f); setPozaProfilPreview(URL.createObjectURL(f)) }
                  }} />
                  👤 {pozaProfilFile ? 'Schimbă poza' : 'Alege poza de profil'}
                </label>
              </div>
              <div>
                <label style={lbl}>🎨 Culoare butoane</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="color" value={form.culoare_principala || '#3b82f6'}
                    onChange={e => setForm({ ...form, culoare_principala: e.target.value })}
                    style={{ width: '50px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <input value={form.culoare_principala || '#3b82f6'}
                    onChange={e => setForm({ ...form, culoare_principala: e.target.value })}
                    style={{ ...inp, width: '120px' }} placeholder="#3b82f6" />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['#3b82f6', '#e94560', '#22c55e', '#8b5cf6', '#f59e0b', '#1a1a2e'].map(col => (
                      <div key={col} onClick={() => setForm({ ...form, culoare_principala: col })}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', background: col, cursor: 'pointer', border: form.culoare_principala === col ? '3px solid #333' : '2px solid transparent', boxSizing: 'border-box' as const }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '14px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 20px', color: cInchis }}>📋 Date personale</h3>
              {[
                { key: 'nume', label: 'Nume complet *', placeholder: 'Ex: Maria Ionescu' },
                { key: 'titlu', label: 'Titlu / Funcție', placeholder: 'Ex: Agent Imobiliar' },
                { key: 'agentie', label: 'Agenție', placeholder: 'Ex: Aithron Digital' },
                { key: 'telefon', label: 'Telefon', placeholder: 'Ex: 0722 100 200' },
                { key: 'email', label: 'Email', placeholder: 'Ex: agent@email.ro' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '15px' }}>
                  <label style={lbl}>{f.label}</label>
                  <input value={(form as any)[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} style={inp} />
                </div>
              ))}
              <div>
                <label style={lbl}>Despre mine (Bio)</label>
                <textarea value={form.despre ?? ''} onChange={e => setForm({ ...form, despre: e.target.value })}
                  placeholder="Scrie câteva cuvinte despre tine..." rows={3}
                  style={{ ...inp, resize: 'vertical' as const }} />
              </div>
            </div>
          </div>

          <div>
            <div style={{ background: 'white', borderRadius: '14px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 20px', color: cInchis }}>🔗 Linkuri pagini site</h3>
              {[
                { key: 'link_site', label: '🌐 Link site principal', placeholder: 'https://webmaster.aithrondigital.com' },
                { key: 'link_proprietati', label: '🏡 Link pagina Proprietăți', placeholder: 'https://site.ro/proprietati/' },
                { key: 'link_servicii', label: '🛠️ Link pagina Servicii', placeholder: 'https://site.ro/servicii/' },
                { key: 'link_despre_noi', label: '👤 Link pagina Despre noi', placeholder: 'https://site.ro/despre-noi/' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '15px' }}>
                  <label style={lbl}>{f.label}</label>
                  <input value={(form as any)[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} style={inp} />
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '14px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px', color: cInchis }}>📚 Ghiduri gratuite (WhatsApp)</h3>
              <p style={{ color: '#888', fontSize: '13px', margin: '0 0 15px' }}>Numărul de WhatsApp pentru trimiterea ghidurilor.</p>
              {[
                { key: 'whatsapp_ghid_vanzator', label: '🏠 WhatsApp Ghid Vânzător', placeholder: 'Ex: 40722100200' },
                { key: 'whatsapp_ghid_cumparator', label: '🔑 WhatsApp Ghid Cumpărător', placeholder: 'Ex: 40722100200' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '15px' }}>
                  <label style={lbl}>{f.label}</label>
                  <input value={(form as any)[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} style={inp} />
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '14px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 20px', color: cInchis }}>📱 Contact & Social Media</h3>
              {[
                { key: 'whatsapp', label: 'WhatsApp (număr)', placeholder: 'Ex: 40722100200' },
                { key: 'facebook', label: 'Facebook (URL)', placeholder: 'https://facebook.com/...' },
                { key: 'instagram', label: 'Instagram (URL)', placeholder: 'https://instagram.com/...' },
                { key: 'linkedin', label: 'LinkedIn (URL)', placeholder: 'https://linkedin.com/...' },
                { key: 'youtube', label: 'YouTube (URL)', placeholder: 'https://youtube.com/...' },
                { key: 'tiktok', label: 'TikTok (URL)', placeholder: 'https://tiktok.com/...' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '15px' }}>
                  <label style={lbl}>{f.label}</label>
                  <input value={(form as any)[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} style={inp} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!preview && (
        <div style={{ marginTop: '25px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={salveaza} disabled={salvare === 'loading'}
            style={{ background: salvare === 'loading' ? '#ccc' : '#e94560', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '8px', cursor: salvare === 'loading' ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px' }}>
            {salvare === 'loading' ? '⏳ Se salvează...' : '💾 Salvează eCard'}
          </button>
          <button onClick={() => setPreview(true)}
            style={{ background: 'white', color: '#333', border: '2px solid #ddd', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
            👁️ Preview eCard
          </button>
        </div>
      )}
    </div>
  )
}