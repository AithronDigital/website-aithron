'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import CheckboxGrup from './CheckboxGrup'
import { formGolProprietate, inp, lbl, secTitle } from './types'

type Proprietate = {
  id: number; titlu: string; locatie: string; pret: string
  suprafata: string; tip_tranzactie: string; status: string
  poza: string; link: string
}

export default function SectiuneProprietati() {
  const [adaugaProprietate, setAdaugaProprietate] = useState(false)
  const [formProp, setFormProp] = useState<any>({ ...formGolProprietate })
  const [editId, setEditId] = useState<number | null>(null)
  const [publicare, setPublicare] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pozeSelectate, setPozeSelectate] = useState<File[]>([])
  const [pozePreview, setPozePreview] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState('')
  const [proprietati, setProprietati] = useState<Proprietate[]>([])
  const [loading, setLoading] = useState(true)
  const [cautare, setCautare] = useState('')
  const [esteDesktop, setEsteDesktop] = useState(true)

  useEffect(() => {
    incarcaProprietati()
    const verificaDimensiune = () => setEsteDesktop(window.innerWidth >= 900)
    verificaDimensiune()
    window.addEventListener('resize', verificaDimensiune)
    return () => window.removeEventListener('resize', verificaDimensiune)
  }, [])

  const incarcaProprietati = async () => {
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url').single()
      if (!setari) return
      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/proprietati?per_page=100&_embed`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setProprietati(data.map((p: any) => ({
          id: p.id,
          titlu: p.title?.rendered || '',
          locatie: p._embedded?.['wp:term']?.flat()?.find((t: any) => t.taxonomy === 'locatie')?.name || '',
          pret: p.meta?.pret ? String(p.meta.pret) : '',
          suprafata: p.meta?.suprafata_utila ? String(p.meta.suprafata_utila) : '',
          tip_tranzactie: p._embedded?.['wp:term']?.flat()?.find((t: any) => t.taxonomy === 'tip_tranzactie')?.slug === 'inchiriere' ? 'Închiriere' : 'Vânzare',
          status: p.status,
          poza: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
          link: p.link,
        })))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const getToken = async (setari: any) => {
    const resToken = await fetch(`${setari.wp_url}/wp-json/jwt-auth/v1/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: setari.wp_username, password: setari.wp_password })
    })
    const tokenData = await resToken.json()
    if (!tokenData.token) throw new Error('Autentificare WordPress eșuată.')
    return tokenData.token
  }

  const getTaxonomyTermId = async (wpUrl: string, token: string, taxonomy: string, slug: string): Promise<number | null> => {
    if (!slug) return null
    try {
      const res = await fetch(`${wpUrl}/wp-json/wp/v2/${taxonomy}?slug=${encodeURIComponent(slug)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data[0].id
      const resCreate = await fetch(`${wpUrl}/wp-json/wp/v2/${taxonomy}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: slug, slug: slug })
      })
      const created = await resCreate.json()
      return created.id || null
    } catch { return null }
  }

  const stergeProprietate = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi această proprietate?')) return
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url, wp_username, wp_password').single()
      if (!setari) return
      const token = await getToken(setari)
      await fetch(`${setari.wp_url}/wp-json/wp/v2/proprietati/${id}?force=true`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      })
      setProprietati(proprietati.filter(p => p.id !== id))
    } catch (e) { alert('Eroare la ștergere!') }
  }

  const deschideEditare = async (id: number) => {
    try {
      const { data: setari } = await supabase.from('setari_agent').select('wp_url').single()
      if (!setari) return
      const res = await fetch(`${setari.wp_url}/wp-json/wp/v2/proprietati/${id}?_embed`)
      const p = await res.json()
      const terms = p._embedded?.['wp:term']?.flat() || []
      const getTerm = (tax: string) => terms.find((t: any) => t.taxonomy === tax)?.slug || ''
      const getTermName = (tax: string) => terms.find((t: any) => t.taxonomy === tax)?.name || ''
      const m = p.meta || {}
      setFormProp({
        titlu: p.title?.rendered || '',
        continut: p.content?.raw || '',
        pret: m.pret ? String(m.pret) : '',
        suprafata_utila: m.suprafata_utila ? String(m.suprafata_utila) : '',
        suprafata_construita: m.suprafata_construita ? String(m.suprafata_construita) : '',
        numar_camere: m.numar_camere ? String(m.numar_camere) : '',
        numar_bai: m.numar_bai ? String(m.numar_bai) : '',
        etaj: m.etaj || '',
        anul_constructiei: m.anul_constructiei ? String(m.anul_constructiei) : '',
        s_teren: m.s_teren ? String(m.s_teren) : '',
        id_proprietate: m.id_proprietate || '',
        numar_whatsapp_agent: m.numar_whatsapp_agent || '',
        latitudine: m.latitudine ? String(m.latitudine) : '',
        longitudine: m.longitudine ? String(m.longitudine) : '',
        locatie: getTermName('locatie'),
        stare_proprietate: getTerm('stare_proprietate') || 'buna',
        tip_tranzactie: getTerm('tip_tranzactie') || 'vanzare',
        tip_de_proprietate: getTerm('tip_de_proprietate') || 'apartament',
        recomandat: m.recomandat === 1 || m.recomandat === true,
        nou: m.nou === 1 || m.nou === true,
        oferta: m.oferta === 1 || m.oferta === true,
        exclusiv: m.exclusiv === 1 || m.exclusiv === true,
        vandut: m.vandut === 1 || m.vandut === true,
        inchiriat: m.inchiriat === 1 || m.inchiriat === true,
        premium: m.premium === 1 || m.premium === true,
        balcon: m.balcon === 1 || m.balcon === true,
        terasa: m.terasa === 1 || m.terasa === true,
        garaj: m.garaj === 1 || m.garaj === true,
        curte: m.curte === 1 || m.curte === true,
        gradina: m.gradina === 1 || m.gradina === true,
        spatiu_depozitare: m.spatiu_depozitare === 1 || m.spatiu_depozitare === true,
        curent: m.curent === 1 || m.curent === true,
        apa: m.apa === 1 || m.apa === true,
        gaz: m.gaz === 1 || m.gaz === true,
        canalizare: m.canalizare === 1 || m.canalizare === true,
        acces_internet: m.acces_internet === 1 || m.acces_internet === true,
        fibra_optica: m.fibra_optica === 1 || m.fibra_optica === true,
        centrala_proprie: m.centrala_proprie === 1 || m.centrala_proprie === true,
        calorifere: m.calorifere === 1 || m.calorifere === true,
        aer_conditionat: m.aer_conditionat === 1 || m.aer_conditionat === true,
        incalzire_pardoseala: m.incalzire_pardoseala === 1 || m.incalzire_pardoseala === true,
        apometre: m.apometre === 1 || m.apometre === true,
        interfon: m.interfon === 1 || m.interfon === true,
        complet_mobilat: m.complet_mobilat === 1 || m.complet_mobilat === true,
        partial_mobilat: m.partial_mobilat === 1 || m.partial_mobilat === true,
        bucatarie_mobilata: m.bucatarie_mobilata === 1 || m.bucatarie_mobilata === true,
        bucatarie_utilata: m.bucatarie_utilata === 1 || m.bucatarie_utilata === true,
        catv: m.catv === 1 || m.catv === true,
        usa_intrare_metal: m.usa_intrare_metal === 1 || m.usa_intrare_metal === true,
        usa_intrare_lemn: m.usa_intrare_lemn === 1 || m.usa_intrare_lemn === true,
        ferestre_pvc: m.ferestre_pvc === 1 || m.ferestre_pvc === true,
        ferestre_lemn: m.ferestre_lemn === 1 || m.ferestre_lemn === true,
        ferestre_termopan: m.ferestre_termopan === 1 || m.ferestre_termopan === true,
        gresie: m.gresie === 1 || m.gresie === true,
        parchet: m.parchet === 1 || m.parchet === true,
        faianta: m.faianta === 1 || m.faianta === true,
        izolatie_exterior: m.izolatie_exterior === 1 || m.izolatie_exterior === true,
      })
      setEditId(id)
      setAdaugaProprietate(true)
      setPozeSelectate([])
      setPozePreview([])
    } catch (e) { alert('Eroare la încărcarea proprietății!') }
  }

  const handlePozeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (pozeSelectate.length + files.length > 20) { alert('Maxim 20 poze!'); return }
    setPozeSelectate(prev => [...prev, ...files])
    setPozePreview(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const stergePoze = (index: number) => {
    setPozeSelectate(prev => prev.filter((_, i) => i !== index))
    setPozePreview(prev => prev.filter((_, i) => i !== index))
  }

  const uploadPozeWordPress = async (token: string, wpUrl: string): Promise<number[]> => {
    const ids: number[] = []
    for (let i = 0; i < pozeSelectate.length; i++) {
      const file = pozeSelectate[i]
      setUploadProgress(`Se încarcă poza ${i + 1} din ${pozeSelectate.length}...`)
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (data.id) ids.push(data.id)
    }
    setUploadProgress('')
    return ids
  }

  const salveazaProprietate = async (status: 'publish' | 'draft') => {
    if (!formProp.titlu) { setErrorMsg('Titlul este obligatoriu!'); return }
    setPublicare('loading')
    setErrorMsg('')
    try {
      const { data: setari, error: errSetari } = await supabase
        .from('setari_agent').select('wp_url, wp_username, wp_password').single()
      if (errSetari || !setari) throw new Error('Nu am găsit credențialele WordPress.')
      const token = await getToken(setari)
      let pozeIds: number[] = []
      if (pozeSelectate.length > 0) pozeIds = await uploadPozeWordPress(token, setari.wp_url)
      const [tipTranzactieId, tipProprietateId, stareId, locatieId] = await Promise.all([
        getTaxonomyTermId(setari.wp_url, token, 'tip_tranzactie', formProp.tip_tranzactie),
        getTaxonomyTermId(setari.wp_url, token, 'tip_de_proprietate', formProp.tip_de_proprietate),
        getTaxonomyTermId(setari.wp_url, token, 'stare_proprietate', formProp.stare_proprietate),
        getTaxonomyTermId(setari.wp_url, token, 'locatie', formProp.locatie),
      ])
      const bodyData: Record<string, any> = {
        title: formProp.titlu, content: formProp.continut, status,
        ...(pozeIds.length > 0 ? { featured_media: pozeIds[0] } : {}),
        ...(tipTranzactieId ? { tip_tranzactie: [tipTranzactieId] } : {}),
        ...(tipProprietateId ? { tip_de_proprietate: [tipProprietateId] } : {}),
        ...(stareId ? { stare_proprietate: [stareId] } : {}),
        ...(locatieId ? { locatie: [locatieId] } : {}),
        meta: {
          pret: formProp.pret ? Number(formProp.pret) : 0,
          suprafata_utila: formProp.suprafata_utila ? Number(formProp.suprafata_utila) : 0,
          suprafata_construita: formProp.suprafata_construita ? Number(formProp.suprafata_construita) : 0,
          numar_camere: formProp.numar_camere ? Number(formProp.numar_camere) : 0,
          numar_bai: formProp.numar_bai ? Number(formProp.numar_bai) : 0,
          anul_constructiei: formProp.anul_constructiei ? Number(formProp.anul_constructiei) : 0,
          s_teren: formProp.s_teren ? Number(formProp.s_teren) : 0,
          latitudine: formProp.latitudine ? Number(formProp.latitudine) : 0,
          longitudine: formProp.longitudine ? Number(formProp.longitudine) : 0,
          etaj: formProp.etaj || '', numar_whatsapp_agent: formProp.numar_whatsapp_agent || '',
          id_proprietate: formProp.id_proprietate || '',
          recomandat: formProp.recomandat ? 1 : 0, nou: formProp.nou ? 1 : 0,
          oferta: formProp.oferta ? 1 : 0, exclusiv: formProp.exclusiv ? 1 : 0,
          vandut: formProp.vandut ? 1 : 0, inchiriat: formProp.inchiriat ? 1 : 0,
          premium: formProp.premium ? 1 : 0, balcon: formProp.balcon ? 1 : 0,
          terasa: formProp.terasa ? 1 : 0, garaj: formProp.garaj ? 1 : 0,
          curte: formProp.curte ? 1 : 0, gradina: formProp.gradina ? 1 : 0,
          spatiu_depozitare: formProp.spatiu_depozitare ? 1 : 0,
          curent: formProp.curent ? 1 : 0, apa: formProp.apa ? 1 : 0,
          gaz: formProp.gaz ? 1 : 0, canalizare: formProp.canalizare ? 1 : 0,
          acces_internet: formProp.acces_internet ? 1 : 0, fibra_optica: formProp.fibra_optica ? 1 : 0,
          centrala_proprie: formProp.centrala_proprie ? 1 : 0, calorifere: formProp.calorifere ? 1 : 0,
          aer_conditionat: formProp.aer_conditionat ? 1 : 0,
          incalzire_pardoseala: formProp.incalzire_pardoseala ? 1 : 0,
          apometre: formProp.apometre ? 1 : 0, interfon: formProp.interfon ? 1 : 0,
          complet_mobilat: formProp.complet_mobilat ? 1 : 0, partial_mobilat: formProp.partial_mobilat ? 1 : 0,
          bucatarie_mobilata: formProp.bucatarie_mobilata ? 1 : 0, bucatarie_utilata: formProp.bucatarie_utilata ? 1 : 0,
          catv: formProp.catv ? 1 : 0, usa_intrare_metal: formProp.usa_intrare_metal ? 1 : 0,
          usa_intrare_lemn: formProp.usa_intrare_lemn ? 1 : 0, ferestre_pvc: formProp.ferestre_pvc ? 1 : 0,
          ferestre_lemn: formProp.ferestre_lemn ? 1 : 0, ferestre_termopan: formProp.ferestre_termopan ? 1 : 0,
          gresie: formProp.gresie ? 1 : 0, parchet: formProp.parchet ? 1 : 0,
          faianta: formProp.faianta ? 1 : 0, izolatie_exterior: formProp.izolatie_exterior ? 1 : 0,
        }
      }
      const url = editId
        ? `${setari.wp_url}/wp-json/wp/v2/proprietati/${editId}`
        : `${setari.wp_url}/wp-json/wp/v2/proprietati`
      const resPost = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyData)
      })
      const postData = await resPost.json()
      if (!postData.id) throw new Error(postData.message || JSON.stringify(postData))
      if (pozeIds.length > 0) {
        await fetch(`${setari.wp_url}/wp-json/custom/v1/galerie/${postData.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ galerie_foto: pozeIds })
        })
        await Promise.all(pozeIds.map(mediaId =>
          fetch(`${setari.wp_url}/wp-json/wp/v2/media/${mediaId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ post: postData.id })
          })
        ))
      }
      await incarcaProprietati()
      setPublicare('success')
      setFormProp({ ...formGolProprietate })
      setPozeSelectate([])
      setPozePreview([])
      setEditId(null)
      setAdaugaProprietate(false)
      setTimeout(() => setPublicare('idle'), 4000)
    } catch (e: any) {
      setPublicare('error')
      setErrorMsg(e.message || 'A apărut o eroare.')
    }
  }

  const proprietatiFiltrate = proprietati.filter(p =>
    p.titlu.toLowerCase().includes(cautare.toLowerCase()) ||
    p.locatie.toLowerCase().includes(cautare.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0 }}>🏡 Proprietăți</h1>
          <p style={{ color: '#666', margin: '5px 0 0' }}>Publică anunțuri direct pe site-ul tău.</p>
        </div>
        {!adaugaProprietate && (
          <button onClick={() => { setAdaugaProprietate(true); setEditId(null); setFormProp({ ...formGolProprietate }); setPublicare('idle'); setErrorMsg('') }}
            style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 600 }}>
            + Proprietate nouă
          </button>
        )}
      </div>

      {publicare === 'success' && (
        <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px', color: '#166534', fontWeight: 600 }}>
          ✅ Proprietatea a fost {editId ? 'actualizată' : 'publicată'} cu succes!
        </div>
      )}

      {adaugaProprietate && (
        <div style={{ background: 'white', borderRadius: '14px', padding: esteDesktop ? '35px' : '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0 }}>{editId ? '✏️ Editează proprietatea' : 'Proprietate nouă'}</h2>
            <button onClick={() => { setAdaugaProprietate(false); setPozeSelectate([]); setPozePreview([]); setEditId(null) }}
              style={{ background: '#f0f0f0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>✕ Închide</button>
          </div>

          <span style={secTitle}>📸 Fotografii proprietate</span>
          <div style={{ marginBottom: '30px' }}>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '15px' }}>{editId ? 'Adaugă poze noi sau lasă gol pentru a păstra pozele existente.' : 'Adaugă până la 20 fotografii.'}</p>
            {pozePreview.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                {pozePreview.map((src, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', border: i === 0 ? '3px solid #e94560' : '2px solid #f0f0f0' }}>
                    <img src={src} alt={`Poza ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 0 && <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#e94560', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>PRINCIPALĂ</div>}
                    <button onClick={() => stergePoze(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {pozeSelectate.length < 20 && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '2px dashed #ddd', borderRadius: '10px', padding: '25px', cursor: 'pointer', color: '#888', fontSize: '14px', fontWeight: 600, background: '#fafafa' }}>
                <input type="file" multiple accept="image/*" onChange={handlePozeSelect} style={{ display: 'none' }} />
                📷 Alege fotografii ({pozeSelectate.length}/20)
              </label>
            )}
            {uploadProgress && <div style={{ marginTop: '10px', color: '#e94560', fontWeight: 600, fontSize: '14px' }}>⏳ {uploadProgress}</div>}
          </div>

          <span style={secTitle}>📋 Informații de bază</span>
          <div style={{ display: 'grid', gridTemplateColumns: esteDesktop ? '1fr 1fr' : '1fr', gap: '15px', marginBottom: '25px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Titlu anunț *</label>
              <input value={formProp.titlu} onChange={e => setFormProp({ ...formProp, titlu: e.target.value })} placeholder="Ex: Apartament 3 camere, zona centrală, Brașov" style={{ ...inp, fontSize: '15px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Descriere proprietate</label>
              <textarea value={formProp.continut} onChange={e => setFormProp({ ...formProp, continut: e.target.value })} placeholder="Descrie proprietatea în detaliu..." rows={5} style={{ ...inp, resize: 'vertical' as const }} />
            </div>
            <div>
              <label style={lbl}>Tip tranzacție</label>
              <select value={formProp.tip_tranzactie || 'vanzare'} onChange={e => setFormProp({ ...formProp, tip_tranzactie: e.target.value })} style={inp}>
                <option value="vanzare">Vânzare</option>
                <option value="inchiriere">Închiriere</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Tip proprietate</label>
              <select value={formProp.tip_de_proprietate || 'apartament'} onChange={e => setFormProp({ ...formProp, tip_de_proprietate: e.target.value })} style={inp}>
                <option value="apartament">Apartament</option>
                <option value="casa-vila">Casă / Vilă</option>
                <option value="garsoniera">Garsonieră</option>
                <option value="teren">Teren</option>
                <option value="spatiu-comercial">Spațiu comercial</option>
                <option value="birou">Birou</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Locație</label>
              <input value={formProp.locatie || ''} onChange={e => setFormProp({ ...formProp, locatie: e.target.value })} placeholder="Ex: Brasov" style={inp} />
            </div>
            <div>
              <label style={lbl}>Stare proprietate</label>
              <select value={formProp.stare_proprietate || 'buna'} onChange={e => setFormProp({ ...formProp, stare_proprietate: e.target.value })} style={inp}>
                <option value="noua">Nouă</option>
                <option value="buna">Bună</option>
                <option value="renovata">Renovată</option>
                <option value="necesita-renovare">Necesită renovare</option>
                <option value="in-constructie">În construcție</option>
              </select>
            </div>
          </div>

          <span style={secTitle}>📐 Suprafețe și caracteristici</span>
          <div style={{ display: 'grid', gridTemplateColumns: esteDesktop ? '1fr 1fr 1fr' : '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            {[
              { key: 'pret', label: 'Preț (€)', placeholder: 'Ex: 95000' },
              { key: 'suprafata_utila', label: 'Suprafață utilă (mp)', placeholder: 'Ex: 65' },
              { key: 'suprafata_construita', label: 'Suprafață construită (mp)', placeholder: 'Ex: 72' },
              { key: 'numar_camere', label: 'Nr. camere', placeholder: 'Ex: 3' },
              { key: 'numar_bai', label: 'Nr. băi', placeholder: 'Ex: 1' },
              { key: 'etaj', label: 'Etaj', placeholder: 'Ex: 3 din 8' },
              { key: 'anul_constructiei', label: 'Anul construcției', placeholder: 'Ex: 1985' },
              { key: 's_teren', label: 'Suprafață teren (mp)', placeholder: 'Ex: 200' },
              { key: 'id_proprietate', label: 'ID proprietate', placeholder: 'Ex: AP-001' },
              { key: 'numar_whatsapp_agent', label: 'WhatsApp agent', placeholder: 'Ex: 0722100200' },
            ].map(f => (
              <div key={f.key}>
                <label style={lbl}>{f.label}</label>
                <input value={formProp[f.key] || ''} onChange={e => setFormProp({ ...formProp, [f.key]: e.target.value })} placeholder={f.placeholder} style={inp} />
              </div>
            ))}
          </div>

          <span style={secTitle}>📍 Localizare hartă (opțional)</span>
          <div style={{ display: 'grid', gridTemplateColumns: esteDesktop ? '1fr 1fr' : '1fr', gap: '15px', marginBottom: '25px' }}>
            <div>
              <label style={lbl}>Latitudine</label>
              <input value={formProp.latitudine || ''} onChange={e => setFormProp({ ...formProp, latitudine: e.target.value })} placeholder="Ex: 45.6427" style={inp} />
            </div>
            <div>
              <label style={lbl}>Longitudine</label>
              <input value={formProp.longitudine || ''} onChange={e => setFormProp({ ...formProp, longitudine: e.target.value })} placeholder="Ex: 25.5887" style={inp} />
            </div>
          </div>

          <CheckboxGrup titlu="🏷️ Badge-uri anunț" form={formProp} setForm={setFormProp} campuri={[
            { key: 'recomandat', label: 'Recomandat' }, { key: 'nou', label: 'Nou' },
            { key: 'oferta', label: 'Ofertă' }, { key: 'exclusiv', label: 'Exclusiv' },
            { key: 'vandut', label: 'Vândut' }, { key: 'inchiriat', label: 'Închiriat' },
            { key: 'premium', label: 'Premium' },
          ]} />
          <CheckboxGrup titlu="🏗️ Dotări principale" form={formProp} setForm={setFormProp} campuri={[
            { key: 'balcon', label: 'Balcon' }, { key: 'terasa', label: 'Terasă' },
            { key: 'garaj', label: 'Garaj' }, { key: 'curte', label: 'Curte' },
            { key: 'gradina', label: 'Grădină' }, { key: 'spatiu_depozitare', label: 'Spațiu depozitare' },
          ]} />
          <CheckboxGrup titlu="⚡ Utilități" form={formProp} setForm={setFormProp} campuri={[
            { key: 'curent', label: 'Curent electric' }, { key: 'apa', label: 'Apă curentă' },
            { key: 'gaz', label: 'Gaz' }, { key: 'canalizare', label: 'Canalizare' },
            { key: 'acces_internet', label: 'Internet' }, { key: 'fibra_optica', label: 'Fibră optică' },
            { key: 'catv', label: 'CATV' }, { key: 'centrala_proprie', label: 'Centrală proprie' },
            { key: 'calorifere', label: 'Calorifere' }, { key: 'aer_conditionat', label: 'Aer condiționat' },
            { key: 'incalzire_pardoseala', label: 'Încălzire pardoseală' },
            { key: 'apometre', label: 'Apometre' }, { key: 'interfon', label: 'Interfon' },
          ]} />
          <CheckboxGrup titlu="🛋️ Mobilare" form={formProp} setForm={setFormProp} campuri={[
            { key: 'complet_mobilat', label: 'Complet mobilat' }, { key: 'partial_mobilat', label: 'Parțial mobilat' },
            { key: 'bucatarie_mobilata', label: 'Bucătărie mobilată' }, { key: 'bucatarie_utilata', label: 'Bucătărie utilată' },
          ]} />
          <CheckboxGrup titlu="🏠 Finisaje" form={formProp} setForm={setFormProp} campuri={[
            { key: 'usa_intrare_metal', label: 'Ușă metal' }, { key: 'usa_intrare_lemn', label: 'Ușă lemn' },
            { key: 'ferestre_pvc', label: 'Ferestre PVC' }, { key: 'ferestre_lemn', label: 'Ferestre lemn' },
            { key: 'ferestre_termopan', label: 'Termopan' }, { key: 'gresie', label: 'Gresie' },
            { key: 'parchet', label: 'Parchet' }, { key: 'faianta', label: 'Faianță' },
            { key: 'izolatie_exterior', label: 'Izolație exterior' },
          ]} />

          {errorMsg && (
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', marginBottom: '20px', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
            <button onClick={() => salveazaProprietate('publish')} disabled={publicare === 'loading'}
              style={{ background: publicare === 'loading' ? '#ccc' : '#e94560', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '8px', cursor: publicare === 'loading' ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px' }}>
              {publicare === 'loading' ? '⏳ Se salvează...' : editId ? '💾 Salvează modificările' : '🚀 Publică pe site'}
            </button>
            <button onClick={() => salveazaProprietate('draft')} disabled={publicare === 'loading'}
              style={{ background: 'white', color: '#333', border: '2px solid #ddd', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
              💾 Salvează ca ciornă
            </button>
            <button onClick={() => { setAdaugaProprietate(false); setPozeSelectate([]); setPozePreview([]); setEditId(null) }}
              style={{ background: '#f0f0f0', color: '#666', border: 'none', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              Anulează
            </button>
          </div>
        </div>
      )}

      {!adaugaProprietate && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1a1a2e' }}>📋 Proprietățile mele ({proprietati.length})</h2>
            <input value={cautare} onChange={e => setCautare(e.target.value)}
              placeholder="🔍 Caută după titlu sau locație..."
              style={{ ...inp, width: esteDesktop ? '300px' : '100%', margin: 0 }} />
          </div>
          {loading ? (
            <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
              <p style={{ color: '#888' }}>⏳ Se încarcă proprietățile...</p>
            </div>
          ) : proprietatiFiltrate.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>🏡</div>
              <h3>{cautare ? 'Niciun rezultat găsit' : 'Nu ai proprietăți publicate încă'}</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {proprietatiFiltrate.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '12px' }}>
                    {p.poza ? (
                      <img src={p.poza} alt={p.titlu} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '80px', height: '60px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🏡</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: p.titlu }} />
                      <div style={{ color: '#666', fontSize: '13px', marginBottom: '6px' }}>
                        {p.locatie && `📍 ${p.locatie}`}
                        {p.pret && ` · 💰 ${p.pret} €`}
                        {p.suprafata && ` · 📐 ${p.suprafata} mp`}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ background: p.status === 'publish' ? '#dcfce7' : '#fef9c3', color: p.status === 'publish' ? '#166534' : '#854d0e', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                          {p.status === 'publish' ? '✅ Publicat' : '📝 Ciornă'}
                        </span>
                        <span style={{ background: '#f0f0f0', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>{p.tip_tranzactie}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => window.open(p.link, '_blank')} style={{ background: '#f0f0f0', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>👁️ Vezi</button>
                    <button onClick={() => deschideEditare(p.id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>✏️ Editează</button>
                    <button onClick={() => stergeProprietate(p.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>🗑️ Șterge</button>
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