'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { inp, lbl } from './types'

const PAGINI = [
  { id: 5, titlu: '🏠 Acasă', url: 'https://webmaster.aithrondigital.com/' },
  { id: 769, titlu: '👤 Despre noi', url: 'https://webmaster.aithrondigital.com/despre-noi/' },
  { id: 771, titlu: '📞 Contact', url: 'https://webmaster.aithrondigital.com/contact/' },
  { id: 773, titlu: '📝 Informații Utile', url: 'https://webmaster.aithrondigital.com/informatii-utile/' },
  { id: 775, titlu: '🛠️ Servicii', url: 'https://webmaster.aithrondigital.com/servicii/' },
  { id: 2109, titlu: '🏡 Proprietăți', url: 'https://webmaster.aithrondigital.com/proprietati/' },
]

type Camp = {
  index: number
  tag: string
  text: string
  textOriginal: string
}

type ImagineItem = {
  index: number
  src: string
  srcOriginal: string
  alt: string
  tip: 'img' | 'background' | 'slider'
}

function extrageImaginiSliderberg(contentRaw: string): string[] {
  const sliderMatch = contentRaw.match(
    /<!-- wp:sliderberg\/slider[\s\S]*?<!-- \/wp:sliderberg\/slider -->/
  )
  if (!sliderMatch) return []
  const urls: string[] = []
  const regex = /<!-- wp:image \{[^}]*"url":"([^"]+)"[^}]*\} -->/g
  let match
  while ((match = regex.exec(sliderMatch[0])) !== null) {
    urls.push(match[1])
  }
  return urls
}

export default function SectiuneEditareSite() {
  const [paginaActiva, setPaginaActiva] = useState<number | null>(null)
  const [campuri, setCampuri] = useState<Camp[]>([])
  const [imagini, setImagini] = useState<ImagineItem[]>([])
  const [htmlOriginal, setHtmlOriginal] = useState('')
  const [loading, setLoading] = useState(false)
  const [salvare, setSalvare] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pozaNouaIndex, setPozaNouaIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')

  const getToken = async (setari: any) => {
    const res = await fetch(`${setari.wp_url}/wp-json/jwt-auth/v1/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: setari.wp_username, password: setari.wp_password })
    })
    const data = await res.json()
    if (!data.token) throw new Error('Autentificare eșuată.')
    return data.token
  }

  const incarcaPagina = async (pageId: number) => {
    setLoading(true)
    setCampuri([])
    setImagini([])
    setErrorMsg('')
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url, wp_username, wp_password').single()
      if (!setari) return
      const token = await getToken(setari)
      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/pages/${pageId}?context=edit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      const htmlRaw = data.content?.raw || ''
      const htmlRendered = data.content?.rendered || ''
      setHtmlOriginal(htmlRaw)
      extrageCampuri(htmlRaw, htmlRendered)
    } catch (e) { setErrorMsg('Eroare la încărcarea paginii!') }
    finally { setLoading(false) }
  }

  const extrageCampuri = (htmlRaw: string, htmlRendered: string) => {
    const parser = new DOMParser()
    const docRaw = parser.parseFromString(htmlRaw, 'text/html')
    const campuriExtrase: Camp[] = []
    const imaginiExtrase: ImagineItem[] = []
    let imgIndex = 0
    const srcVazute = new Set<string>()

    const elemente = docRaw.querySelectorAll('h1, h2, h3, h4, p, span.stk-button__inner-text')
    elemente.forEach((el, index) => {
      const text = el.textContent?.trim() || ''
      if (text.length > 2 && text.length < 500) {
        campuriExtrase.push({ index, tag: el.tagName.toLowerCase(), text, textOriginal: text })
      }
    })

    docRaw.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || ''
      if (src && !src.includes('svg') && !src.includes('spin') && !srcVazute.has(src)) {
        srcVazute.add(src)
        imaginiExtrase.push({ index: imgIndex++, src, srcOriginal: src, alt: img.getAttribute('alt') || '', tip: 'img' })
      }
    })

    const sliderUrls = extrageImaginiSliderberg(htmlRaw)
    sliderUrls.forEach((src, i) => {
      if (!srcVazute.has(src)) {
        srcVazute.add(src)
        imaginiExtrase.push({ index: imgIndex++, src, srcOriginal: src, alt: `Slider imagine ${i + 1}`, tip: 'slider' })
      }
    })

    const bgMatches = htmlRendered.matchAll(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/g)
    for (const match of bgMatches) {
      const src = match[1]
      if (src && !src.includes('svg') && !srcVazute.has(src)) {
        srcVazute.add(src)
        imaginiExtrase.push({ index: imgIndex++, src, srcOriginal: src, alt: 'Background secțiune', tip: 'background' })
      }
    }

    setCampuri(campuriExtrase)
    setImagini(imaginiExtrase)
  }

  const actualizeazaCamp = (index: number, valoareNoua: string) => {
    setCampuri(prev => prev.map(c => c.index === index ? { ...c, text: valoareNoua } : c))
  }

  const construiesteHtmlNou = (): string => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlOriginal, 'text/html')
    const elemente = doc.querySelectorAll('h1, h2, h3, h4, p, span.stk-button__inner-text')

    campuri.forEach(camp => {
      const el = elemente[camp.index]
      if (el && camp.text !== camp.textOriginal) {
        const innerHTML = el.innerHTML
        if (innerHTML.includes(camp.textOriginal)) {
          el.innerHTML = innerHTML.replace(camp.textOriginal, camp.text)
        } else {
          el.textContent = camp.text
        }
      }
    })

    return doc.body.innerHTML
  }

  const salveazaPagina = async () => {
    if (!paginaActiva) return
    setSalvare('loading')
    setErrorMsg('')
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url, wp_username, wp_password').single()
      if (!setari) throw new Error('Nu am găsit credențialele.')
      const token = await getToken(setari)

      let htmlNou = construiesteHtmlNou()
      imagini.forEach(img => {
        if (img.src !== img.srcOriginal) {
          htmlNou = htmlNou.replaceAll(img.srcOriginal, img.src)
        }
      })

      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/pages/${paginaActiva}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: htmlNou })
      })
      const data = await res.json()
      if (!data.id) throw new Error(data.message || 'Eroare la salvare.')

      setSalvare('success')
      setCampuri(prev => prev.map(c => ({ ...c, textOriginal: c.text })))
      setImagini(prev => prev.map(img => ({ ...img, srcOriginal: img.src })))
      setTimeout(() => setSalvare('idle'), 3000)
    } catch (e: any) {
      setSalvare('error')
      setErrorMsg(e.message)
    }
  }

  const schimbaImagine = async (imgIndex: number, file: File) => {
    if (!paginaActiva) return
    setUploadProgress('Se încarcă imaginea...')
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url, wp_username, wp_password').single()
      if (!setari) return
      const token = await getToken(setari)

      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const mediaData = await res.json()
      if (!mediaData.source_url) throw new Error('Upload eșuat.')

      setImagini(prev => prev.map(img =>
        img.index === imgIndex ? { ...img, src: mediaData.source_url } : img
      ))
      setPozaNouaIndex(null)
      setUploadProgress('')
    } catch (e: any) {
      setUploadProgress('')
      alert('Eroare upload imagine: ' + e.message)
    }
  }

  const campuriModificate = campuri.filter(c => c.text !== c.textOriginal).length
  const imaginiModificate = imagini.filter(i => i.src !== i.srcOriginal).length
  const paginaActivaUrl = PAGINI.find(p => p.id === paginaActiva)?.url || '#'

  const getBadgeTip = (tip: string) => {
    if (tip === 'slider') return { label: 'SLIDER', color: '#8b5cf6' }
    if (tip === 'background') return { label: 'FUNDAL', color: '#1a1a2e' }
    return null
  }

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ margin: 0 }}>🌐 Editare Site</h1>
        <p style={{ color: '#666', margin: '5px 0 0' }}>Modifică textele și imaginile de pe site.</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
        {PAGINI.map(p => (
          <button key={p.id} onClick={() => { setPaginaActiva(p.id); incarcaPagina(p.id) }}
            style={{
              background: paginaActiva === p.id ? '#e94560' : 'white',
              color: paginaActiva === p.id ? 'white' : '#333',
              border: '1px solid #ddd', padding: '10px 18px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600
            }}>
            {p.titlu}
          </button>
        ))}
      </div>

      {!paginaActiva && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>🌐</div>
          <h3>Alege o pagină pentru a o edita</h3>
        </div>
      )}

      {loading && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
          <p style={{ color: '#888' }}>⏳ Se încarcă pagina...</p>
        </div>
      )}

      {!loading && paginaActiva && campuri.length > 0 && (
        <div>
          {salvare === 'success' && (
            <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px', color: '#166534', fontWeight: 600 }}>
              ✅ Pagina a fost salvată cu succes!
            </div>
          )}
          {errorMsg && (
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', marginBottom: '20px', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '14px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '25px' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>✏️ Texte ({campuri.length} câmpuri)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {campuri.map(camp => (
                <div key={camp.index}>
                  <label style={{ ...lbl, color: camp.text !== camp.textOriginal ? '#e94560' : '#444' }}>
                    {camp.tag.toUpperCase()}
                    {camp.text !== camp.textOriginal && ' ✏️ modificat'}
                  </label>
                  {camp.text.length > 100 ? (
                    <textarea
                      value={camp.text}
                      onChange={e => actualizeazaCamp(camp.index, e.target.value)}
                      rows={3}
                      style={{ ...inp, resize: 'vertical' as const, border: camp.text !== camp.textOriginal ? '2px solid #e94560' : '1px solid #ddd' }}
                    />
                  ) : (
                    <input
                      value={camp.text}
                      onChange={e => actualizeazaCamp(camp.index, e.target.value)}
                      style={{ ...inp, border: camp.text !== camp.textOriginal ? '2px solid #e94560' : '1px solid #ddd' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {imagini.length > 0 && (
            <div style={{ background: 'white', borderRadius: '14px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '25px' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>🖼️ Imagini ({imagini.length})</h2>
              {uploadProgress && <div style={{ color: '#e94560', fontWeight: 600, marginBottom: '15px' }}>⏳ {uploadProgress}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {imagini.map(img => {
                  const badge = getBadgeTip(img.tip)
                  const eModificata = img.src !== img.srcOriginal
                  return (
                    <div key={img.index} style={{ border: eModificata ? '2px solid #e94560' : '2px solid #f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={img.src} alt={img.alt}
                          style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        {badge && (
                          <span style={{ position: 'absolute', top: '6px', left: '6px', background: badge.color, color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                            {badge.label}
                          </span>
                        )}
                        {eModificata && (
                          <span style={{ position: 'absolute', top: '6px', right: '6px', background: '#e94560', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                            ✏️ modificat
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '10px' }}>
                        <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {img.alt || 'Imagine'}
                        </p>
                        {pozaNouaIndex === img.index ? (
                          <label style={{ display: 'block', background: '#e94560', color: 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={e => { const f = e.target.files?.[0]; if (f) schimbaImagine(img.index, f) }} />
                            📁 Alege fișier
                          </label>
                        ) : (
                          <button onClick={() => setPozaNouaIndex(img.index)}
                            style={{ width: '100%', background: '#f0f0f0', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            🔄 Schimbă imaginea
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={salveazaPagina} disabled={salvare === 'loading'}
              style={{ background: salvare === 'loading' ? '#ccc' : '#e94560', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '8px', cursor: salvare === 'loading' ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px' }}>
              {salvare === 'loading' ? '⏳ Se salvează...' : `💾 Salvează modificările${campuriModificate + imaginiModificate > 0 ? ` (${campuriModificate + imaginiModificate})` : ''}`}
            </button>
            <button onClick={() => paginaActiva && incarcaPagina(paginaActiva)}
              style={{ background: 'white', color: '#333', border: '2px solid #ddd', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              🔄 Resetează
            </button>
            <a href={paginaActivaUrl} target="_blank" rel="noreferrer"
              style={{ background: '#1a1a2e', color: 'white', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>
              👁️ Vezi pagina
            </a>
          </div>
        </div>
      )}
    </div>
  )
}