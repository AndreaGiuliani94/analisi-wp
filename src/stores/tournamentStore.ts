import { defineStore } from 'pinia'
import { useTimeFormat } from '@/composables/useTimeFormat'
import { createNewTournament, deleteTournament, getAllTournaments, getTournamentById, updateTournament as updateTournamentService, getOrganizationUsers as getOrganizationUsersService, addParticipantToTournament as addParticipantToTournamentService } from '@/services/tournamentService'
import type { TournamentRole } from '@/enum/RoleType'

export const useTournamentStore = defineStore('tournament', {
    state: () => {
        return {
            tournaments: [] as any[],
            userRole: null as TournamentRole | null
        }
    },
    actions: {
        
        async getAllTournaments(): Promise<any[]> {
            const data = await getAllTournaments()
            this.tournaments = data
            return data
        },

        async createNewTournament(payload: any) {
            const { formatTimerToMs } = useTimeFormat()

            // Trasformiamo la durata da mm:ss in millisecondi prima dell'invio
            const formattedPayload = {
                ...payload,
                default_period_length: formatTimerToMs(payload.default_period_length)
            }

            const result = await createNewTournament(formattedPayload)
            await this.getAllTournaments() // Opzionale: ricarica la lista dopo la creazione
            return result
        },

        async deleteTournament(tournamentId: string) {
            return deleteTournament(tournamentId)
        },

        async getTournamentById(tournamentId: string) {
            return getTournamentById(tournamentId)
        },

        async getOrganizationUsers(organizationId: string) {
            return getOrganizationUsersService(organizationId)
        },

        async addParticipantToTournament(tournamentId: string, payload: { user_id: string; role: string }) {
            return addParticipantToTournamentService(tournamentId, payload)
        },

        async updateTournament(tournamentId: string, payload: any) {
            const result = await updateTournamentService(tournamentId, payload)
            return result
        }
        
    },
})
