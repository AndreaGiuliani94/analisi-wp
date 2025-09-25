<template>
  <div class="p-4">
    <div v-if="sessionStore.sessions?.length > 0" class="m-2 text-lg">Partite aperte:
      <div v-for="(session, index) in sessionStore.sessions" class="text-sm bg-gray-200 px-2 py-1 m-1 rounded">
        <RouterLink :to="`/session/${session.session_id}`" class="text-blue-600 hover:underline text-sm">
          {{ session.sessions.title }}
        </RouterLink>
        <RoleBadge :role="session.role" />
      </div>
    </div>
    <ActionButton @click="openModal" :disabled="loading" color="blue" label="Crea una nuova partita">
    </ActionButton>

    <NewSessionModal :isOpen="showModal" @close="closeModal"/>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue'
import { useSessionStore } from '@/stores/sessionStore'
import { onMounted, ref } from 'vue'
import RoleBadge from './RoleBadge.vue'
import NewSessionModal from './modals/NewSessionModal.vue'

const showModal = ref(false);

const loading = ref(false)
const sessionStore = useSessionStore()

const openModal = async () => {
  loading.value = true
  showModal.value = true
}

const closeModal = async () => {
  showModal.value = false
  loading.value = false
  sessionStore.getAllSessions()
}

onMounted(async () => {
  sessionStore.getAllSessions()
})

</script>
