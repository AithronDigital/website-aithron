'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'mirela25lili@gmail.com'

type Agent = {
  id: number
  email: string
  nume: string
  telefon: string
  plan: string
  activ: boolean
  wp_url: string
  created_at: string
  data_inceput?: string
  data_expirare?: string
  nota_plata?: string
}

export default function Admin() {
  const router = useRouter()
  const [verificat, setVerificat] = useState(false)
  const [agenti, setAgenti] = useState<Agent[]>([])
  const [sectiune, setSectiune] = useState('agenti')
  const [formNou, setFormNou] = useState(false)
  const [agent, setAgent] = useState({ email: '', nume: '', telefon: '', plan: 'Basic', wp_url: '', data_inceput: '', data_expirare: '', nota_plata: '' })
  const [mesaj, setMesaj] = useState('')
  const [editandId, setEditandId] = useState<number | null>(null)
  const [editDate, setEditDate] = useState<Partial<Agent>>({})

  useEffect(() => {
    const verificaSesiunea = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.replace('/')
      } else {
        setVerificat(true)
        incarcaAgenti()
      }
    }
    verificaSesiunea()
  }, [])

  const incarcaAgenti = async () => {
    const { data } = await supabase.from('agenti').select('*').order('created_at', { ascending: false })
    if (data) setAgenti(data)
  }

  const adaugaAgent = async () => {
    if (!agent.email || !agent.nume) { setMesaj('❌ Email și nume sunt obligatorii!'); return }
    const { error } = await supabase.from('agenti').insert([{ ...agent, activ: true }])
    if (error) { setMesaj('❌ Eroare: ' + error.message); return }
    setMesaj('✅ Agent adăugat cu succes!')
    setAgent({ email: '', nume: '', telefon: '', plan: 'Basic', wp_url: '', data_inceput: '', data_expirare: '', nota_plata: '' })
    setFormNou(false)
    incarcaAgenti()
  }

  const toggleActiv = async (id: number, activ: boolean) => {
    await supabase.from('agenti').update({ activ: !activ }).eq('id', id)
    incarcaAgenti()
  }

  const stergeAgent = async (id: number) => {
    if (!confirm('Ești sigură că vrei să ștergi acest agent definitiv?')) return
    await supabase.from('agenti').delete().eq('id', id)
    incarcaAgenti()
  }

  const incepeEditare = (a: Agent) => {
    setEditandId(a.id)
    setEditDate({
      email: a.email, nume: a.nume, telefon: a.telefon, plan: a.plan,
      wp_url: a.wp_url, data_inceput: a.data_inceput || '',
      data_expirare: a.data_expirare || '', nota_plata: a.nota_plata || ''
    })
  }

  const salveazaEditare = async (id: number) => {
    const { error } = await supabase.from('agenti').update(editDate).eq('id', id)
    if (error) { setMesaj('❌ Eroare: ' + error.message); return }
    setMesaj('✅ Agent actualizat cu succes!')
    setEditandId(null)
    setEditDate({})
    incarcaAgenti()
  }

  const getZileRamase = (data_expirare?: string) => {
    if (!data_expirare) return null
    const azi = new Date()
    const expirare = new Date(data_expirare)
    const zile = Math.ceil((expirare.getTime() - azi.getTime()) / (1000 * 60 * 60 * 24))
    return zile
  }

  const getBadgeExpirare = (data_expirare?: string) => {
    const zile = getZileRamase(data_expirare)
    if (zile === null) return null
    if (zile < 0) return { text: 'Expirat', color: '#ef4444', bg: '#fee2e2' }
    if (zile <= 7) return { text: `⚠️ ${zile} zile`, color: '#ea580c', bg: '#fff7ed' }
    if (zile <= 30) return { text: `${zile} zile`, color: '#f59e0b', bg: '#fefce8' }
    return { text: `${zile} zile`, color: '#16a34a', bg: '#dcfce7' }
  }

  if (!verificat) return null

  const agentiActivi = agenti.filter(a => a.activ).length
  const agentiInactivi = agenti.filter(a => !a.activ).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: '#1a1a2e', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column', position: 'sticky' as const, top: 0, height: '100vh' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#e94560', fontSize: '20px', margin: '0 0 5px' }}>👑 Admin Panel</h2>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Aithron Digital</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'agenti', icon: '👥', label: 'Agenți' },
            { id: 'monitoring', icon: '📡', label: 'Monitorizare' },
            { id: 'abonamente', icon: '💰', label: 'Abonamente' },
            { id: 'statistici', icon: '📊', label: 'Statistici' },
            { id: 'setari', icon: '⚙️', label: 'Setări platformă' },
          ].map(item => (
            <button key={item.id} onClick={() => {
              if (item.id === 'monitoring') {
                router.push('/admin/monitoring')
              } else {
                setSectiune(item.id)
              }
            }} style={{
              background: sectiune === item.id ? '#e94560' : 'transparent',
              color: 'white', border: 'none', padding: '12px 15px',
              borderRadius: '8px', cursor: 'pointer', textAlign: 'left' as const, fontSize: '15px'
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); router.replace('/') }}
          style={{ background: 'transparent', color: '#e94560', border: 'none', cursor: 'pointer', textAlign: 'left' as const, padding: '12px 15px', fontSize: '15px' }}>
          🚪 Deconectare
        </button>
      </div>

      {/* Conținut */}
      <div style={{ flex: 1, padding: '40px', background: '#f5f5f5', overflowY: 'auto' as const }}>

        {/* SECȚIUNEA AGENȚI */}
        {sectiune === 'agenti' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ margin: 0, fontSize: '28px', color: '#1a1a2e' }}>👥 Agenți ({agenti.length})</h1>
              <button onClick={() => setFormNou(!formNou)} style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 600 }}>
                + Agent nou
              </button>
            </div>

            {mesaj && (
              <div style={{ background: mesaj.includes('✅') ? '#dcfce7' : '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
                {mesaj}
              </div>
            )}

            {formNou && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                <h3 style={{ marginTop: 0 }}>➕ Agent nou</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {[
                    { label: 'Email *', key: 'email', type: 'email' },
                    { label: 'Nume *', key: 'nume', type: 'text' },
                    { label: 'Telefon', key: 'telefon', type: 'text' },
                    { label: 'URL WordPress', key: 'wp_url', type: 'text' },
                    { label: 'Data început abonament', key: 'data_inceput', type: 'date' },
                    { label: 'Data expirare abonament', key: 'data_expirare', type: 'date' },
                  ].map(camp => (
                    <div key={camp.key}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>{camp.label}</label>
                      <input type={camp.type} value={(agent as any)[camp.key]} onChange={e => setAgent({ ...agent, [camp.key]: e.target.value })}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Plan</label>
                    <select value={agent.plan} onChange={e => setAgent({ ...agent, plan: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}>
                      <option>Basic</option>
                      <option>Pro</option>
                      <option>Premium</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Notă plată (ex: Monese)</label>
                    <input type="text" value={agent.nota_plata} onChange={e => setAgent({ ...agent, nota_plata: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={adaugaAgent} style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    💾 Salvează
                  </button>
                  <button onClick={() => setFormNou(false)} style={{ background: '#f5f5f5', color: '#333', border: '1px solid #ddd', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer' }}>
                    Anulează
                  </button>
                </div>
              </div>
            )}

            {agenti.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
                <p>Nu ai agenți încă. Adaugă primul agent!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {agenti.map(a => (
                  <div key={a.id} style={{ background: 'white', borderRadius: '12px', padding: '20px 25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    {editandId === a.id ? (
                      <div>
                        <h3 style={{ marginTop: 0 }}>✏️ Editează agent</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          {[
                            { label: 'Email', key: 'email', type: 'email' },
                            { label: 'Nume', key: 'nume', type: 'text' },
                            { label: 'Telefon', key: 'telefon', type: 'text' },
                            { label: 'URL WordPress', key: 'wp_url', type: 'text' },
                            { label: 'Data început', key: 'data_inceput', type: 'date' },
                            { label: 'Data expirare', key: 'data_expirare', type: 'date' },
                          ].map(camp => (
                            <div key={camp.key}>
                              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>{camp.label}</label>
                              <input type={camp.type} value={(editDate as any)[camp.key] || ''} onChange={e => setEditDate({ ...editDate, [camp.key]: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                            </div>
                          ))}
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Plan</label>
                            <select value={editDate.plan || 'Basic'} onChange={e => setEditDate({ ...editDate, plan: e.target.value })}
                              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}>
                              <option>Basic</option>
                              <option>Pro</option>
                              <option>Premium</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Notă plată</label>
                            <input type="text" value={(editDate.nota_plata as string) || ''} onChange={e => setEditDate({ ...editDate, nota_plata: e.target.value })}
                              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button onClick={() => salveazaEditare(a.id)} style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            💾 Salvează
                          </button>
                          <button onClick={() => setEditandId(null)} style={{ background: '#f5f5f5', color: '#333', border: '1px solid #ddd', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer' }}>
                            Anulează
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{a.nume}</div>
                          <div style={{ color: '#666', fontSize: '14px' }}>{a.email} • {a.telefon}</div>
                          <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>{a.wp_url}</div>
                          {a.nota_plata && (
                            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>💳 {a.nota_plata}</div>
                          )}
                          <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: a.activ ? '#dcfce7' : '#fee2e2', color: a.activ ? '#166534' : '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                              {a.activ ? '● Activ' : '● Inactiv'}
                            </span>
                            {getBadgeExpirare(a.data_expirare) && (
                              <span style={{ background: getBadgeExpirare(a.data_expirare)!.bg, color: getBadgeExpirare(a.data_expirare)!.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                                📅 {getBadgeExpirare(a.data_expirare)!.text}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: a.plan === 'Premium' ? '#f59e0b' : a.plan === 'Pro' ? '#3b82f6' : '#6b7280', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                            {a.plan}
                          </span>
                          <button onClick={() => incepeEditare(a)} style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            ✏️ Editează
                          </button>
                          <button onClick={() => toggleActiv(a.id, a.activ)} style={{ background: a.activ ? '#fff7ed' : '#f0fdf4', color: a.activ ? '#ea580c' : '#16a34a', border: `1px solid ${a.activ ? '#ea580c' : '#16a34a'}`, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            {a.activ ? '⏸ Dezactivează' : '▶ Activează'}
                          </button>
                          <button onClick={() => stergeAgent(a.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            🗑️ Șterge
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECȚIUNEA ABONAMENTE */}
        {sectiune === 'abonamente' && (
          <div>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '30px' }}>💰 Abonamente</h1>
            {agenti.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>💰</div>
                <p>Nu ai agenți încă.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {agenti.map(a => (
                  <div key={a.id} style={{ background: 'white', borderRadius: '12px', padding: '20px 25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${a.activ ? '#22c55e' : '#ef4444'}` }}>
                    {editandId === a.id ? (
                      <div>
                        <h3 style={{ marginTop: 0 }}>✏️ Editează abonament — {a.nume}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Plan</label>
                            <select value={editDate.plan || a.plan} onChange={e => setEditDate({ ...editDate, plan: e.target.value })}
                              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}>
                              <option>Basic</option>
                              <option>Pro</option>
                              <option>Premium</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Data început</label>
                            <input type="date" value={(editDate.data_inceput as string) || ''} onChange={e => setEditDate({ ...editDate, data_inceput: e.target.value })}
                              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Data expirare</label>
                            <input type="date" value={(editDate.data_expirare as string) || ''} onChange={e => setEditDate({ ...editDate, data_expirare: e.target.value })}
                              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Notă plată</label>
                            <input type="text" value={(editDate.nota_plata as string) || ''} onChange={e => setEditDate({ ...editDate, nota_plata: e.target.value })}
                              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button onClick={() => salveazaEditare(a.id)} style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            💾 Salvează
                          </button>
                          <button onClick={() => setEditandId(null)} style={{ background: '#f5f5f5', color: '#333', border: '1px solid #ddd', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer' }}>
                            Anulează
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{a.nume}</div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>{a.email}</div>
                          <div style={{ fontSize: '13px', color: '#888' }}>
                            📅 Început: {a.data_inceput || 'Nedefinit'} → Expiră: {a.data_expirare || 'Nedefinit'}
                          </div>
                          {a.nota_plata && (
                            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>💳 {a.nota_plata}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: a.plan === 'Premium' ? '#f59e0b' : a.plan === 'Pro' ? '#3b82f6' : '#6b7280', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                            {a.plan}
                          </span>
                          {getBadgeExpirare(a.data_expirare) && (
                            <span style={{ background: getBadgeExpirare(a.data_expirare)!.bg, color: getBadgeExpirare(a.data_expirare)!.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                              📅 {getBadgeExpirare(a.data_expirare)!.text}
                            </span>
                          )}
                          <span style={{ background: a.activ ? '#dcfce7' : '#fee2e2', color: a.activ ? '#166534' : '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                            {a.activ ? 'Activ' : 'Inactiv'}
                          </span>
                          <button onClick={() => toggleActiv(a.id, a.activ)} style={{ background: a.activ ? '#fff7ed' : '#f0fdf4', color: a.activ ? '#ea580c' : '#16a34a', border: `1px solid ${a.activ ? '#ea580c' : '#16a34a'}`, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            {a.activ ? '⏸ Dezactivează' : '▶ Activează'}
                          </button>
                          <button onClick={() => incepeEditare(a)} style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            ✏️ Editează
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECȚIUNEA STATISTICI */}
        {sectiune === 'statistici' && (
          <div>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '30px' }}>📊 Statistici</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {[
                { label: 'Total agenți', value: agenti.length, icon: '👥', color: '#3b82f6' },
                { label: 'Agenți activi', value: agentiActivi, icon: '✅', color: '#22c55e' },
                { label: 'Agenți inactivi', value: agentiInactivi, icon: '⏸', color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <h3 style={{ marginTop: 0, color: '#1a1a2e' }}>📋 Distribuție planuri</h3>
              {['Basic', 'Pro', 'Premium'].map(plan => {
                const count = agenti.filter(a => a.plan === plan).length
                const percent = agenti.length > 0 ? Math.round((count / agenti.length) * 100) : 0
                return (
                  <div key={plan} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 600 }}>{plan}</span>
                      <span style={{ color: '#888' }}>{count} agenți ({percent}%)</span>
                    </div>
                    <div style={{ background: '#f5f5f5', borderRadius: '10px', height: '8px' }}>
                      <div style={{ background: plan === 'Premium' ? '#f59e0b' : plan === 'Pro' ? '#3b82f6' : '#6b7280', width: `${percent}%`, height: '8px', borderRadius: '10px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SECȚIUNEA SETĂRI */}
        {sectiune === 'setari' && (
          <div>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '30px' }}>⚙️ Setări platformă</h1>
            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <h3 style={{ marginTop: 0 }}>Informații platformă</h3>
              {[
                { label: 'Nume platformă', value: 'Aithron Digital' },
                { label: 'Email contact', value: 'mirela25lili@gmail.com' },
                { label: 'Site master WordPress', value: 'webmaster.aithrondigital.com' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#333' }}>{item.label}</label>
                  <input defaultValue={item.value} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                </div>
              ))}
              <button style={{ background: '#e94560', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                💾 Salvează setările
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}