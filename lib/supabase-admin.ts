import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmmkvbmuhyhmeaplwptk.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)