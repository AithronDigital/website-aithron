'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { inp, lbl, secTitle } from './types'

type Articol = {
  id: number; titlu: string; status: string
  poza: string; categorie: string; link: string; data: string
}

export default function SectiuneBlog() {
  const [articole, setArticole] = useState<Articol[]>([])
  const [loading, setLoading] = useState(true)
  const [adaugaArticol, setAdaugaArticol] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [publicare, setPublicare] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [cautare, setCautare] = useState('')
  const [pozaSelectata, setPozaSelectata] = useState<File | null>(null)
  const [pozaPreview, setPozaPreview] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [categorii, setCategorii] = useState<{id: number, name: string}[]>([])
  const [categoriiSelectate, setCategoriiSelectate] = useState<number[]>([])
  const [categoriaNova, setCategoriaNova] = useState('')
  const [adaugaCategorie, setAdaugaCategorie] = useState(false)
  const [etichetaNova, setEtichetaNova] = useState('')

  const [form, setForm] = useState({
    titlu: '', continut: '', meta_titlu: '', meta_descriere: '', etichete: '',
  })

  useEffect(() => { incarcaArticole(); incarcaCategorii() }, [])

  const incarcaArticole = async () => {
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url').single()
      if (!setari) return
      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/posts?per_page=100&_embed`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setArticole(data.map((p: any) => ({
          id: p.id,
          titlu: p.title?.rendered || '',
          status: p.status,
          poza: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
          categorie: p._embedded?.['wp:term']?.[0]?.map((c: any) => c.name).join(', ') || '',
          link: p.link,
          data: new Date(p.date).toLocaleDateString('ro-RO'),
        })))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const incarcaCategorii = async () => {
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url').single()
      if (!setari) return
      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/categories?per_page=100`)
      const data = await res.json()
      if (Array.isArray(data)) setCategorii(data.map((c: any) => ({ id: c.id, name: c.name })))
    } catch (e) { console.error(e) }
  }

  const getToken = async (setari: any) => {
    const res = await fetch(`${setari.wp_url}/wp-json/jwt-auth/v1/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: setari.wp_username, password: setari.wp_password })
    })
    const data = await res.json()
    if (!data.token) throw new Error('Autentificare WordPress eșuată.')
    return data.token
  }

  const creeazaCategorie = async () => {
    if (!categoriaNova.trim()) return
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url, wp_username, wp_password').single()
      if (!setari) return
      const token = await getToken(setari)
      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: categoriaNova.trim() })
      })
      const data = await res.json()
      if (data.id) {
        setCategorii(prev => [...prev, { id: data.id, name: data.name }])
        setCategoriiSelectate(prev => [...prev, data.id])
        setCategoriaNova('')
        setAdaugaCategorie(false)
      }
    } catch (e) { alert('Eroare la crearea categoriei!') }
  }

  const toggleCategorie = (id: number) => {
    setCategoriiSelectate(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const adaugaEticheta = () => {
    if (!etichetaNova.trim()) return
    const existente = form.etichete ? form.etichete.split(',').map(t => t.trim()).filter(Boolean) : []
    if (!existente.includes(etichetaNova.trim())) {
      setForm({ ...form, etichete: [...existente, etichetaNova.trim()].join(', ') })
    }
    setEtichetaNova('')
  }

  const stergeEticheta = (tag: string) => {
    const existente = form.etichete.split(',').map(t => t.trim()).filter(t => t !== tag)
    setForm({ ...form, etichete: existente.join(', ') })
  }

  const uploadPoza = async (token: string, wpUrl: string): Promise<number | null> => {
    if (!pozaSelectata) return null
    setUploadProgress('Se încarcă imaginea...')
    const formData = new FormData()
    formData.append('file', pozaSelectata)
    const res = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    const data = await res.json()
    setUploadProgress('')
    return data.id || null
  }

  const deschideEditare = async (id: number) => {
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url').single()
      if (!setari) return
      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/posts/${id}?_embed`)
      const p = await res.json()
      setForm({
        titlu: p.title?.rendered || '',
        continut: p.content?.raw || '',
        meta_titlu: p.meta?._seopress_titles_title || '',
        meta_descriere: p.meta?._seopress_titles_desc || '',
        etichete: p._embedded?.['wp:term']?.[1]?.map((t: any) => t.name).join(', ') || '',
      })
      setCategoriiSelectate(p.categories || [])
      setEditId(id)
      setAdaugaArticol(true)
      setPozaSelectata(null)
      setPozaPreview('')
    } catch (e) { alert('Eroare la încărcarea articolului!') }
  }

  const stergeArticol = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi acest articol?')) return
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url, wp_username, wp_password').single()
      if (!setari) return
      const token = await getToken(setari)
      await fetch(`${setari.wp_url}/wp-json/wp/v2/posts/${id}?force=true`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      })
      setArticole(articole.filter(a => a.id !== id))
    } catch (e) { alert('Eroare la ștergere!') }
  }

  const salveazaArticol = async (status: 'publish' | 'draft') => {
    if (!form.titlu) { setErrorMsg('Titlul este obligatoriu!'); return }
    setPublicare('loading')
    setErrorMsg('')
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url, wp_username, wp_password').single()
      if (!setari) throw new Error('Nu am găsit credențialele WordPress.')
      const token = await getToken(setari)
      const pozaId = await uploadPoza(token, setari.wp_url)

      const bodyData: Record<string, any> = {
        title: form.titlu,
        content: form.continut,
        status,
        ...(pozaId ? { featured_media: pozaId } : {}),
        ...(categoriiSelectate.length > 0 ? { categories: categoriiSelectate } : {}),
        meta: {
          _seopress_titles_title: form.meta_titlu,
          _seopress_titles_desc: form.meta_descriere,
        }
      }

      // FIX: căutare etichetă după name nu după slug
      if (form.etichete) {
        const tagNames = form.etichete.split(',').map(t => t.trim()).filter(Boolean)
        const tagIds: number[] = []
        for (const tagName of tagNames) {
          const resTag = await fetch(
            `${setari.wp_url}/wp-json/wp/v2/tags?search=${encodeURIComponent(tagName)}&per_page=10`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          )
          const tagData = await resTag.json()
          const gasit = Array.isArray(tagData) && tagData.find(
            (t: any) => t.name.toLowerCase() === tagName.toLowerCase()
          )
          if (gasit) {
            tagIds.push(gasit.id)
          } else {
            const resCreate = await fetch(`${setari.wp_url}/wp-json/wp/v2/tags`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ name: tagName })
            })
            const created = await resCreate.json()
            if (created.id) tagIds.push(created.id)
          }
        }
        if (tagIds.length > 0) bodyData.tags = tagIds
      }

      const url = editId
        ? `${setari.wp_url}/wp-json/wp/v2/posts/${editId}`
        : `${setari.wp_url}/wp-json/wp/v2/posts`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyData)
      })
      const postData = await res.json()
      if (!postData.id) throw new Error(postData.message || JSON.stringify(postData))

      await incarcaArticole()
      setPublicare('success')
      setForm({ titlu: '', continut: '', meta_titlu: '', meta_descriere: '', etichete: '' })
      setCategoriiSelectate([])
      setPozaSelectata(null)
      setPozaPreview('')
      setEditId(null)
      setAdaugaArticol(false)
      setTimeout(() => setPublicare('idle'), 4000)
    } catch (e: any) {
      setPublicare('error')
      setErrorMsg(e.message || 'A apărut o eroare.')
    }
  }

  const articoleFiltrate = articole.filter(a =>
    a.titlu.toLowerCase().includes(cautare.toLowerCase())
  )

  const eticheteLista = form.etichete ? form.etichete.split(',').map(t => t.trim()).filter(Boolean) : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ margin: 0 }}>📝 Blog</h1>
          <p style={{ color: '#666', margin: '5px 0 0' }}>Publică articole pe site-ul tău.</p>
        </div>
        {!adaugaArticol && (
          <button onClick={() => { setAdaugaArticol(true); setEditId(null); setForm({ titlu: '', continut: '', meta_titlu: '', meta_descriere: '', etichete: '' }); setCategoriiSelectate([]); setPublicare('idle'); setErrorMsg('') }}
            style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 600 }}>
            + Articol nou
          </button>
        )}
      </div>

      {publicare === 'success' && (
        <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px', color: '#166534', fontWeight: 600 }}>
          ✅ Articolul a fost {editId ? 'actualizat' : 'publicat'} cu succes!
        </div>
      )}

      {adaugaArticol && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '35px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0 }}>{editId ? '✏️ Editează articolul' : '📝 Articol nou'}</h2>
            <button onClick={() => { setAdaugaArticol(false); setEditId(null); setPozaSelectata(null); setPozaPreview('') }}
              style={{ background: '#f0f0f0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>✕ Închide</button>
          </div>

          <span style={secTitle}>🖼️ Imagine principală</span>
          <div style={{ marginBottom: '25px' }}>
            {pozaPreview && (
              <div style={{ marginBottom: '15px', position: 'relative', display: 'inline-block' }}>
                <img src={pozaPreview} alt="Preview" style={{ width: '200px', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e94560' }} />
                <button onClick={() => { setPozaSelectata(null); setPozaPreview('') }}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '2px dashed #ddd', borderRadius: '10px', padding: '20px', cursor: 'pointer', color: '#888', fontSize: '14px', fontWeight: 600, background: '#fafafa', maxWidth: '300px' }}>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0]
                if (file) { setPozaSelectata(file); setPozaPreview(URL.createObjectURL(file)) }
              }} style={{ display: 'none' }} />
              🖼️ {pozaSelectata ? 'Schimbă imaginea' : 'Alege imagine principală'}
            </label>
            {uploadProgress && <div style={{ marginTop: '10px', color: '#e94560', fontWeight: 600 }}>⏳ {uploadProgress}</div>}
          </div>

          <span style={secTitle}>📋 Informații articol</span>
          <div style={{ marginBottom: '25px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={lbl}>Titlu articol *</label>
              <input value={form.titlu} onChange={e => setForm({ ...form, titlu: e.target.value })}
                placeholder="Ex: 5 sfaturi pentru cumpărarea primei locuințe" style={{ ...inp, fontSize: '15px' }} />
            </div>
            <div>
              <label style={lbl}>Conținut articol</label>
              <textarea value={form.continut} onChange={e => setForm({ ...form, continut: e.target.value })}
                placeholder="Scrie conținutul articolului aici..." rows={10}
                style={{ ...inp, resize: 'vertical' as const }} />
            </div>
          </div>

          <span style={secTitle}>📁 Categorii</span>
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {categorii.map(c => (
                <button key={c.id} onClick={() => toggleCategorie(c.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', border: '2px solid',
                    borderColor: categoriiSelectate.includes(c.id) ? '#e94560' : '#ddd',
                    background: categoriiSelectate.includes(c.id) ? '#e94560' : 'white',
                    color: categoriiSelectate.includes(c.id) ? 'white' : '#666',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600
                  }}>
                  {categoriiSelectate.includes(c.id) ? '✓ ' : ''}{c.name}
                </button>
              ))}
            </div>
            {!adaugaCategorie ? (
              <button onClick={() => setAdaugaCategorie(true)}
                style={{ background: 'none', border: '2px dashed #ddd', color: '#888', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>
                + Categorie nouă
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input value={categoriaNova} onChange={e => setCategoriaNova(e.target.value)}
                  placeholder="Nume categorie nouă" style={{ ...inp, margin: 0, width: '220px' }}
                  onKeyDown={e => e.key === 'Enter' && creeazaCategorie()} />
                <button onClick={creeazaCategorie}
                  style={{ background: '#e94560', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Adaugă
                </button>
                <button onClick={() => { setAdaugaCategorie(false); setCategoriaNova('') }}
                  style={{ background: '#f0f0f0', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            )}
          </div>

          <span style={secTitle}>🏷️ Etichete</span>
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {eticheteLista.map(tag => (
                <span key={tag} style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', color: '#4338ca', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {tag}
                  <button onClick={() => stergeEticheta(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4338ca', fontSize: '12px', padding: 0, lineHeight: 1 }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input value={etichetaNova} onChange={e => setEtichetaNova(e.target.value)}
                placeholder="Adaugă etichetă..." style={{ ...inp, margin: 0, width: '220px' }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adaugaEticheta() } }} />
              <button onClick={adaugaEticheta}
                style={{ background: '#4338ca', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                + Adaugă
              </button>
            </div>
            <small style={{ color: '#888', marginTop: '6px', display: 'block' }}>Apasă Enter sau butonul pentru a adăuga</small>
          </div>

          <span style={secTitle}>🔍 SEO (opțional)</span>
          <div style={{ marginBottom: '25px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={lbl}>Meta titlu</label>
              <input value={form.meta_titlu} onChange={e => setForm({ ...form, meta_titlu: e.target.value })}
                placeholder="Ex: 5 sfaturi esențiale pentru prima locuință | Blog Imobiliar" style={inp} />
              <small style={{ color: form.meta_titlu.length > 60 ? '#dc2626' : '#888' }}>{form.meta_titlu.length}/60 caractere recomandate</small>
            </div>
            <div>
              <label style={lbl}>Meta descriere</label>
              <textarea value={form.meta_descriere} onChange={e => setForm({ ...form, meta_descriere: e.target.value })}
                placeholder="Descriere scurtă pentru motoarele de căutare..." rows={3}
                style={{ ...inp, resize: 'vertical' as const }} />
              <small style={{ color: form.meta_descriere.length > 160 ? '#dc2626' : '#888' }}>{form.meta_descriere.length}/160 caractere recomandate</small>
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', marginBottom: '20px', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
            <button onClick={() => salveazaArticol('publish')} disabled={publicare === 'loading'}
              style={{ background: publicare === 'loading' ? '#ccc' : '#e94560', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '8px', cursor: publicare === 'loading' ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px' }}>
              {publicare === 'loading' ? '⏳ Se salvează...' : editId ? '💾 Salvează modificările' : '🚀 Publică articolul'}
            </button>
            <button onClick={() => salveazaArticol('draft')} disabled={publicare === 'loading'}
              style={{ background: 'white', color: '#333', border: '2px solid #ddd', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
              💾 Salvează ca ciornă
            </button>
            <button onClick={() => { setAdaugaArticol(false); setPozaSelectata(null); setPozaPreview(''); setEditId(null) }}
              style={{ background: '#f0f0f0', color: '#666', border: 'none', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              Anulează
            </button>
          </div>
        </div>
      )}

      {!adaugaArticol && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1a1a2e' }}>📋 Articolele mele ({articole.length})</h2>
            <input value={cautare} onChange={e => setCautare(e.target.value)}
              placeholder="🔍 Caută după titlu..."
              style={{ ...inp, width: '300px', margin: 0 }} />
          </div>
          {loading ? (
            <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
              <p style={{ color: '#888' }}>⏳ Se încarcă articolele...</p>
            </div>
          ) : articoleFiltrate.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>📝</div>
              <h3>{cautare ? 'Niciun rezultat găsit' : 'Nu ai articole publicate încă'}</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {articoleFiltrate.map(a => (
                <div key={a.id} style={{ background: 'white', borderRadius: '12px', padding: '20px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {a.poza ? (
                      <img src={a.poza} alt={a.titlu} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '80px', height: '60px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📝</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: a.titlu }} />
                      <div style={{ color: '#666', fontSize: '13px' }}>
                        {a.categorie && `📁 ${a.categorie}`}
                        {a.data && ` · 📅 ${a.data}`}
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        <span style={{ background: a.status === 'publish' ? '#dcfce7' : '#fef9c3', color: a.status === 'publish' ? '#166534' : '#854d0e', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                          {a.status === 'publish' ? '✅ Publicat' : '📝 Ciornă'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => window.open(a.link, '_blank')} style={{ background: '#f0f0f0', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>👁️ Vezi</button>
                    <button onClick={() => deschideEditare(a.id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>✏️ Editează</button>
                    <button onClick={() => stergeArticol(a.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>🗑️ Șterge</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}