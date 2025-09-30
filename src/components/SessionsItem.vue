<template>
  <div class="w-full">
    <div v-if="sessionStore.sessions?.length > 0" class="mb-2 text-lg">Partite aperte:
      <div v-for="(session, index) in sessionStore.sessions" class="text-sm bg-gray-200 px-2 py-1.5 my-1 flex justify-between items-center gap-2 rounded">
        <RouterLink :to="`/session/${session.session_id}`" 
          class="text-blue-600 hover:underline active:underline flex-1 truncate"
          :class="{'font-bold text-base': session.session_id == (sessionStore.currentSession.session_id || sessionIdLS)}">
          {{ session.sessions.title }}
        </RouterLink>
        
        <div class="flex gap-2">
          <RoleBadge :role="session.role" />
        

          <div class="flex gap-2">
            <NavButton 
              :icon="MagnifyingGlassIcon"
              :to="`/session/${session.session_id}`"
            />
    
            <NavButton 
              :to="`/session/join/${session.session_id}`" 
              :icon="ArrowRightIcon" 
              color="green"
            />
    
            <NavButton 
              :icon="TrashIcon"
              @click="openConfirmDelete(session)"
              color="red"
            />

          </div>
        </div>

      </div>
    </div>
    <ActionButton @click="openModal" :disabled="loading" color="blue" label="Crea una nuova partita">
    </ActionButton>

    <NewSessionModal :isOpen="showCreateSessionModal" @close="closeModal"/>
    <ConfirmModal :isOpen="showRemoveConfirmModal" title="Conferma Rimozione"
        :message=confirmRemoveMessage
        @confirm="removeSession(sessionToRemove)" @close="showRemoveConfirmModal = false" />
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue'
import type { Session } from '@/components/Interfaces/Session/Session'
import { useSessionStore } from '@/stores/sessionStore'
import { onMounted, ref } from 'vue'
import RoleBadge from './RoleBadge.vue'
import NewSessionModal from './modals/NewSessionModal.vue'
import NavButton from './buttons/NavButton.vue'
import { ArrowRightIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/vue/24/solid'
import ConfirmModal from './modals/ConfirmModal.vue'
import { deleteSession } from '@/services/sessionService'

const showCreateSessionModal = ref(false);
const showRemoveConfirmModal = ref(false);
const confirmRemoveMessage = ref('');
const sessionToRemove = ref<Session | null>(null);
const sessionIdLS = localStorage.getItem("session_id");

const loading = ref(false)
const sessionStore = useSessionStore()

const openModal = async () => {
  loading.value = true
  showCreateSessionModal.value = true
}

const closeModal = async () => {
  showCreateSessionModal.value = false
  loading.value = false
  sessionStore.getAllSessions()
}

const openConfirmDelete = async (session: Session) => {
  confirmRemoveMessage.value = 'Stai per rimuovere tutti i dati realtivi alla partita ' + session.sessions.title + '. Sicuro di voler procedere?'
  sessionToRemove.value = session;
  showRemoveConfirmModal.value = true;
}

const removeSession = async (sessionToRemove: Session | null) => {
  loading.value = true
  if(sessionToRemove){
    const res = await deleteSession(sessionToRemove.session_id);
  } else {
    alert('Errore, sessione non selezionata...')
  }
  showRemoveConfirmModal.value = false
  loading.value = false
  sessionStore.getAllSessions()
}

onMounted(async () => {
  sessionStore.getAllSessions()
})

</script>
