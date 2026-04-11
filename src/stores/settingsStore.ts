// stores/useSettingsStore.ts
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    homeTeamName: 'SC QUINTO - U18',
    periodDuration: 8,
    totalPeriods: 4,
    maxPlayers: 15,
    enableExclution: true,
    enableShoot: true,
    enableOppPlayersTime: false,
    enableHomePlayersTime: true,
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
  enableOppPlayersTime: boolean
  enableHomePlayersTime: boolean
}

export type SettingsStore = ReturnType<typeof useSettingsStore>
