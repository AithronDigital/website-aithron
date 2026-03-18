import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmmkvbmuhyhmeaplwptk.supabase.co'
const supabaseKey = 'sb_publishable_ATfV63xgyvHjXNOH74T3aQ_fbqC-dbA'

export const supabase = createClient(supabaseUrl, supabaseKey)