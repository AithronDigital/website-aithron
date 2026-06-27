'use client'
import { useState } from 'react'

export default function BetaPage() {
  const [form, setForm] = useState({ nume: '', email: '', telefon: '', judet: '' })
  const [loading, setLoading] = useState(false)
  const [trimis, setTrimis] = useState(false)
  const [eroare, setEroare] = useState('')

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
      if (data.success) {
        setTrimis(true)
      } else {
        setEroare('A apărut o eroare. Încearcă din nou.')
      }
    } catch {
      setEroare('A apărut o eroare. Încearcă din nou.')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#0f0f1a', minHeight: '100vh', color: 'white' }}>

      {/* HERO */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 24px 60px' }}>

        <div style={{ display: 'inline-block', background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.4)', borderRadius: '30px', padding: '6px 18px', fontSize: '13px', color: '#e94560', fontWeight: 600, marginBottom: '32px', letterSpacing: '0.5px' }}>
          🧪 PROGRAM PILOT — LOCURI LIMITATE
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 20px', color: 'white' }}>
          Testează gratuit sistemul complet pentru agenți imobiliari
        </h1>

        <p style={{ fontSize: '18px', color: '#a0a0b8', lineHeight: 1.7, margin: '0 0 40px' }}>
          Caut <strong style={{ color: 'white' }}>10 agenți imobiliari</strong> cu care să lucrez direct, o lună întreagă, fără niciun cost. Tu testezi, eu îmbunătățesc. La final, dacă rămâi, ai un preț special pe viață.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '50px' }}>
          {[
            { icon: '🌐', text: 'Site profesional cu numele tău, pe domeniu propriu' },
            { icon: '📋', text: 'CRM cu gestionare contacte și remindere' },
            { icon: '💳', text: 'eCard digital cu QR code — impresionează de la prima întâlnire' },
            { icon: '📄', text: 'Ghiduri PDF personalizate pentru cumpărători și vânzători' },
            { icon: '📊', text: 'Dashboard complet — totul într-un singur loc' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <span style={{ fontSize: '20px', marginTop: '2px' }}>{item.icon}</span>
              <span style={{ color: '#c8c8e0', fontSize: '16px', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* FORMULAR */}
        {trimis ? (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#4ade80', margin: '0 0 12px', fontSize: '22px' }}>Aplicația ta a fost trimisă!</h2>
            <p style={{ color: '#a0a0b8', margin: 0, fontSize: '16px', lineHeight: 1.6 }}>
              Te contactez personal în maxim 24 de ore pe WhatsApp sau email pentru a confirma locul tău în program.
            </p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '36px' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700 }}>Aplică pentru un loc</h2>
            <p style={{ color: '#a0a0b8', fontSize: '14px', margin: '0 0 28px' }}>Selectez personal fiecare participant. Nu primul venit, ci cel mai potrivit.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Nume și prenume *', key: 'nume', type: 'text', placeholder: 'ex: Ion Popescu' },
                { label: 'Email *', key: 'email', type: 'email', placeholder: 'ex: ion@gmail.com' },
                { label: 'Telefon (WhatsApp) *', key: 'telefon', type: 'tel', placeholder: 'ex: 07xx xxx xxx' },
                { label: 'Județ / Oraș', key: 'judet', type: 'text', placeholder: 'ex: Cluj-Napoca' },
              ].map(camp => (
                <div key={camp.key}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#c8c8e0', letterSpacing: '0.3px' }}>{camp.label}</label>
                  <input
                    type={camp.type}
                    placeholder={camp.placeholder}
                    value={(form as any)[camp.key]}
                    onChange={e => setForm({ ...form, [camp.key]: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
              ))}

              {eroare && (
                <div style={{ color: '#f87171', fontSize: '14px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                  {eroare}
                </div>
              )}

              <button
                onClick={trimiteFormular}
                disabled={loading}
                style={{ background: loading ? '#888' : '#e94560', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', transition: 'all 0.2s' }}>
                {loading ? 'Se trimite...' : '🚀 Vreau un loc în program'}
              </button>

              <p style={{ color: '#666', fontSize: '12px', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.5 }}>
                Datele tale sunt în siguranță. Nu trimitem spam.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BLOC 2 — DE CE */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '36px', textAlign: 'center', color: 'white' }}>
            De ce fac asta?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🤝', titlu: 'Feedback real', text: 'Am nevoie de agenți care folosesc platforma zilnic și îmi spun sincer ce lipsește.' },
              { icon: '💎', titlu: 'Preț de fondator', text: 'Cei 10 participanți primesc 75€/lună pe viață, față de 89€ prețul standard.' },
              { icon: '👩‍💼', titlu: 'Știu ce trăiești', text: '6 ani agent imobiliar. Am construit asta pentru că eu însămi am simțit nevoia.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: 'white' }}>{item.titlu}</div>
                <div style={{ color: '#a0a0b8', fontSize: '14px', lineHeight: 1.6 }}>{item.text}</div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', color: '#555', fontSize: '13px', marginTop: '48px' }}>
            © {new Date().getFullYear()} Aithron Digital · Soluții digitale pentru agenți imobiliari
          </p>
        </div>
      </div>

    </div>
  )
}