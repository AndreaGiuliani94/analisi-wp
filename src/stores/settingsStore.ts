// stores/useSettingsStore.ts
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    homeTeamName: 'SC QUINTO',
    periodDuration: 8,
    totalPeriods: 4,
    maxPlayers: 15,
    enableExclution: true,
    enableShoot: true,
    enableOppTime: false,
  }),
  actions: {
    updateSettings(newSettings: Partial<SettingsState>) {
      Object.assign(this, newSettings)
    },
  }
})

export interface SettingsState {
  homeTeamName: string
  periodDuration: number
  totalPeriods: number
  maxPlayers: number
  enableExclution: boolean
  enableShoot: boolean
  enableOppTime: boolean
}

export type SettingsStore = ReturnType<typeof useSettingsStore>
