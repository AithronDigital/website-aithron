export type Eticheta = { id: number; nume: string; culoare: string }

export type Contact = {
  id: number; nume: string; telefon: string; email: string
  status: string; nota: string; etichete: number[]
  tip_proprietate?: string; adresa?: string; pret?: string
  suprafata?: string; camere?: string; acte?: string
  buget?: string; zone?: string; camere_dorite?: string
}

export const formGolProprietate = {
  titlu: '', continut: '',
  tip_tranzactie: 'vanzare', tip_de_proprietate: 'apartament',
  locatie: '', stare_proprietate: 'buna',
  pret: '', suprafata_utila: '', suprafata_construita: '',
  numar_camere: '', numar_bai: '', anul_constructiei: '',
  etaj: '', s_teren: '', id_proprietate: '',
  numar_whatsapp_agent: '', latitudine: '', longitudine: '',
  recomandat: false, nou: false, oferta: false, exclusiv: false,
  vandut: false, inchiriat: false, premium: false,
  balcon: false, terasa: false, garaj: false,
  curent: false, apa: false, gaz: false, acces_internet: false,
  centrala_proprie: false, calorifere: false, aer_conditionat: false,
  bucatarie_mobilata: false, bucatarie_utilata: false,
  apometre: false, interfon: false,
  complet_mobilat: false, partial_mobilat: false,
  usa_intrare_metal: false, usa_intrare_lemn: false,
  ferestre_pvc: false, ferestre_lemn: false, ferestre_termopan: false,
  gresie: false, parchet: false, faianta: false, izolatie_exterior: false,
  catv: false, incalzire_pardoseala: false,
  curte: false, gradina: false, spatiu_depozitare: false,
  canalizare: false, fibra_optica: false,
}

export const formGolP = {
  nume: '', telefon: '', email: '', adresa: '', pret: '',
  tip_proprietate: 'Apartament', suprafata: '', camere: '',
  acte: 'Da', status: 'Activ', nota: '', etichete: [] as number[]
}

export const formGolC = {
  nume: '', telefon: '', email: '', buget: '', zone: '',
  camere_dorite: '', tip_proprietate: 'Apartament',
  status: 'Activ', nota: '', etichete: [] as number[]
}

export const statusColor: Record<string, string> = {
  'Activ': '#22c55e', 'În negociere': '#f59e0b',
  'În așteptare': '#f59e0b', 'Finalizat': '#6b7280',
}

export const culoriDisponibile = ['#e94560','#3b82f6','#22c55e','#f59e0b','#8b5cf6','#06b6d4','#f97316','#6b7280']

export const meniu = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'proprietati', icon: '🏡', label: 'Proprietăți' },
  { id: 'crm', icon: '👥', label: 'Clienți (CRM)' },
  { id: 'blog', icon: '📝', label: 'Blog' },
  { id: 'site', icon: '🌐', label: 'Editare Site' },
  { id: 'ecard', icon: '👤', label: 'eCard' },
  { id: 'setari', icon: '⚙️', label: 'Setări profil' },
]

export const taburi = [
  { id: 'vanzare', label: '🏠 Proprietari Vânzare' },
  { id: 'inchiriere', label: '🔑 Proprietari Închiriere' },
  { id: 'cumparatori', label: '🛒 Cumpărători' },
  { id: 'chiriasi', label: '📋 Chiriași' },
]

export const inp = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const, outline: 'none' }
export const lbl = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#444' } as const
export const secTitle = { fontWeight: 700, fontSize: '15px', color: '#1a1a2e', marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #e94560', display: 'block' } as const