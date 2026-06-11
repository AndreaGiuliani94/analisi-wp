<template>
  <div class="p-6 max-w-5xl mx-auto text-blue-950">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-black tracking-tight flex items-center gap-5 uppercase">
        <Cog6ToothIcon class="size-10"/> Impostazioni Partita
      </h1>

      <ActionButton
        v-if="canEditMatch(userRole)"
        @click="saveSettings"
        :disabled="!hasChanges"
        :color="'blue'"
        :size="'md'"
        :icon="CloudArrowUpIcon"
        :label="'Salva Modifiche'"
        />
    </div>

    <div class="space-y-10">
      <!-- Sezione Torneo (Dati ereditati - Sola Lettura) -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <div class="h-4 w-1 bg-blue-600 rounded-full"></div>
          <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configurazione Torneo</h2>
        </div>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Durata Periodo</p>
            <p class="text-xl font-bold text-blue-950">{{ formattedPeriodDuration }}</p>
          </div>
          <div>
            <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Numero Periodi</p>
            <p class="text-xl font-bold text-blue-950">{{ store.totalPeriods }}</p>
          </div>
          <div>
            <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Max Giocatori</p>
            <p class="text-xl font-bold text-blue-950">{{ store.maxPlayers }}</p>
          </div>
          <div>
            <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Rigori Finali</p>
            <p class="text-xl font-bold text-blue-950">{{ store.allowFinalPenalties ? 'Abilitati' : 'Disabilitati' }}</p>
          </div>
        </div>
      </section>

      <!-- Sezione Match (Configurazione Editabile) -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <div class="h-4 w-1 bg-blue-600 rounded-full"></div>
          <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configurazione Match</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton 
              v-model="store.enableTimekeeping" 
              label="Abilita tempo di gioco" 
              :disabled="!canEditMatch(userRole)" />
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton 
              v-model="store.enableSubstitutions" 
              label="Abilita sostituzioni" 
              :disabled="!canEditMatch(userRole)" />
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton 
              v-model="store.enableFouls" 
              label="Abilita espulsioni" 
              :disabled="!canEditMatch(userRole)" />
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton 
              v-model="store.enableShots" 
              label="Abilita tiri" 
              :disabled="!canEditMatch(userRole)" />
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton 
              v-model="store.enableHomePlayersTime" 
              label="Tempo effettivo giocatori (Casa)" 
              :disabled="!canEditMatch(userRole)" />
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton 
              v-model="store.enableAwayPlayersTime" 
              label="Tempo effettivo giocatori (Ospiti)" 
              :disabled="!canEditMatch(userRole)" />
          </div>
        </div>
      </section>
    </div>

    <ConfirmModal
      :is-open="showExitModal"
      title="Modifiche non salvate"
      message="Hai delle modifiche non salvate. Vuoi davvero abbandonare la pagina?"
      button-color="red"
      @confirm="handleConfirmExit"
      @close="showExitModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import SwitchButton from '@/components/buttons/SwitchButton.vue'
import { useTimeFormat } from '@/composables/useTimeFormat'
import { usePermissions } from '@/composables/usePermissions'
import { useMatchStateStore } from '@/stores/matchStateStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { Cog6ToothIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline'
import { computed, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import ActionButton from '@/components/buttons/ActionButton.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const store = useSettingsStore()
const matchStateStore = useMatchStateStore()
const router = useRouter()
const toast = useToast()
const { canEditMatch } = usePermissions()

const userRole = computed(() => matchStateStore.userRole)
const { formatMsToTimer } = useTimeFormat()

/**
 * Formatta la durata del periodo (in ms) nel formato mm:ss
 */
const formattedPeriodDuration = computed(() => {
  if (store.periodDuration) {
    return formatMsToTimer(store.periodDuration)
  }
  return '00:00'
})

/**
 * Stato iniziale per il confronto delle modifiche
 */
const initialSettings = reactive({
  enableFouls: store.enableFouls,
  enableShots: store.enableShots,
  enableHomePlayersTime: store.enableHomePlayersTime,
  enableAwayPlayersTime: store.enableAwayPlayersTime,
  enableTimekeeping: store.enableTimekeeping,
  enableSubstitutions: store.enableSubstitutions,
})

/**
 * Verifica se ci sono modifiche rispetto allo stato iniziale
 */
const hasChanges = computed(() => {
  return (
    store.enableFouls !== initialSettings.enableFouls ||
    store.enableShots !== initialSettings.enableShots ||
    store.enableHomePlayersTime !== initialSettings.enableHomePlayersTime ||
    store.enableAwayPlayersTime !== initialSettings.enableAwayPlayersTime ||
    store.enableTimekeeping !== initialSettings.enableTimekeeping ||
    store.enableSubstitutions !== initialSettings.enableSubstitutions
  )
})

const showExitModal = ref(false)
const isConfirmedLeaving = ref(false)
const pendingRoute = ref<string | null>(null)

/**
 * Navigation Guard: avvisa l'utente se prova a uscire con modifiche non salvate
 */
onBeforeRouteLeave((to, from, next) => {
  if (hasChanges.value && !isConfirmedLeaving.value) {
    pendingRoute.value = to.fullPath
    showExitModal.value = true
    next(false) // Blocca la navigazione iniziale
  } else {
    next()
  }
})

/**
 * Gestisce la conferma dell'uscita dalla pagina
 */
const handleConfirmExit = () => {
  isConfirmedLeaving.value = true
  showExitModal.value = false
  if (pendingRoute.value) {
    router.push(pendingRoute.value)
  }
}

/**
 * Salva le impostazioni sul backend
 */
const saveSettings = async () => {
  try {
    await matchStateStore.updateMatchSettings()
    // Aggiorna lo stato iniziale dopo il salvataggio per disabilitare il tasto
    Object.assign(initialSettings, {
      enableFouls: store.enableFouls,
      enableShots: store.enableShots,
      enableHomePlayersTime: store.enableHomePlayersTime,
      enableAwayPlayersTime: store.enableAwayPlayersTime,
      enableTimekeeping: store.enableTimekeeping,
      enableSubstitutions: store.enableSubstitutions,
    })
    toast.success('Impostazioni salvate con successo!')
  } catch (error: any) {
    toast.error(error.message || 'Errore durante il salvataggio')
  }
}
</script>
