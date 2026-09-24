// scripts/keep-alive.js
import { createClient } from '@supabase/supabase-js'

// Leggiamo le chiavi dalle variabili d'ambiente di GitHub Actions
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: Variabili d\'ambiente mancanti!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function pingDatabase() {
  console.log('Invio del segnale di risveglio a Supabase...')
  
  // Eseguiamo una query semplicissima (legge una riga da una tabella a tua scelta, es. 'profiles')
  const { data, error } = await supabase.from('events').select('*').limit(1)

  if (error) {
    console.error('Errore durante il ping:', error.message)
    process.exit(1)
  }

  console.log('Database risvegliato con successo! Dati ricevuti:', data)
}

pingDatabase()