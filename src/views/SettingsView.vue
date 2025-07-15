<template>
  <div class="p-6 max-w-full mx-auto text-blue-950">
    <h1 class="text-2xl font-bold  mb-6">⚙️ Impostazioni partita</h1>

    <form @submit.prevent="save" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome squadra di casa</label>
          <input v-model="form.homeTeamName" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Durata di un tempo (min)</label>
          <input v-model.number="form.periodDuration" type="number" min="1" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Numero di tempi</label>
          <input v-model.number="form.totalPeriods" type="number" min="1" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Numero massimo giocatori</label>
          <input v-model.number="form.maxPlayers" type="number" min="1" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div>
          <SwitchButton v-model="form.enableExclution" label="Abilita espulsioni"></SwitchButton>
        </div>

        <div>
          <SwitchButton v-model="form.enableShoot" label="Abilita tiri"></SwitchButton>
        </div>

        <div>
          <SwitchButton v-model="form.enableOppTime" label="Abilita tempo avversari"></SwitchButton>
        </div>
      </div>

      <ActionButton label="Salva" type="submit" color="green" position="left"/>
 
    </form>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue'
import SwitchButton from '@/components/buttons/SwitchButton.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { reactive } from 'vue'

const store = useSettingsStore()

const form = reactive({
  homeTeamName: store.homeTeamName,
  periodDuration: store.periodDuration,
  totalPeriods: store.totalPeriods,
  maxPlayers: store.maxPlayers,
  enableExclution: store.enableExclution,
  enableShoot: store.enableShoot,
  enableOppTime: store.enableOppTime,
})

function save() {
  store.updateSettings({ ...form })
  alert('Impostazioni salvate!')
}
</script>
