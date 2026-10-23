// scripts/keep-alive.js
import { createClient } from '@supabase/supabase-js'

// Leggiamo le chiavi dalle variabili d'ambiente di GitHub Actions
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: Variabili d\'ambiente mancanti!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function pingDatabase() {
  console.log('Invio del segnale di risveglio a Supabase...')

  const now = new Date().toISOString()
  
  const { data: insertData, error: insertError } = await supabase
    .from('keep_alive_logs')
    .insert([{ pinged_at: now }])

  if (insertError) {
    console.error('Errore durante la scrittura:', insertError.message)
    process.exit(1)
  }

  console.log(`Scrittura completata con successo! Data inserita: ${now}`)

  // 2. PULIZIA: Calcoliamo la data di 7 giorni fa
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  // Cancelliamo i log più vecchi di 7 giorni per mantenere il database pulito e leggero
  const { error: deleteError } = await supabase
    .from('keep_alive_logs')
    .delete()
    .lt('pinged_at', sevenDaysAgo) 

  if (deleteError) {
    console.warn('Nota: impossibile pulire i vecchi log, ma il ping è andato a buon fine.', deleteError.message)
  } else {
    console.log('Pulizia dei vecchi log completata.')
  }
}

pingDatabase()