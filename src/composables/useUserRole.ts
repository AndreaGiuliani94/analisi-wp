import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export interface Participant {
  email: string
  role: 'owner' | 'editor' | 'viewer'
}

/**
 * Restituisce un computed con il ruolo dell'utente corrente
 * @param participants Array dei partecipanti della sessione
 * @param userEmail opzionale, email specifica dell'utente
 */
export function useUserRole(participants: Participant[], userEmail?: string) {
  const authStore = useAuthStore()

  const role = computed(() => {
    const email = userEmail ?? authStore.user?.email
    if (!email) return 'viewer'
    return participants.find(p => p.email === email)?.role ?? 'viewer'
  })

  return { role }
}
