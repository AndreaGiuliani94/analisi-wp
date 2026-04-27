<template>
  <div class="">
    
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-blue-950">Gestione Società</h1>
        <p class="mt-1 text-sm text-gray-500">
          Pannello di controllo Superadmin per gestire i tenant e gli abbonamenti.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <router-link 
          to="/workspace/backoffice/onboard" 
          class="inline-flex items-center gap-2 bg-blue-950 hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Aggiungi nuova società
        </router-link>
      </div>
    </div>

    <div class="space-y-12">
      <!-- Sezione Società -->
      <section>
        <h2 class="text-xl font-bold text-blue-950 mb-6 flex items-center gap-2">
          <BuildingOffice2Icon class="size-6 text-blue-600" />
          Società Registrate
        </h2>
        <div v-if="backofficeStore.organizations && backofficeStore.organizations.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div class="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BuildingOffice2Icon class="size-8" />
          </div>
          <h3 class="text-lg font-bold text-blue-950 mb-1">Nessuna Società</h3>
          <p class="text-gray-500 max-w-sm mx-auto mb-6">
            Al momento non hai ancora caricato la griglia dati. Usa il bottone in alto per registrare il tuo primo Tenant.
          </p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="org in backofficeStore.organizations" 
            :key="org.id" 
            class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer"
            @click="router.push(`/workspace/backoffice/organization/${org.id}`)"
          >
            <div class="w-12 h-12 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
              <img 
                v-if="org.logo_url && !imageLoadError"
                :src="org.logo_url" 
                :alt="org.name" 
                @error="imageLoadError = true" 
                class="w-full h-full object-contain" />
              <BuildingOffice2Icon v-else class="size-6" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-blue-950 truncate text-lg">{{ org.name }}</h3>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest mt-1">
                Società
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Sezione Utenti -->
      <section>
        <h2 class="text-xl font-bold text-blue-950 mb-6 flex items-center gap-2">
          <UserIcon class="size-6 text-blue-600" />
          Utenti Registrati
        </h2>
        
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="max-h-100 overflow-y-auto p-4 custom-scrollbar">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div v-for="user in backofficeStore.users" :key="user.id" class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-white hover:border-blue-200 transition-colors group">
                <div class="w-10 h-10 bg-white text-blue-900 rounded-full flex items-center justify-center shrink-0 border border-slate-200 transition-colors">
                  <user-icon class="size-5" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-blue-950 truncate">{{ user.name || 'Utente senza nome' }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useBackofficeStore } from '@/stores/backofficeStore';
import { BuildingOffice2Icon, UserIcon } from '@heroicons/vue/24/outline';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const backofficeStore = useBackofficeStore()
const router = useRouter()

const imageLoadError = ref(false);

onMounted(async () => {
    await backofficeStore.getAdminDshboard();
})
</script>