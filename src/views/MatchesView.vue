<template>
  <div class="bg-slate-50">
    <!-- Header Sezione -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-6">
    <div>
        <h1 class="text-3xl font-black text-blue-950 tracking-tight">Le Mie Partite</h1>
        <p class="text-slate-500 font-medium mt-1">Gestione delle sessioni di analisi e match live</p>
    </div>
    <div class="flex gap-3">
        <ActionButton 
        label="Nuova Partita" 
        :icon="PlusIcon" 
        color="green" 
        @click="showCreateModal = true"
        />
        <ActionButton 
        label="Unisciti" 
        :icon="UserGroupIcon" 
        color="blue" 
        @click="showJoinModal = true"
        />
    </div>
    </div>

    <!-- Grid Card -->
    <div v-if="sessionStore.sessions?.length > 0" class="grid grid-cols-1 gap-4">
        <div v-for="session in sessionStore.sessions" :key="session.session_id" 
                class="group relative bg-white rounded-lg border border-slate-200 px-4 py-2 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all duration-300 flex flex-col">
            
            <!-- Header Card -->
            <div class="flex justify-between items-start mb-2">
                <div class="flex flex-col overflow-hidden">
                    <h3 class="font-bold text-blue-950 truncate pr-2" :title="session.session.title">
                        {{ session.session.title }}
                    </h3>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ formatDateTime(session.session.match.scheduled_at) }}</span>
                </div>
                <RoleBadge :role="session.role" />
            </div>

            <!-- Matchup Central -->
            <div class="flex-1 flex flex-col justify-center">
                <div v-if="session.session.match" class="bg-slate-50 rounded-3xl w-full py-2 border border-slate-100 grid grid-cols-3 items-center mb-2">
                    <!-- Colonna 1: Badge allineato a sinistra -->
                    <div class="flex justify-start pl-4">
                        <MatchStatusBadge :status="session.session.match.status" :isLive="session.session.match.is_public_live" :size="'sm'" />
                    </div>

                    <!-- Colonna 2: Matchup centrato -->
                    <div class="flex items-center justify-center gap-3">
                        <p class="flex-1 text-right font-black text-blue-950 text-sm uppercase truncate">
                            {{ session.session.match.home_team?.club_name || '-' }}
                        </p>

                        <div class="shrink-0 size-8 bg-white rounded-full flex items-center justify-center text-[9px] font-black text-slate-300 border border-slate-200 group-hover:bg-blue-950 group-hover:text-white group-hover:border-blue-950 transition-colors duration-300 shadow-sm">
                            VS
                        </div>

                        <p class="flex-1 text-left font-black text-blue-950 text-sm uppercase truncate">
                            {{ session.session.match.away_team?.club_name || '-' }}
                        </p>
                    </div>
                    
                    <!-- Colonna 3: Vuota per bilanciare la grid e mantenere il centro -->
                    <div />
                </div>

                <div v-else class="py-10 flex flex-col items-center justify-center text-slate-300 gap-2 mb-2">
                    <VideoCameraSlashIcon class="size-8 opacity-20" />
                    <span class="text-[10px] font-black uppercase tracking-widest">Nessun Match</span>
                </div>

            </div>

            <!-- Footer Actions -->
            <div class=" w-full justify-end flex items-center gap-4">
                
                <NavButton 
                    class=""
                    :icon="MagnifyingGlassIcon"
                    :to="`/workspace/session/${session.session_id}`"
                    title="Vedi Dettagli"
                    label="Dettagli"
                />
                <NavButton 
                    class=""
                    :to="`/match/${session.session_id}`" 
                    :icon="ArrowRightIcon" 
                    color="green"
                    title="Live Match"
                    label="Live"
                />
                <NavButton 
                    class="shrink-0"
                    :icon="TrashIcon"
                    @click="openConfirmDelete(session)"
                    color="red"
                    title="Elimina"
                    label="Elimina"
                />
                
            </div>
        </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center">
    <div class="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CalendarDaysIcon class="size-12 text-slate-200" />
    </div>
    <h2 class="text-2xl font-black text-blue-950 uppercase tracking-tight">Nessuna partita</h2>
    <p class="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Non hai ancora partecipato a nessuna sessione. Crea la tua prima partita per iniziare!</p>
    </div>

    <!-- Modals -->
    <ConfirmModal 
      :isOpen="showRemoveConfirmModal" 
      title="Conferma Rimozione"
      :message="confirmRemoveMessage"
      @confirm="removeSession" 
      @close="showRemoveConfirmModal = false" 
    />
    <NewSessionModal :isOpen="showCreateModal" @close="showCreateModal = false" />
    <JoinSessionModal :isOpen="showJoinModal" @close="showJoinModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import ActionButton from '@/components/buttons/ActionButton.vue'
import NavButton from '@/components/buttons/NavButton.vue'
import RoleBadge from '@/components/badges/RoleBadge.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import NewSessionModal from '@/components/modals/NewSessionModal.vue'
import JoinSessionModal from '@/components/modals/JoinSessionModal.vue'
import { PlusIcon, UserGroupIcon, MagnifyingGlassIcon, ArrowRightIcon, TrashIcon, CalendarDaysIcon, VideoCameraSlashIcon } from '@heroicons/vue/24/outline'
import { deleteSession } from '@/services/sessionService'
import type { Session } from '@/interfaces/session/Session'
import { formatDateTime } from '@/utils/utils'
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue'

const sessionStore = useSessionStore()
const showRemoveConfirmModal = ref(false)
const confirmRemoveMessage = ref('')
const sessionToRemove = ref<Session | null>(null)
const showCreateModal = ref(false)
const showJoinModal = ref(false)

const openConfirmDelete = (session: Session) => {
  confirmRemoveMessage.value = `Stai per rimuovere definitivamente la sessione "${session.session.title}". Questa azione è irreversibile.`
  sessionToRemove.value = session
  showRemoveConfirmModal.value = true
}

const removeSession = async () => {
  if (sessionToRemove.value) {
    await deleteSession(sessionToRemove.value.session_id)
    await sessionStore.getAllSessions()
  }
  showRemoveConfirmModal.value = false
}

onMounted(() => {
  sessionStore.getAllSessions()
})
</script>
