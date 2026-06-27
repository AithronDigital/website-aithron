'use client'
import { useState } from 'react'

export default function BetaPage() {
  const [form, setForm] = useState({ nume: '', email: '', telefon: '', judet: '' })
  const [loading, setLoading] = useState(false)
  const [trimis, setTrimis] = useState(false)
  const [eroare, setEroare] = useState('')
  const [focusat, setFocusat] = useState('')

  const trimiteFormular = async () => {
    if (!form.nume || !form.email || !form.telefon) {
      setEroare('Te rugăm completează numele, emailul și telefonul.')
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
      else setEroare('A apărut o eroare. Încearcă din nou.')
    } catch {
      setEroare('A apărut o eroare. Încearcă din nou.')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#0a0a14', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { outline: none; border-color: #e94560 !important; box-shadow: 0 0 0 3px rgba(233,69,96,0.15); }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(233,69,96,0.15) !important; }
        .btn-glow:hover { box-shadow: 0 0 30px rgba(233,69,96,0.5) !important; transform: translateY(-2px); }
        .btn-glow { transition: all 0.2s; }
      `}</style>

      {/* BG decorativ */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(233,69,96,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: '48px 24px 0' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#e94560', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Aithron Digital
          </span>
        </div>

        {/* HERO */}
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 0' }}>

          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.35)', borderRadius: '30px', padding: '8px 20px' }}>
              <span style={{ width: '8px', height: '8px', background: '#e94560', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '13px', color: '#e94560', fontWeight: 700, letterSpacing: '0.5px' }}>PROGRAM PILOT · 20 LOCURI</span>
            </div>
          </div>

          {/* Titlu */}
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 54px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 24px', textAlign: 'center', letterSpacing: '-1px' }}>
            Sistemul digital complet<br />
            <span style={{ background: 'linear-gradient(135deg, #e94560, #ff6b8a, #e94560)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>
              pentru tine, agent imobiliar
            </span>
          </h1>

          <p style={{ fontSize: '18px', color: '#8888aa', lineHeight: 1.75, margin: '0 auto 48px', textAlign: 'center', maxWidth: '560px' }}>
            Caut <strong style={{ color: 'white' }}>20 de agenți</strong> care să testeze platforma în primă instanță. Gratuit, o lună, cu acces complet. Eu am nevoie de feedback real — tu ai nevoie de un sistem care chiar funcționează.
          </p>

          {/* Features grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '56px' }}>
            {[
              { icon: '🌐', label: 'Site profesional', desc: 'Pe domeniu propriu, cu datele tale' },
              { icon: '📋', label: 'CRM integrat', desc: 'Contacte, remindere, organizare' },
              { icon: '💳', label: 'eCard cu QR', desc: 'Carte de vizită digitală' },
              { icon: '📄', label: 'Ghiduri PDF', desc: 'Personalizate cu brandul tău' },
              { icon: '📊', label: 'Dashboard', desc: 'Totul într-un singur loc' },
            ].map((f, i) => (
              <div key={i} className="card-hover" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px 16px', cursor: 'default' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'white' }}>{f.label}</div>
                <div style={{ color: '#666688', fontSize: '13px', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* FORMULAR */}
          {trimis ? (
            <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.04))', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '20px', padding: '56px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>🎉</div>
              <h2 style={{ color: '#4ade80', margin: '0 0 14px', fontSize: '24px', fontWeight: 800 }}>Aplicația a fost trimisă!</h2>
              <p style={{ color: '#8888aa', margin: 0, fontSize: '16px', lineHeight: 1.7 }}>
                Te contactez personal în maxim 24 de ore pe WhatsApp sau email<br />pentru a confirma locul tău în program.
              </p>
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(10px)' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800 }}>Aplică pentru un loc</h2>
                  <p style={{ color: '#666688', fontSize: '13px', margin: 0 }}>Nu primul venit — selectez eu cu cine lucrez.</p>
                </div>
                <div style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.25)', borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#e94560', lineHeight: 1 }}>20</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>locuri</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Nume și prenume *', key: 'nume', type: 'text', placeholder: 'Ion Popescu' },
                  { label: 'Telefon WhatsApp *', key: 'telefon', type: 'tel', placeholder: '07xx xxx xxx' },
                  { label: 'Email *', key: 'email', type: 'email', placeholder: 'ion@gmail.com' },
                  { label: 'Județ / Oraș', key: 'judet', type: 'text', placeholder: 'Cluj-Napoca' },
                ].map(camp => (
                  <div key={camp.key}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#9999bb', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{camp.label}</label>
                    <input
                      type={camp.type}
                      placeholder={camp.placeholder}
                      value={(form as any)[camp.key]}
                      onChange={e => setForm({ ...form, [camp.key]: e.target.value })}
                      onFocus={() => setFocusat(camp.key)}
                      onBlur={() => setFocusat('')}
                      style={{ width: '100%', padding: '13px 16px', background: focusat === camp.key ? 'rgba(233,69,96,0.05)' : 'rgba(255,255,255,0.05)', border: `1px solid ${focusat === camp.key ? '#e94560' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', color: 'white', fontSize: '15px', boxSizing: 'border-box' as const, transition: 'all 0.2s' }}
                    />
                  </div>
                ))}
              </div>

              {eroare && (
                <div style={{ color: '#f87171', fontSize: '14px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', marginTop: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ {eroare}
                </div>
              )}

              <button
                onClick={trimiteFormular}
                disabled={loading}
                className="btn-glow"
                style={{ width: '100%', background: loading ? '#444' : 'linear-gradient(135deg, #e94560, #c73652)', color: 'white', border: 'none', padding: '18px', borderRadius: '14px', fontSize: '17px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px', letterSpacing: '0.3px' }}>
                {loading ? '⏳ Se trimite...' : '🚀 Vreau un loc în program'}
              </button>

              <p style={{ color: '#444466', fontSize: '12px', textAlign: 'center', margin: '14px 0 0', lineHeight: 1.6 }}>
                🔒 Datele tale sunt în siguranță. Niciun spam, promis.
              </p>
            </div>
          )}
        </div>

        {/* BLOC 2 */}
        <div style={{ maxWidth: '720px', margin: '80px auto 0', padding: '0 24px 80px' }}>
          <div style={{ width: '40px', height: '2px', background: '#e94560', margin: '0 auto 40px', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '26px', fontWeight: 800, textAlign: 'center', marginBottom: '40px', color: 'white' }}>
            De ce fac asta?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { icon: '👩‍💼', titlu: 'Sunt agent imobiliar activ', text: 'Lucrez ca buyers agent prin NorvenBuyers.com. Știu exact cu ce te confrunți zilnic — am construit asta din interior, nu din teorie.' },
              { icon: '🤝', titlu: 'Am nevoie de tine', text: 'Nu de un utilizator pasiv — ci de cineva care folosește platforma și îmi spune sincer ce lipsește.' },
              { icon: '💎', titlu: 'Recompensa ta', text: 'Dacă îți place și rămâi, primești un preț special de fondator, rezervat celor 20 de pionieri.' },
            ].map((item, i) => (
              <div key={i} className="card-hover" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px 24px' }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '10px', color: 'white' }}>{item.titlu}</div>
                <div style={{ color: '#7777aa', fontSize: '14px', lineHeight: 1.7 }}>{item.text}</div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', color: '#333355', fontSize: '13px', marginTop: '60px' }}>
            © {new Date().getFullYear()} Aithron Digital · Soluții digitale pentru agenți imobiliari
          </p>
        </div>
      </div>
    </div>
  )
}