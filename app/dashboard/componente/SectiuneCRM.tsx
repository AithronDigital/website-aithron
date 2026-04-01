'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Contact, Eticheta, formGolP, formGolC, statusColor, culoriDisponibile, taburi } from './types'

export default function SectiuneCRM() {
  const [tabActiv, setTabActiv] = useState('vanzare')
  const [adauga, setAdauga] = useState(false)
  const [loading, setLoading] = useState(true)
  const [gestioneazaEtichete, setGestioneazaEtichete] = useState(false)
  const [etichetaNouaNume, setEtichetaNouaNume] = useState('')
  const [etichetaNouaCuloare, setEtichetaNouaCuloare] = useState('#3b82f6')
  const [contacte, setContacte] = useState<Contact[]>([])
  const [esteDesktop, setEsteDesktop] = useState(true)

  const [etichete, setEtichete] = useState<Eticheta[]>([
    { id: 1, nume: 'Contactat', culoare: '#3b82f6' },
    { id: 2, nume: 'În negociere', culoare: '#f59e0b' },
    { id: 3, nume: 'Nu răspunde', culoare: '#6b7280' },
    { id: 4, nume: 'Vândut', culoare: '#22c55e' },
    { id: 5, nume: 'Închiriat', culoare: '#8b5cf6' },
  ])

  const [formP, setFormP] = useState<any>({ ...formGolP })
  const [formC, setFormC] = useState<any>({ ...formGolC })

  const esteProprietar = tabActiv === 'vanzare' || tabActiv === 'inchiriere'

  useEffect(() => {
    incarcaContacte()
    const verificaDimensiune = () => setEsteDesktop(window.innerWidth >= 900)
    verificaDimensiune()
    window.addEventListener('resize', verificaDimensiune)
    return () => window.removeEventListener('resize', verificaDimensiune)
  }, [tabActiv])

  const incarcaContacte = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contacte_crm')
        .select('*')
        .eq('tab', tabActiv)
        .order('created_at', { ascending: false })
      if (!error && data) setContacte(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const getLista = () => contacte

  const salveaza = async () => {
    const form = esteProprietar ? formP : formC
    if (!form.nume) return
    try {
      const { data, error } = await supabase
        .from('contacte_crm')
        .insert([{ ...form, tab: tabActiv }])
        .select()
      if (!error && data) {
        setContacte([data[0], ...contacte])
        setFormP({ ...formGolP })
        setFormC({ ...formGolC })
        setAdauga(false)
      }
    } catch (e) { console.error(e) }
  }

  const sterge = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi acest contact?')) return
    try {
      await supabase.from('contacte_crm').delete().eq('id', id)
      setContacte(contacte.filter(c => c.id !== id))
    } catch (e) { console.error(e) }
  }

  const toggleEtichetaContact = async (contactId: number, etichetaId: number) => {
    const contact = contacte.find(c => c.id === contactId)
    if (!contact) return
    const are = contact.etichete.includes(etichetaId)
    const nouaLista = are
      ? contact.etichete.filter((e: number) => e !== etichetaId)
      : [...contact.etichete, etichetaId]
    await supabase.from('contacte_crm').update({ etichete: nouaLista }).eq('id', contactId)
    setContacte(contacte.map(c => c.id === contactId ? { ...c, etichete: nouaLista } : c))
  }

  const toggleEtichetaForm = (etichetaId: number) => {
    if (esteProprietar) {
      const are = formP.etichete.includes(etichetaId)
      setFormP({ ...formP, etichete: are ? formP.etichete.filter((e: number) => e !== etichetaId) : [...formP.etichete, etichetaId] })
    } else {
      const are = formC.etichete.includes(etichetaId)
      setFormC({ ...formC, etichete: are ? formC.etichete.filter((e: number) => e !== etichetaId) : [...formC.etichete, etichetaId] })
    }
  }

  const adaugaEticheta = () => {
    if (!etichetaNouaNume.trim()) return
    setEtichete([...etichete, { id: Date.now(), nume: etichetaNouaNume.trim(), culoare: etichetaNouaCuloare }])
    setEtichetaNouaNume('')
  }

  const deschideWhatsapp = (telefon: string, nume: string) => {
    const numarCurat = telefon.replace(/\s/g, '')
    const numarRo = numarCurat.startsWith('0') ? '4' + numarCurat : numarCurat
    const mesaj = encodeURIComponent(`Bună ziua, ${nume}! Vă contactez în legătură cu proprietatea discutată.`)
    window.open(`https://wa.me/${numarRo}?text=${mesaj}`, '_blank')
  }

  const inp = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0 }}>👥 Clienți (CRM)</h1>
          <p style={{ color: '#666', margin: '5px 0 0' }}>Gestionează toate contactele tale.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setGestioneazaEtichete(!gestioneazaEtichete)} style={{ background: gestioneazaEtichete ? '#1a1a2e' : 'white', color: gestioneazaEtichete ? 'white' : '#333', border: '1px solid #ddd', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            🏷️ Etichete
          </button>
          <button onClick={() => setAdauga(true)} style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 600 }}>
            + Adaugă contact
          </button>
        </div>
      </div>

      {gestioneazaEtichete && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>🏷️ Etichetele mele</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {etichete.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: e.culoare + '22', border: `1px solid ${e.culoare}`, borderRadius: '20px', padding: '6px 14px' }}>
                <span style={{ color: e.culoare, fontWeight: 600, fontSize: '14px' }}>{e.nume}</span>
                <button onClick={() => setEtichete(etichete.filter(et => et.id !== e.id))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: e.culoare, fontSize: '18px', lineHeight: 1, padding: '0 0 0 4px' }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={etichetaNouaNume} onChange={e => setEtichetaNouaNume(e.target.value)} placeholder="Nume etichetă nouă..." onKeyDown={e => e.key === 'Enter' && adaugaEticheta()} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', width: '200px' }} />
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {culoriDisponibile.map(c => (
                <div key={c} onClick={() => setEtichetaNouaCuloare(c)} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, cursor: 'pointer', border: etichetaNouaCuloare === c ? '3px solid #333' : '3px solid transparent', boxSizing: 'border-box' as const }} />
              ))}
            </div>
            <button onClick={adaugaEticheta} style={{ background: '#e94560', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Adaugă</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
        {taburi.map(t => (
          <button key={t.id} onClick={() => { setTabActiv(t.id); setAdauga(false) }} style={{ background: tabActiv === t.id ? '#1a1a2e' : 'white', color: tabActiv === t.id ? 'white' : '#333', border: '1px solid #ddd', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            {t.label}
          </button>
        ))}
      </div>

      {adauga && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginTop: 0 }}>Contact nou — {taburi.find(t => t.id === tabActiv)?.label}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: esteDesktop ? '1fr 1fr' : '1fr', gap: '15px' }}>
            {[
              { key: 'nume', label: 'Nume complet', placeholder: 'Ex: Ion Popescu', type: 'text' },
              { key: 'telefon', label: 'Telefon', placeholder: '07XX XXX XXX', type: 'tel' },
              { key: 'email', label: 'Email', placeholder: 'email@exemplu.ro', type: 'email' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={esteProprietar ? formP[f.key] : formC[f.key]} onChange={e => esteProprietar ? setFormP({ ...formP, [f.key]: e.target.value }) : setFormC({ ...formC, [f.key]: e.target.value })} style={inp} />
              </div>
            ))}
            {esteProprietar && <>
              {[
                { key: 'adresa', label: 'Adresa proprietății', placeholder: 'Str. Florilor 10, București' },
                { key: 'pret', label: tabActiv === 'vanzare' ? 'Preț cerut (€)' : 'Chirie cerută (€/lună)', placeholder: 'Ex: 95.000' },
                { key: 'suprafata', label: 'Suprafață (mp)', placeholder: 'Ex: 65' },
                { key: 'camere', label: 'Nr. camere', placeholder: 'Ex: 3' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>{f.label}</label>
                  <input placeholder={f.placeholder} value={formP[f.key]} onChange={e => setFormP({ ...formP, [f.key]: e.target.value })} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Tip proprietate</label>
                <select value={formP.tip_proprietate} onChange={e => setFormP({ ...formP, tip_proprietate: e.target.value })} style={inp}>
                  {['Apartament', 'Casă', 'Garsonieră', 'Teren', 'Spațiu comercial', 'Vilă'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Acte în regulă</label>
                <select value={formP.acte} onChange={e => setFormP({ ...formP, acte: e.target.value })} style={inp}>
                  <option>Da</option><option>Nu</option><option>În lucru</option>
                </select>
              </div>
            </>}
            {!esteProprietar && <>
              {[
                { key: 'buget', label: tabActiv === 'cumparatori' ? 'Buget maxim (€)' : 'Buget chirie (€/lună)', placeholder: 'Ex: 80.000' },
                { key: 'zone', label: 'Zone preferate', placeholder: 'Ex: Centru, Floreasca' },
                { key: 'camere_dorite', label: 'Nr. camere dorite', placeholder: 'Ex: 2-3' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>{f.label}</label>
                  <input placeholder={f.placeholder} value={formC[f.key]} onChange={e => setFormC({ ...formC, [f.key]: e.target.value })} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Tip proprietate căutat</label>
                <select value={formC.tip_proprietate} onChange={e => setFormC({ ...formC, tip_proprietate: e.target.value })} style={inp}>
                  {['Apartament', 'Casă', 'Garsonieră', 'Teren', 'Spațiu comercial', 'Vilă'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </>}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Status</label>
              <select value={esteProprietar ? formP.status : formC.status} onChange={e => esteProprietar ? setFormP({ ...formP, status: e.target.value }) : setFormC({ ...formC, status: e.target.value })} style={inp}>
                <option>Activ</option><option>În negociere</option><option>În așteptare</option><option>Finalizat</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Notă</label>
              <input placeholder="Observații..." value={esteProprietar ? formP.nota : formC.nota} onChange={e => esteProprietar ? setFormP({ ...formP, nota: e.target.value }) : setFormC({ ...formC, nota: e.target.value })} style={inp} />
            </div>
          </div>
          {etichete.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>🏷️ Etichete</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {etichete.map(e => {
                  const selectata = (esteProprietar ? formP.etichete : formC.etichete).includes(e.id)
                  return <div key={e.id} onClick={() => toggleEtichetaForm(e.id)} style={{ background: selectata ? e.culoare : 'white', color: selectata ? 'white' : e.culoare, border: `2px solid ${e.culoare}`, borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{selectata ? '✓ ' : ''}{e.nume}</div>
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={salveaza} style={{ background: '#e94560', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>💾 Salvează</button>
            <button onClick={() => setAdauga(false)} style={{ background: '#f0f0f0', color: '#333', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer' }}>Anulează</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading && <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>⏳ Se încarcă contactele...</div>}
        {!loading && getLista().length === 0 && <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>Nu ai contacte în această categorie. Adaugă primul! 👆</div>}
        {!loading && getLista().map(contact => (
          <div key={contact.id} style={{ background: 'white', borderRadius: '12px', padding: '20px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {esteDesktop ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>{contact.nume.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{contact.nume}</div>
                    <div style={{ color: '#666', fontSize: '13px', marginTop: '3px' }}>📞 {contact.telefon} · ✉️ {contact.email}</div>
                    {esteProprietar && <div style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>📍 {contact.adresa} · 💰 {contact.pret} · 📐 {contact.suprafata}mp · 🚪 {contact.camere} cam · 📄 Acte: {contact.acte}</div>}
                    {!esteProprietar && <div style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>💰 Buget: {contact.buget} · 📍 Zone: {contact.zone} · 🚪 {contact.camere_dorite} camere</div>}
                    {contact.nota && <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>💬 {contact.nota}</div>}
                    {contact.etichete && contact.etichete.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {contact.etichete.map((eid: number) => {
                          const et = etichete.find(e => e.id === eid)
                          if (!et) return null
                          return <span key={eid} onClick={() => toggleEtichetaContact(contact.id, eid)} style={{ background: et.culoare, color: 'white', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{et.nume} ×</span>
                        })}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {etichete.filter(e => !contact.etichete?.includes(e.id)).map(e => (
                        <span key={e.id} onClick={() => toggleEtichetaContact(contact.id, e.id)} style={{ background: 'transparent', color: '#aaa', border: '1px dashed #ccc', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', cursor: 'pointer' }}>+ {e.nume}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ background: '#f0f0f0', padding: '5px 12px', borderRadius: '20px', fontSize: '13px' }}>{contact.tip_proprietate}</span>
                  <span style={{ background: (statusColor[contact.status] || '#888') + '22', color: statusColor[contact.status] || '#888', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>{contact.status}</span>
                  <button onClick={() => deschideWhatsapp(contact.telefon, contact.nume)} style={{ background: '#25D366', color: 'white', border: 'none', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</button>
                  <button onClick={() => sterge(contact.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ccc' }}>🗑️</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>{contact.nume.charAt(0)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{contact.nume}</div>
                    <div style={{ color: '#666', fontSize: '13px', marginTop: '3px' }}>📞 {contact.telefon} · ✉️ {contact.email}</div>
                    {esteProprietar && <div style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>📍 {contact.adresa} · 💰 {contact.pret} · 📐 {contact.suprafata}mp · 🚪 {contact.camere} cam · 📄 Acte: {contact.acte}</div>}
                    {!esteProprietar && <div style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>💰 Buget: {contact.buget} · 📍 Zone: {contact.zone} · 🚪 {contact.camere_dorite} camere</div>}
                    {contact.nota && <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>💬 {contact.nota}</div>}
                    {contact.etichete && contact.etichete.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {contact.etichete.map((eid: number) => {
                          const et = etichete.find(e => e.id === eid)
                          if (!et) return null
                          return <span key={eid} onClick={() => toggleEtichetaContact(contact.id, eid)} style={{ background: et.culoare, color: 'white', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{et.nume} ×</span>
                        })}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {etichete.filter(e => !contact.etichete?.includes(e.id)).map(e => (
                        <span key={e.id} onClick={() => toggleEtichetaContact(contact.id, e.id)} style={{ background: 'transparent', color: '#aaa', border: '1px dashed #ccc', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', cursor: 'pointer' }}>+ {e.nume}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: '#f0f0f0', padding: '5px 12px', borderRadius: '20px', fontSize: '13px' }}>{contact.tip_proprietate}</span>
                  <span style={{ background: (statusColor[contact.status] || '#888') + '22', color: statusColor[contact.status] || '#888', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>{contact.status}</span>
                  <button onClick={() => deschideWhatsapp(contact.telefon, contact.nume)} style={{ background: '#25D366', color: 'white', border: 'none', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</button>
                  <button onClick={() => sterge(contact.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ccc' }}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}