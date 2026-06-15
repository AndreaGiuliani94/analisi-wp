<template>
  <BaseModal
    :is-open="isOpen" 
    title="Aggiungi Utente al Torneo" 
    @close="closeModal"
  >
    <div class="flex flex-col gap-4 items-start justify-between">
      <BaseSelect
        class="w-full"
        id="userSelect"
        v-model="selectedUserId"
        label="Seleziona Utente"
        :options="userOptions"
        required
      />

      <BaseSelect
        class="w-full"
        id="roleSelect"
        v-model="selectedRole"
        label="Assegna Ruolo"
        :options="roleOptions"
        required
      />
      
      <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>
    </div>
    <template #footer>
        <ActionButton
          size="lg"
          color="green"
          :label="loading ? 'Aggiunta...' : 'Aggiungi Utente'"
          @click="handleAddUser"
          :disabled="loading || !selectedUserId || !selectedRole"
        />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseSelect from '../selects/BaseSelect.vue'
import ActionButton from '../buttons/ActionButton.vue'
import { useTournamentStore } from '@/stores/tournamentStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'
import type { TournamentParticipant } from '@/interfaces/Tournament'
import { TournamentRole } from '@/enum/RoleType'

const props = defineProps<{
  isOpen: boolean
  tournamentId: string
  existingParticipants: TournamentParticipant[]
}>()

const emit = defineEmits(['close', 'updated'])
const tournamentStore = useTournamentStore()
const authStore = useAuthStore()
const toast = useToast()

const selectedUserId = ref('')
const selectedRole = ref(TournamentRole.VIEWER) // Default role
const loading = ref(false)
const error = ref('')

const organizationUsers = ref<any[]>([]) // Users from the organization

const userOptions = computed(() => {
  const options = organizationUsers.value
    .filter(user => !props.existingParticipants.some(p => p.user_id === user.id)) // Filter out already added users
    .map(user => ({
      label: `${user.name} (${user.email})`,
      value: user.id
    }))
  return [{ label: 'Seleziona un utente...', value: '' }, ...options]
})

const roleOptions = [
  { label: 'Visualizzatore', value: TournamentRole.VIEWER },
  { label: 'Editor', value: TournamentRole.EDITOR },
  { label: 'Amministratore', value: TournamentRole.ADMIN },
  { label: 'Proprietario', value: TournamentRole.OWNER }
]

const fetchOrganizationUsers = async () => {
  if (!authStore.user?.orgId) {
    error.value = 'ID organizzazione non disponibile.'
    return
  }
  try {
    // Assuming tournamentStore has an action to fetch organization users
    organizationUsers.value = await tournamentStore.getOrganizationUsers(authStore.user.orgId)
  } catch (e: any) {
    error.value = e.message || 'Errore nel recupero degli utenti dell\'organizzazione.'
    toast.error(error.value)
  }
}

const handleAddUser = async () => {
  if (!selectedUserId.value || !selectedRole.value) {
    error.value = 'Seleziona un utente e un ruolo.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await tournamentStore.addParticipantToTournament(props.tournamentId, {
      user_id: selectedUserId.value,
      role: selectedRole.value
    })
    toast.success('Utente aggiunto al torneo con successo!')
    emit('updated') // Notify parent to refresh tournament details
    closeModal()
  } catch (e: any) {
    error.value = e.message || 'Errore durante l\'aggiunta dell\'utente.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  selectedUserId.value = ''
  selectedRole.value = TournamentRole.VIEWER
  error.value = ''
  loading.value = false
  emit('close')
}

// Fetch users when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchOrganizationUsers()
  }
})

onMounted(() => {
  // Initial fetch if modal is open on mount (e.g., page refresh)
  if (props.isOpen) {
    fetchOrganizationUsers()
  }
})
</script>
