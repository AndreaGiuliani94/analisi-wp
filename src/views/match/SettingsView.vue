<template>
  <div class="p-6 max-w-5xl mx-auto text-blue-950">
    <div class="flex items-center gap-3 mb-8">
      <h1 class="text-3xl font-black tracking-tight uppercase">⚙️ Impostazioni Partita</h1>
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton v-model="store.enableFouls" label="Abilita gestione espulsioni" />
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton v-model="store.enableShots" label="Abilita gestione tiri" />
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton v-model="store.enableHomePlayersTime" label="Tempo effettivo Giocatori (Casa)" />
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <SwitchButton v-model="store.enableAwayPlayersTime" label="Tempo effettivo Giocatori (Ospiti)" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue'
import SwitchButton from '@/components/buttons/SwitchButton.vue'
import { useTimeFormat } from '@/composables/useTimeFormat'
import { useSettingsStore } from '@/stores/settingsStore'
import { computed, reactive } from 'vue'

const store = useSettingsStore()
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

// const form = reactive({
//   homeTeamName: store.homeTeamName,
//   periodDuration: store.periodDuration,
//   totalPeriods: store.totalPeriods,
//   maxPlayers: store.maxPlayers,
//   enableExclution: store.enableExclution,
//   enableShoot: store.enableShoot,
//   enableOppPlayersTime: store.enableOppPlayersTime,
//   enableHomePlayersTime: store.enableHomePlayersTime,
// })

// function save() {
//   store.updateSettings({ ...form })
//   alert('Impostazioni salvate!')
// }
</script>
