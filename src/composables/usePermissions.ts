import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { MatchRole, TournamentRole } from '@/enum/RoleType'

/**
 * Gestione centralizzata dei permessi basata sui ruoli contestuali.
 */
export function usePermissions() {
  const authStore = useAuthStore()

  // --- 1. Permessi Organizzazione (Globali) ---
  const organizationRole = computed(() => authStore.user?.orgRole)
  const isOrgAdmin = computed(() => organizationRole.value === 'ADMIN')
  const isOrgStaff = computed(() => ['ADMIN', 'STAFF'].includes(organizationRole.value || ''))

  // --- 2. Permessi Match (Richiedono il ruolo del match come input) ---
  const canEditMatch = (role: MatchRole | string | undefined | null) => {
    if (isOrgAdmin.value) return true // Un admin dell'org può fare tutto
    return role === MatchRole.OWNER || role === MatchRole.EDITOR
  }

  const canManageParticipants = (role: MatchRole | string | undefined | null) => {
    return role === MatchRole.OWNER || isOrgAdmin.value
  }

  const canOperateLive = (role: MatchRole | string | undefined | null) => {
    if (isOrgAdmin.value) return true
    return role === MatchRole.OWNER || role === MatchRole.TIMEKEEPER
  }

  // --- 3. Permessi Torneo (Richiedono il ruolo del torneo) ---
  const canManageTournament = (role: string | undefined | null) => {
    return role === TournamentRole.ADMIN || role === TournamentRole.EDITOR || isOrgAdmin.value
  }

  return {
    // Stati globali
    isOrgAdmin,
    isOrgStaff,
    organizationRole,
    
    // Funzioni di check
    canEditMatch,
    canManageParticipants,
    canOperateLive,
    canManageTournament
  }
}