'use client'
import { useState } from 'react'

export default function BetaPage() {
  const [form, setForm] = useState({ nume: '', email: '', telefon: '', judet: '' })
  const [loading, setLoading] = useState(false)
  const [trimis, setTrimis] = useState(false)
  const [eroare, setEroare] = useState('')
  const [focusat, setFocusat] = useState('')

  const capitalizeFirst = (val: string) => {
    if (!val) return val
    return val.charAt(0).toUpperCase() + val.slice(1)
  }

  const trimiteFormular = async () => {
    if (!form.nume || !form.email || !form.telefon) {
      setEroare('Te rugam completeaza toate campurile obligatorii.')
      return
    }
    setLoading(true)
    setEroare('')
    try {
      const res = await fetch('/api/beta-aplicant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) setTrimis(true)
      else setEroare('A aparut o eroare. Incearca din nou.')
    } catch {
      setEroare('A aparut o eroare. Incearca din nou.')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#080d1a', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes rotateGold { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { outline: none !important; border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.2) !important; }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(201,168,76,0.1) !important; }
        .btn-glow { transition: all 0.2s; }
        .btn-glow:hover { box-shadow: 0 0 30px rgba(201,168,76,0.4) !important; transform: translateY(-2px); }
        .btn-wa { transition: all 0.2s; }
        .btn-wa:hover { box-shadow: 0 0 30px rgba(37,211,102,0.4) !important; transform: translateY(-2px); }
      `}</style>

      {/* BG decorativ cu elemente aurii */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Gradient radial auriu sus-dreapta */}
        <div style={{ position: 'absolute', top: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        {/* Gradient radial albastru jos-stanga */}
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(30,60,120,0.4) 0%, transparent 70%)', borderRadius: '50%' }} />
        {/* Linie aurie orizontala sus */}
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), rgba(201,168,76,0.8), rgba(201,168,76,0.4), transparent)' }} />
        {/* Linie aurie orizontala jos */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), rgba(201,168,76,0.6), rgba(201,168,76,0.3), transparent)' }} />
        {/* Linie verticala stanga */}
        <div style={{ position: 'absolute', top: '10%', left: '0', width: '1px', height: '80%', background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.2), rgba(201,168,76,0.4), rgba(201,168,76,0.2), transparent)' }} />
        {/* Linie verticala dreapta */}
        <div style={{ position: 'absolute', top: '10%', right: '0', width: '1px', height: '80%', background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.2), rgba(201,168,76,0.4), rgba(201,168,76,0.2), transparent)' }} />
        {/* Ornament colt stanga sus */}
        <div style={{ position: 'absolute', top: '0', left: '0', width: '80px', height: '80px', borderTop: '1px solid rgba(201,168,76,0.5)', borderLeft: '1px solid rgba(201,168,76,0.5)' }} />
        {/* Ornament colt dreapta sus */}
        <div style={{ position: 'absolute', top: '0', right: '0', width: '80px', height: '80px', borderTop: '1px solid rgba(201,168,76,0.5)', borderRight: '1px solid rgba(201,168,76,0.5)' }} />
        {/* Ornament colt stanga jos */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '80px', height: '80px', borderBottom: '1px solid rgba(201,168,76,0.5)', borderLeft: '1px solid rgba(201,168,76,0.5)' }} />
        {/* Ornament colt dreapta jos */}
        <div style={{ position: 'absolute', bottom: '0', right: '0', width: '80px', height: '80px', borderBottom: '1px solid rgba(201,168,76,0.5)', borderRight: '1px solid rgba(201,168,76,0.5)' }} />
        {/* Puncte decorative */}
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: '4px', height: '4px', background: 'rgba(201,168,76,0.4)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '60%', left: '3%', width: '3px', height: '3px', background: 'rgba(201,168,76,0.3)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '35%', right: '4%', width: '4px', height: '4px', background: 'rgba(201,168,76,0.4)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '75%', right: '6%', width: '3px', height: '3px', background: 'rgba(201,168,76,0.3)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: '40px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '30px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6))' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#c9a84c', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Aithron Digital
          </span>
          <div style={{ width: '30px', height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.6), transparent)' }} />
        </div>

        {/* HERO */}
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '44px 24px 0' }}>

          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '30px', padding: '8px 22px' }}>
              <span style={{ width: '7px', height: '7px', background: '#c9a84c', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', color: '#c9a84c', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Program Pilot · 20 Locuri</span>
            </div>
          </div>

          {/* Titlu */}
          <h1 style={{ fontSize: 'clamp(30px, 5.5vw, 50px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 24px', textAlign: 'center', letterSpacing: '-0.5px' }}>
            Sistemul digital complet<br />
            <span style={{ background: 'linear-gradient(135deg, #c9a84c, #f0d080, #c9a84c)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>
              pentru tine, agent imobiliar
            </span>
          </h1>

          <p style={{ fontSize: '17px', color: '#8888aa', lineHeight: 1.8, margin: '0 auto 48px', textAlign: 'center', maxWidth: '560px' }}>
            Caut <strong style={{ color: 'white' }}>20 de agenți</strong> care să testeze platforma în primă instanță. Gratuit, o lună, cu acces complet. Eu am nevoie de feedback real — tu ai nevoie de un sistem care chiar funcționează.
          </p>

          {/* Features grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '56px' }}>
            {[
              { icon: '🌐', label: 'Site profesional', desc: 'Pe domeniu propriu, cu datele tale' },
              { icon: '📋', label: 'CRM integrat', desc: 'Contacte, remindere, organizare' },
              { icon: '💳', label: 'eCard cu QR', desc: 'Carte de vizita digitala' },
              { icon: '📄', label: 'Ghiduri PDF', desc: 'Personalizate cu brandul tau' },
              { icon: '📊', label: 'Dashboard', desc: 'Totul intr-un singur loc' },
            ].map((f, i) => (
              <div key={i} className="card-hover" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '14px', padding: '20px 16px', cursor: 'default' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'white' }}>{f.label}</div>
                <div style={{ color: '#666688', fontSize: '13px', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Linie aurie separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3))' }} />
            <div style={{ width: '6px', height: '6px', background: '#c9a84c', borderRadius: '50%', opacity: 0.6 }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)' }} />
          </div>

          {/* FORMULAR */}
          {trimis ? (
            <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '20px', padding: '56px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>🎉</div>
              <h2 style={{ color: '#c9a84c', margin: '0 0 14px', fontSize: '24px', fontWeight: 800 }}>Aplicatia a fost trimisa!</h2>
              <p style={{ color: '#8888aa', margin: 0, fontSize: '16px', lineHeight: 1.7 }}>
                Te contactez personal in maxim 24 de ore pe WhatsApp sau email pentru a confirma locul tau in program.
              </p>
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '20px', padding: '36px', position: 'relative', overflow: 'hidden' }}>

              {/* Ornament colt formular */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '1px solid rgba(201,168,76,0.4)', borderLeft: '1px solid rgba(201,168,76,0.4)', borderRadius: '20px 0 0 0' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '1px solid rgba(201,168,76,0.4)', borderRight: '1px solid rgba(201,168,76,0.4)', borderRadius: '0 0 20px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: 'white' }}>Aplica pentru un loc</h2>
                  <p style={{ color: '#666688', fontSize: '13px', margin: 0 }}>Completeaza formularul si te contactez eu personal.</p>
                </div>
                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#c9a84c', lineHeight: 1 }}>20</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>locuri</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Nume si prenume *', key: 'nume', type: 'text', placeholder: 'Ion Popescu', capitalize: true },
                  { label: 'Telefon WhatsApp *', key: 'telefon', type: 'tel', placeholder: '07xx xxx xxx', capitalize: false },
                  { label: 'Email *', key: 'email', type: 'email', placeholder: 'ion@gmail.com', capitalize: false },
                  { label: 'Judet / Oras', key: 'judet', type: 'text', placeholder: 'Cluj-Napoca', capitalize: true },
                ].map(camp => (
                  <div key={camp.key}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 700, color: '#c9a84c', letterSpacing: '1px', textTransform: 'uppercase' }}>{camp.label}</label>
                    <input
                      type={camp.type}
                      placeholder={camp.placeholder}
                      value={(form as any)[camp.key]}
                      onChange={e => {
                        const val = camp.capitalize ? capitalizeFirst(e.target.value) : e.target.value
                        setForm({ ...form, [camp.key]: val })
                      }}
                      onFocus={() => setFocusat(camp.key)}
                      onBlur={() => setFocusat('')}
                      style={{ width: '100%', padding: '13px 16px', background: focusat === camp.key ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.04)', border: `1px solid ${focusat === camp.key ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: 'white', fontSize: '15px', boxSizing: 'border-box' as const, transition: 'all 0.2s' }}
                    />
                  </div>
                ))}
              </div>

              {eroare && (
                <div style={{ color: '#f87171', fontSize: '14px', padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: '10px', marginTop: '16px', border: '1px solid rgba(239,68,68,0.15)' }}>
                  {eroare}
                </div>
              )}

              <button
                onClick={trimiteFormular}
                disabled={loading}
                className="btn-glow"
                style={{ width: '100%', background: loading ? '#333' : 'linear-gradient(135deg, #c9a84c, #a8863c)', color: '#080d1a', border: 'none', padding: '17px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px', letterSpacing: '0.3px' }}>
                {loading ? 'Se trimite...' : 'Vreau un loc in program'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ color: '#444466', fontSize: '12px' }}>sau</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              </div>

              <a
                href="https://wa.me/40775264428?text=Buna!%20Vreau%20sa%20aplic%20pentru%20programul%20pilot%20Aithron%20Digital."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.25)', color: '#25d366', padding: '15px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxSizing: 'border-box' as const }}>
                Scrie-mi direct pe WhatsApp
              </a>

            </div>
          )}
        </div>

        {/* BLOC 2 — DE CE */}
        <div style={{ maxWidth: '720px', margin: '80px auto 0', padding: '0 24px 80px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3))' }} />
            <div style={{ width: '6px', height: '6px', background: '#c9a84c', borderRadius: '50%', opacity: 0.7 }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)' }} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '36px', color: 'white' }}>
            De ce fac asta?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { icon: '👩‍💼', titlu: 'Sunt agent imobiliar activ', text: 'Activez ca buyers agent — NorvenBuyers.com. Stiu exact cu ce te confruntzi zilnic — am construit asta din interior, nu din teorie.' },
              { icon: '🤝', titlu: 'Am nevoie de tine', text: 'Nu de un utilizator pasiv — ci de cineva care foloseste platforma si imi spune sincer ce lipseste.' },
              { icon: '💎', titlu: 'Recompensa ta', text: 'Daca iti place si ramai, primesti un pret special de fondator, rezervat celor 20 de pionieri.' },
            ].map((item, i) => (
              <div key={i} className="card-hover" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '16px', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '1px solid rgba(201,168,76,0.3)', borderLeft: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px 0 0 0' }} />
                <div style={{ fontSize: '34px', marginBottom: '14px' }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '10px', color: 'white' }}>{item.titlu}</div>
                <div style={{ color: '#7777aa', fontSize: '13px', lineHeight: 1.7 }}>{item.text}</div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', color: '#2a2a44', fontSize: '12px', marginTop: '60px', letterSpacing: '0.5px' }}>
            2026 · Aithron Digital · Solutii digitale pentru agenti imobiliari
          </p>
        </div>
      </div>
    </div>
  )
}