'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Contact, Eticheta, formGolP, formGolC, statusColor, culoriDisponibile, taburi } from './types'


export default function SectiuneCRM() {
  const [tabActiv, setTabActiv] = useState('vanzare')
  const [adauga, setAdauga] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [gestioneazaEtichete, setGestioneazaEtichete] = useState(false)
  const [etichetaNouaNume, setEtichetaNouaNume] = useState('')
  const [etichetaNouaCuloare, setEtichetaNouaCuloare] = useState('#3b82f6')
  const [contacte, setContacte] = useState<Contact[]>([])
  const [esteDesktop, setEsteDesktop] = useState(true)
  const [cautare, setCautare] = useState('')
  const [exportLoading, setExportLoading] = useState(false)


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


  const azi = new Date().toISOString().split('T')[0]


  const remindereDepasite = contacte.filter(c =>
    c.reminder_date && c.reminder_date <= azi
  )


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


  const contacteFiltrate = contacte.filter(c =>
    c.nume?.toLowerCase().includes(cautare.toLowerCase()) ||
    c.telefon?.toLowerCase().includes(cautare.toLowerCase()) ||
    c.email?.toLowerCase().includes(cautare.toLowerCase())
  )


  const deschideEditare = (contact: Contact) => {
    if (esteProprietar) {
      setFormP({ ...contact })
    } else {
      setFormC({ ...contact })
    }
    setEditContact(contact)
    setAdauga(true)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }


  const inchideFormular = () => {
    setAdauga(false)
    setEditContact(null)
    setFormP({ ...formGolP })
    setFormC({ ...formGolC })
  }


  const salveaza = async () => {
    const form = esteProprietar ? formP : formC
    if (!form.nume) return
    try {
      if (editContact) {
        const { id, tab, created_at, ...updateData } = form
        const { data, error } = await supabase
          .from('contacte_crm')
          .update(updateData)
          .eq('id', editContact.id)
          .select()
        if (!error && data) {
          setContacte(contacte.map(c => c.id === editContact.id ? data[0] : c))
          inchideFormular()
        }
      } else {
        const { data, error } = await supabase
          .from('contacte_crm')
          .insert([{ ...form, tab: tabActiv }])
          .select()
        if (!error && data) {
          setContacte([data[0], ...contacte])
          inchideFormular()
        }
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


  const exportPDF = async () => {
    setExportLoading(true)
    try {
      const { data: toateContactele } = await supabase
        .from('contacte_crm')
        .select('*')
        .eq('tab', tabActiv)
        .order('created_at', { ascending: false })


      if (!toateContactele) return


      const tabLabel = taburi.find(t => t.id === tabActiv)?.label || tabActiv
      const dataAzi = new Date().toLocaleDateString('ro-RO')


      let html = `
        <html><head><meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
          h1 { color: #e94560; font-size: 18px; margin-bottom: 5px; }
          .subtitle { color: #888; margin-bottom: 20px; font-size: 11px; }
          .contact { border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 12px; page-break-inside: avoid; }
          .nume { font-weight: bold; font-size: 14px; color: #1a1a2e; }
          .info { color: #555; margin-top: 4px; }
          .nota { color: #888; font-style: italic; margin-top: 6px; }
          .status { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: bold; background: #f0f0f0; }
          .reminder { color: #e94560; font-weight: bold; }
          .data { color: #aaa; font-size: 10px; margin-top: 4px; }
        </style></head><body>
        <h1>👥 ${tabLabel}</h1>
        <div class="subtitle">Export din Aithron Digital · ${dataAzi} · ${toateContactele.length} contacte</div>
      `


      toateContactele.forEach(c => {
        const dataAdaugat = c.created_at ? new Date(c.created_at).toLocaleDateString('ro-RO') : '-'
        const reminderText = c.reminder_date
          ? `<div class="reminder">⏰ Urmărire: ${new Date(c.reminder_date).toLocaleDateString('ro-RO')}${c.reminder_date <= azi ? ' ⚠️ DEPĂȘIT' : ''}</div>`
          : ''
        html += `
          <div class="contact">
            <div class="nume">${c.nume}</div>
            <div class="info">📞 ${c.telefon || '-'} · ✉️ ${c.email || '-'}</div>
            ${esteProprietar
              ? `<div class="info">📍 ${c.adresa || '-'} · 💰 ${c.pret || '-'} · 📐 ${c.suprafata || '-'}mp · 🚪 ${c.camere || '-'} cam</div>`
              : `<div class="info">💰 Buget: ${c.buget || '-'} · 📍 ${c.zone || '-'} · 🚪 ${c.camere_dorite || '-'} camere</div>`
            }
            <div class="info"><span class="status">${c.status || 'Activ'}</span> · ${c.tip_proprietate || '-'}</div>
            ${c.nota ? `<div class="nota">💬 ${c.nota}</div>` : ''}
            ${reminderText}
            <div class="data">📅 Adăugat: ${dataAdaugat}</div>
          </div>
        `
      })


      html += '</body></html>'


      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
        win.print()
      }
    } catch (e) { console.error(e) }
    finally { setExportLoading(false) }
  }


  const formatData = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }


  const inp = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }


  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0 }}>👥 Clienți (CRM)</h1>
          <p style={{ color: '#666', margin: '5px 0 0' }}>Gestionează toate contactele tale.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setGestioneazaEtichete(!gestioneazaEtichete)} style={{ background: gestioneazaEtichete ? '#1a1a2e' : 'white', color: gestioneazaEtichete ? 'white' : '#333', border: '1px solid #ddd', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            🏷️ Etichete
          </button>
          <button onClick={exportPDF} disabled={exportLoading} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            {exportLoading ? '⏳...' : '📄 Export PDF'}
          </button>
          <button onClick={() => { setAdauga(true); setEditContact(null); setFormP({ ...formGolP }); setFormC({ ...formGolC }) }} style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 600 }}>
            + Adaugă contact
          </button>
        </div>
      </div>


      {/* BANNER REMINDERE DEPĂȘITE */}
      {remindereDepasite.length > 0 && (
        <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '14px' }}>
              {remindereDepasite.length} reminder{remindereDepasite.length > 1 ? 'e' : ''} depășit{remindereDepasite.length > 1 ? 'e' : ''}!
            </div>
            <div style={{ color: '#ef4444', fontSize: '13px' }}>
              {remindereDepasite.map(c => c.nume).join(', ')}
            </div>
          </div>
        </div>
      )}


      {/* ETICHETE */}
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


      {/* TABURI + CĂUTARE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {taburi.map(t => {
            const nrContacte = contacte.length
            return (
              <button key={t.id} onClick={() => { setTabActiv(t.id); setAdauga(false); setEditContact(null); setCautare('') }} style={{ background: tabActiv === t.id ? '#1a1a2e' : 'white', color: tabActiv === t.id ? 'white' : '#333', border: '1px solid #ddd', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, position: 'relative' as const }}>
                {t.label} {tabActiv === t.id && <span style={{ background: '#e94560', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', marginLeft: '6px' }}>{nrContacte}</span>}
              </button>
            )
          })}
        </div>
        <input
          value={cautare}
          onChange={e => setCautare(e.target.value)}
          placeholder="🔍 Caută după nume, telefon, email..."
          style={{ ...inp, width: esteDesktop ? '280px' : '100%', margin: 0 }}
        />
      </div>


      {/* FORMULAR ADAUGARE/EDITARE */}
      {adauga && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>{editContact ? '✏️ Editează contact' : '➕ Contact nou'} — {taburi.find(t => t.id === tabActiv)?.label}</h3>
            <button onClick={inchideFormular} style={{ background: '#f0f0f0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>✕ Închide</button>
          </div>


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
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>⏰ Dată urmărire (reminder)</label>
              <input
                type="date"
                value={esteProprietar ? (formP.reminder_date || '') : (formC.reminder_date || '')}
                onChange={e => esteProprietar ? setFormP({ ...formP, reminder_date: e.target.value }) : setFormC({ ...formC, reminder_date: e.target.value })}
                style={inp}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>📝 Notă</label>
              <textarea
                placeholder="Scrie observații, detalii întâlniri, urmăriri..."
                value={esteProprietar ? formP.nota : formC.nota}
                onChange={e => esteProprietar ? setFormP({ ...formP, nota: e.target.value }) : setFormC({ ...formC, nota: e.target.value })}
                rows={4}
                style={{ ...inp, resize: 'vertical' as const }}
              />
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


          <div style={{ display: 'flex', gap: '10px', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
            <button onClick={salveaza} style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
              {editContact ? '💾 Salvează modificările' : '💾 Salvează'}
            </button>
            <button onClick={inchideFormular} style={{ background: '#f0f0f0', color: '#333', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Anulează
            </button>
          </div>
        </div>
      )}


      {/* LISTA CONTACTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading && <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>⏳ Se încarcă contactele...</div>}
        {!loading && contacteFiltrate.length === 0 && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>
            {cautare ? '🔍 Niciun contact găsit.' : 'Nu ai contacte în această categorie. Adaugă primul! 👆'}
          </div>
        )}
        {!loading && contacteFiltrate.map(contact => {
          const areReminderDepasite = contact.reminder_date && contact.reminder_date <= azi
          return (
            <div key={contact.id} style={{ background: 'white', borderRadius: '12px', padding: '20px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: areReminderDepasite ? '2px solid #ef4444' : '2px solid transparent' }}>
              {esteDesktop ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flex: 1 }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>{contact.nume.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {contact.nume}
                          {areReminderDepasite && <span style={{ background: '#ef4444', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>⚠️ Reminder depășit</span>}
                        </div>
                        <div style={{ color: '#666', fontSize: '13px', marginTop: '3px' }}>📞 {contact.telefon} · ✉️ {contact.email}</div>
                        {esteProprietar && <div style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>📍 {contact.adresa} · 💰 {contact.pret} · 📐 {contact.suprafata}mp · 🚪 {contact.camere} cam · 📄 Acte: {contact.acte}</div>}
                        {!esteProprietar && <div style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>💰 Buget: {contact.buget} · 📍 Zone: {contact.zone} · 🚪 {contact.camere_dorite} camere</div>}
                        {contact.nota && <div style={{ color: '#888', fontSize: '13px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>💬 {contact.nota}</div>}
                        {contact.reminder_date && <div style={{ color: areReminderDepasite ? '#ef4444' : '#f59e0b', fontSize: '13px', marginTop: '4px', fontWeight: 600 }}>⏰ Urmărire: {formatData(contact.reminder_date || '')}</div>}
                        <div style={{ color: '#bbb', fontSize: '11px', marginTop: '4px' }}>📅 Adăugat: {formatData(contact.created_at || '')}</div>
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
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => deschideEditare(contact)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                      ✏️ Editează contact
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>{contact.nume.charAt(0)}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>
                        {contact.nume}
                        {areReminderDepasite && <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '8px', fontWeight: 600, marginLeft: '6px' }}>⚠️</span>}
                      </div>
                      <div style={{ color: '#666', fontSize: '13px', marginTop: '3px' }}>📞 {contact.telefon} · ✉️ {contact.email}</div>
                      {esteProprietar && <div style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>📍 {contact.adresa} · 💰 {contact.pret} · 📐 {contact.suprafata}mp · 🚪 {contact.camere} cam</div>}
                      {!esteProprietar && <div style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>💰 Buget: {contact.buget} · 📍 Zone: {contact.zone}</div>}
                      {contact.nota && <div style={{ color: '#888', fontSize: '13px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>💬 {contact.nota}</div>}
                      {contact.reminder_date && <div style={{ color: areReminderDepasite ? '#ef4444' : '#f59e0b', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>⏰ {formatData(contact.reminder_date || '')}</div>}
                      <div style={{ color: '#bbb', fontSize: '11px', marginTop: '4px' }}>📅 {formatData(contact.created_at || '')}</div>
                      {contact.etichete && contact.etichete.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {contact.etichete.map((eid: number) => {
                            const et = etichete.find(e => e.id === eid)
                            if (!et) return null
                            return <span key={eid} onClick={() => toggleEtichetaContact(contact.id, eid)} style={{ background: et.culoare, color: 'white', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{et.nume} ×</span>
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ background: '#f0f0f0', padding: '5px 12px', borderRadius: '20px', fontSize: '13px' }}>{contact.tip_proprietate}</span>
                    <span style={{ background: (statusColor[contact.status] || '#888') + '22', color: statusColor[contact.status] || '#888', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>{contact.status}</span>
                    <button onClick={() => deschideWhatsapp(contact.telefon, contact.nume)} style={{ background: '#25D366', color: 'white', border: 'none', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</button>
                    <button onClick={() => sterge(contact.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ccc' }}>🗑️</button>
                  </div>
                  <div style={{ paddingTop: '10px', borderTop: '1px solid #f5f5f5' }}>
                    <button onClick={() => deschideEditare(contact)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, width: '100%' }}>
                      ✏️ Editează contact
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}