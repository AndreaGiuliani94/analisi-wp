<template>
  <div class="">
    <!-- Header di Benvenuto & Quick Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-blue-950 tracking-tight">
          Bentornato, <span class="text-blue-600">{{ user?.name || 'Coach' }}</span>!
        </h1>
        <p class="text-gray-500 mt-1">Gestisci le tue partite e analizza le performance della squadra.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <ActionButton 
          @click="openCreateModal" 
          :disabled="loading" 
          color="green" 
          label="Nuova partita"
          :icon="PlusIcon"
        />
      
        <ActionButton 
          @click="openJoinModal" 
          :disabled="loading" 
          color="blue" 
          label="Unisciti a un partita"
          :icon="UserGroupIcon"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Colonna Principale: Ultime Sessioni -->
      <div class="lg:col-span-2 space-y-6">
        <section class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-blue-950 flex items-center gap-2">
              <ClockIcon class="size-5 text-blue-600" />
              Ultime Sessioni
            </h2>
            <router-link to="/workspace/sessions" class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Vedi tutte
            </router-link>
          </div>

          <div class="divide-y divide-gray-100 p-4">
            <SessionsItem :limit="3" />

            <!-- Placeholder per SessionsItem - Se hai già il componente, usalo qui -->
            <!-- <div v-for="n in 3" :key="n" class="p-5 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 font-black border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    12-8
                  </div>
                  <div>
                    <h3 class="font-bold text-blue-950">Pro Recco vs AN Brescia</h3>
                    <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Campionato A1 • 12 Mag 2024</p>
                  </div>
                </div>
                <ChevronRightIcon class="size-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </div> -->
          </div>
        </section>
      </div>

      <!-- Colonna Laterale: Stats & Info -->
      <div class="space-y-6">
        <div class="bg-linear-to-br from-blue-900 to-blue-950 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <TrophyIcon class="absolute -right-4 -bottom-4 size-32 opacity-10 rotate-12" />
          <h3 class="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Statistiche Stagione</h3>
          <div class="grid grid-cols-2 gap-4 relative z-10">
            <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <p class="text-2xl font-black">24</p>
              <p class="text-[10px] font-bold uppercase opacity-80">Match Totali</p>
            </div>
            <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <p class="text-2xl font-black">78%</p>
              <p class="text-[10px] font-bold uppercase opacity-80">Vittorie</p>
            </div>
          </div>
        </div>

        <!-- <section class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-bold text-blue-950 mb-4 flex items-center gap-2">
            <InformationCircleIcon class="size-5 text-blue-500" />
            Suggerimento Tattico
          </h3>
          <p class="text-sm text-gray-500 leading-relaxed">
            Nelle ultime 3 partite, la percentuale di realizzazione in <strong>Superiorità Numerica</strong> è calata del 15%. Considera di rivedere gli schemi in allenamento.
          </p>
        </section> -->
      </div>

    </div>
  </div>

  <NewSessionModal :isOpen="showCreateSessionModal" @close="closeCreateModal"/>
  <JoinSessionModal :isOpen="showJoinSessionModal" @close="closeJoinModal"/>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { ref, computed, toRef } from 'vue';
import { PlusIcon, UserGroupIcon, ClockIcon, TrophyIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';
import ActionButton from '@/components/buttons/ActionButton.vue';
import SessionsItem from '@/components/SessionsItem.vue';
import NewSessionModal from '@/components/modals/NewSessionModal.vue';
import JoinSessionModal from '@/components/modals/JoinSessionModal.vue';
import { useSessionStore } from '@/stores/sessionStore';

const authStore = useAuthStore();
const user = toRef(authStore, 'user');

const sessionStore = useSessionStore()
const showCreateSessionModal = ref(false);
const showJoinSessionModal = ref(false);
const loading = ref(false)

const openCreateModal = async () => {
  loading.value = true
  showCreateSessionModal.value = true
}

const closeCreateModal = async () => {
  showCreateSessionModal.value = false
  loading.value = false
  sessionStore.getAllSessions()
}

const openJoinModal = async () => {
  loading.value = true
  showJoinSessionModal.value = true
}

const closeJoinModal = async () => {
  showJoinSessionModal.value = false
  loading.value = false
  sessionStore.getAllSessions()
}

</script>