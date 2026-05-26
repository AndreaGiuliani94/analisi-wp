// stores/useSettingsStore.ts
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    periodDuration: 480000,
    totalPeriods: 4,
    maxPlayers: 15,
    enableFouls: true,
    enableShots: true,
    enableAwayPlayersTime: false,
    enableHomePlayersTime: true,
    allowFinalPenalties: false,
  }),
  actions: {
    updateSettings(newSettings: Partial<SettingsState>) {
      Object.assign(this, newSettings)
    },
  }
})

export interface SettingsState {
  periodDuration: number
  totalPeriods: number
  maxPlayers: number
  enableFouls: boolean
  enableShots: boolean
  enableAwayPlayersTime: boolean
  enableHomePlayersTime: boolean
  allowFinalPenalties: boolean
}

export type SettingsStore = ReturnType<typeof useSettingsStore>
