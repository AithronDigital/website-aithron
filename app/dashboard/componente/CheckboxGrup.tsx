export default function CheckboxGrup({ titlu, campuri, form, setForm }: {
  titlu: string
  campuri: { key: string; label: string }[]
  form: any
  setForm: (v: any) => void
}) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a2e', marginBottom: '12px', paddingBottom: '7px', borderBottom: '2px solid #f0f0f0' }}>
        {titlu}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {campuri.map(c => (
          <label key={c.key} style={{
            display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer',
            background: form[c.key] ? '#e94560' : '#f5f5f5',
            color: form[c.key] ? 'white' : '#555',
            padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
            userSelect: 'none' as const,
            border: form[c.key] ? '2px solid #e94560' : '2px solid transparent'
          }}>
            <input type="checkbox" checked={form[c.key]}
              onChange={e => setForm({ ...form, [c.key]: e.target.checked })}
              style={{ display: 'none' }} />
            {form[c.key] ? '✓ ' : ''}{c.label}
          </label>
        ))}
      </div>
    </div>
  )
}