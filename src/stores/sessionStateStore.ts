import { defineStore } from 'pinia'
import { useGameStore } from './gameStore'
import { getEvents, getMatchDetails, getMatchIdBySessionId } from '@/services/sessionService'
import { useSessionStore } from './sessionStore'
import { mapPlayerToFE, padRosterToMax } from '@/utils/utils'
import type { SessionState } from '@/interfaces/session/SessionState'
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
import { getLiveEvents, getLiveMatchDetails, getLiveMatchIdBySessionId } from '@/services/publicService'

const myClientId = crypto.randomUUID();

export const useSessionStateStore = defineStore('sessionState', {
    state: (): SessionState => {
        const savedSessionId = localStorage.getItem("session_id");
        const savedMatchId = localStorage.getItem("match_id");
        return {
            sessionId: savedSessionId ? savedSessionId : '',
            matchId: savedMatchId ? savedMatchId : '',
            channel: null,
            title: '',
            clientId: myClientId,
        }
    },

    actions: {
        
        async joinSession(sessionId: string) {
            this.sessionId = sessionId
            localStorage.setItem("session_id", sessionId);
            
            await this.getMatchIdBySessionId();
            await this.getMatchDetails();
            await this.getEvents();

            const sessionStore = useSessionStore()
            const data = await sessionStore.joinSession(sessionId);
            localStorage.setItem("user_role", data.user_role);
            useTimerStore().setTimerMaster(data);
        },

        async getMatchIdBySessionId() {
            const res = await getMatchIdBySessionId(this.sessionId);
            const data = await res.json()

            this.matchId = data.match_id
            localStorage.setItem("match_id", this.matchId);
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

        async getEvents() {
            try {
                const res = await getEvents(this.matchId);
                const data = await res.json();
                this._processEvents(data, false);
            } catch (error) {
                console.error("Errore durante l'idratazione degli eventi:", error);
            }
        },

        async joinPublicSession(sessionId: string) {
            this.sessionId = sessionId
            localStorage.setItem("session_id", sessionId);
            
            await this.getLiveMatchIdBySessionId();
            await this.getLiveMatchDetails();
            await this.getLiveEvents();
        },

        async getLiveMatchIdBySessionId() {
            const res = await getLiveMatchIdBySessionId(this.sessionId);
            const data = await res.json()

            this.matchId = data.match_id
            localStorage.setItem("match_id", this.matchId);
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
                this._processEvents(data, true); // Pass true for public session
            } catch (error) {
                console.error("Errore durante l'idratazione degli eventi:", error);
            }
        },

        /**
         * Helper interno per processare i dettagli del match recuperati dal backend.
         * Popola gameStore.match e le proprietà del timerStore.
         * @param dbMatch I dati del match grezzi dal backend.
         * @param isPublic Indica se la sessione è pubblica (per future differenziazioni).
         */
        _processMatchDetails(dbMatch: any, isPublic: boolean) {
            const settings = useSettingsStore();
            const gameStore = useGameStore();
            const timerStore = useTimerStore();

            timerStore.currentPeriod = matchPeriodToNumber[dbMatch.current_period as MatchPeriod]
            timerStore.countdown = dbMatch.current_time
            timerStore.isTimerRunning = dbMatch.is_timer_running

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
                    activatedTimer: settings.enableOppPlayersTime,
                    score: 0,
                    timeOut1: dbMatch.away_timeouts == 1,
                    timeOut2: dbMatch.away_timeouts == 2,
                    players: padRosterToMax(
                        mappedAwayPlayers, 
                        settings.maxPlayers, 
                        settings.enableOppPlayersTime
                    )
                }
            };
            console.log("Match caricato e idratato con successo!");
        },

        /**
         * Helper interno per processare gli eventi recuperati dal backend.
         * Popola gameStore.events e calcola i punteggi progressivi.
         * @param eventsData L'array di eventi grezzi dal backend.
         * @param isPublic Indica se la sessione è pubblica (per future differenziazioni).
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
