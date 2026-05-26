import { defineStore } from 'pinia'
import { useGameStore } from './gameStore'
import { mapPlayerToFE, padRosterToMax } from '@/utils/utils'
import type { MatchState } from '@/interfaces/MatchState'
import { useSettingsStore } from './settingsStore'
import type { Team } from '@/interfaces/Team';
import type { Player } from '@/interfaces/Player';
import { MatchEventType } from '@/enum/MatchEventDescription';
import { ShotCategory, ShotOutcome } from '@/enum/ShotDescription';
import { convertDbEventToUI } from '@/utils/converter';
import { useTimerStore } from './timerStore'
import type { MatchPeriod } from '@/enum/MatchPeriod'
import { matchPeriodToNumber } from '@/const/consts'
import type { MatchStatus } from '@/enum/MatchStatus'
import { getLiveEvents, getLiveMatchDetails } from '@/services/publicService'
import { getMatchDetails, getMatchSettings, joinMatch } from '@/services/matchService'
import { getEvents } from '@/services/eventService'
import type { MatchRole } from '@/enum/RoleType'

const myClientId = crypto.randomUUID();

export const useMatchStateStore = defineStore('matchState', {
    state: (): MatchState => {
        const savedMatchId = localStorage.getItem("match_id");
        return {
            matchId: savedMatchId ? savedMatchId : '',
            participants: [],
            channel: null,
            title: '',
            clientId: myClientId,
            userRole: null as MatchRole | null
        }
    },

    actions: {
        
        async joinMatch(matchId: string) {
            const res = await joinMatch(matchId);
            if (!res.ok) {
                throw new Error('Errore durante l’unione alla partita.')
            }
            this.matchId = matchId;
            localStorage.setItem("match_id", matchId);

            await this.getMatchDetails();
            await this.getMatchSettings();
            await this.getEvents();

            const data ={
                user_role: 'owner'
            }// TODO: Sostituire con il ruolo reale recuperato dal BE
            localStorage.setItem("user_role", data.user_role);
            useTimerStore().setTimerMaster(data);
        },

        async getMatchDetails() {
            try {
                // 1. Chiamata al BE per recuperare la partita
                const res = await getMatchDetails(this.matchId);
                const dbMatch = await res.json();
                
                this._processMatchDetails(dbMatch, false);

                console.log("Match caricato e idratato con successo!");

            } catch (error) {
                console.error("Errore durante il recupero dei dettagli del match:", error);
                // Qui puoi gestire un toast di errore
            }
            
        },

        async getMatchSettings() {
            try {
                const res = await getMatchSettings(this.matchId);
                const dbMatch = await res.json();
                const settingsStore = useSettingsStore();
                settingsStore.updateSettings({
                    periodDuration: dbMatch.default_period_length,
                    totalPeriods: dbMatch.default_periods_count,
                    enableFouls: dbMatch.enable_fouls,
                    enableShots: dbMatch.enable_shots,
                    enableAwayPlayersTime: dbMatch.enable_away_players_timer,
                    enableHomePlayersTime: dbMatch.enable_home_players_timer,
                    maxPlayers: dbMatch.max_players,
                    allowFinalPenalties: dbMatch.allow_final_penalties
                });
            } catch (error) {
                console.error("Errore durante il recupero delle impostazioni del match:", error);
            }
        },

        async getEvents() {
            try {
                const res = await getEvents(this.matchId);
                const data = await res.json();
                this._processEvents(data, false);
            } catch (error) {
                console.error("Errore durante l'idratazione degli eventi:", error);
            }
        },

        async joinPublicMatch(matchId: string) {
            this.matchId = matchId;
            localStorage.setItem("match_id", matchId);
            
            await this.getLiveMatchDetails();
            await this.getLiveEvents();
        },

        async getLiveMatchDetails() {
            try {
                // 1. Chiamata al BE per recuperare la partita
                const res = await getLiveMatchDetails(this.matchId);
                const dbMatch = await res.json();
                
                this._processMatchDetails(dbMatch, true);

                console.log("Match caricato e idratato con successo!");

            } catch (error) {
                console.error("Errore durante il recupero dei dettagli del match:", error);
                // Qui puoi gestire un toast di errore
            }
            
        },

        async getLiveEvents() {
            try {
                const res = await getLiveEvents(this.matchId);
                const data = await res.json();
                this._processEvents(data, true); // Pass true for public match
            } catch (error) {
                console.error("Errore durante l'idratazione degli eventi:", error);
            }
        },

        /**
         * Helper interno per processare i dettagli del match recuperati dal backend.
         * Popola gameStore.match e le proprietà del timerStore.
         * @param dbMatch I dati del match grezzi dal backend.
         * @param isPublic Indica se la partita è pubblica (per future differenziazioni).
         */
        _processMatchDetails(dbMatch: any, isPublic: boolean) {
            const settings = useSettingsStore();
            const gameStore = useGameStore();
            const timerStore = useTimerStore();

            timerStore.currentPeriod = matchPeriodToNumber[dbMatch.current_period as MatchPeriod]
            timerStore.countdown = dbMatch.current_time
            timerStore.isTimerRunning = dbMatch.is_timer_running
            this.userRole = dbMatch.user_role as MatchRole;

            const mappedHomePlayers = dbMatch.home_players.map(mapPlayerToFE);
            const mappedAwayPlayers = dbMatch.away_players.map(mapPlayerToFE);
            
            gameStore.match = {
                id: this.matchId,
                isLive: dbMatch.is_public_live,
                status: dbMatch.status as MatchStatus,
                homeTeam: {
                    name: (dbMatch.home_team) ? dbMatch.home_team.club_name : '',
                    id: (dbMatch.home_team) ? dbMatch.home_team.id : (dbMatch.home_team_id ? dbMatch.home_team_id : ''),
                    category: (dbMatch.home_team) ? dbMatch.home_team.category : '',
                    activatedTimer: settings.enableHomePlayersTime,
                    score: 0,
                    timeOut1: dbMatch.home_timeouts == 1,
                    timeOut2: dbMatch.home_timeouts == 2,
                    players: padRosterToMax(
                        mappedHomePlayers, 
                        settings.maxPlayers, 
                        settings.enableHomePlayersTime
                    )
                },
                awayTeam: {
                    name: (dbMatch.away_team) ? dbMatch.away_team.club_name : '',
                    id: (dbMatch.away_team) ? dbMatch.away_team.id : (dbMatch.away_team_id ? dbMatch.away_team_id : ''),
                    category: (dbMatch.away_team) ? dbMatch.away_team.category : '',
                    activatedTimer: settings.enableAwayPlayersTime,
                    score: 0,
                    timeOut1: dbMatch.away_timeouts == 1,
                    timeOut2: dbMatch.away_timeouts == 2,
                    players: padRosterToMax(
                        mappedAwayPlayers, 
                        settings.maxPlayers, 
                        settings.enableAwayPlayersTime
                    )
                }
            };
            console.log("Match caricato e idratato con successo!");
        },

        /**
         * Helper interno per processare gli eventi recuperati dal backend.
         * Popola gameStore.events e calcola i punteggi progressivi.
         * @param eventsData L'array di eventi grezzi dal backend.
         * @param isPublic Indica se la partita è pubblica (per future differenziazioni).
         */
        _processEvents(eventsData: any, isPublic: boolean) {
            const gameStore = useGameStore();

            gameStore.match.homeTeam.score = 0;
            gameStore.match.awayTeam.score = 0;
            gameStore.events = [];

            const clearTeamStats = (team: Team, isHome: boolean) => {
                team.players.forEach((p: Player) => {
                    p.active = p.active ? p.active : !isHome;
                });
            };
            clearTeamStats(gameStore.match.homeTeam, true);
            clearTeamStats(gameStore.match.awayTeam, false);
            
            const sortedEvents = eventsData.sort((a: { quarter: number; time: number }, b: { quarter: number; time: number }) => {
                if (a.quarter !== b.quarter) return a.quarter - b.quarter;
                return b.time - a.time; 
            });

            let currentHomeScore = 0;
            let currentAwayScore = 0;

            for (const beEvent of sortedEvents) {
                let isHome = true;
                let player = gameStore.match.homeTeam.players.find((p: any) => p.id === beEvent.player_id);
                
                if (!player) {
                    player = gameStore.match.awayTeam.players.find((p: any) => p.id === beEvent.player_id);
                    isHome = false;
                }

                if (!player) {
                    console.warn(`Giocatore ID ${beEvent.player_id} non trovato nel Match! Salto l'evento.`);
                    continue;
                }

                if (beEvent.event_category === MatchEventType.SHOT && beEvent.shot_outcome === ShotOutcome.GOAL) {
                    if (isHome) currentHomeScore++;
                    else currentAwayScore++;
                }

                const currentMatchData = { homeScore: currentHomeScore, awayScore: currentAwayScore };
                const uiEvent = convertDbEventToUI(beEvent, currentMatchData, gameStore.match);
                
                if (uiEvent) {
                    gameStore.events.push(uiEvent);
                }
            }

            gameStore.match.homeTeam.score = currentHomeScore;
            gameStore.match.awayTeam.score = currentAwayScore;

            console.log("Idratazione Iniziale Eventi completata con successo!");
        },
    }
})
