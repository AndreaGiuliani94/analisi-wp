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
                const settings = useSettingsStore();
                // 1. Chiamata al BE per recuperare la partita
                const res = await getMatchDetails(this.matchId);
                const dbMatch = await res.json();
                
                const timerStore = useTimerStore();
                timerStore.currentQuarter = dbMatch.current_quarter
                timerStore.setTimeFromString(dbMatch.current_time)
                timerStore.isTimerRunning = dbMatch.is_timer_running

                // 2. Mappiamo i giocatori del BE per il Frontend (se lo facevi già)
                const mappedHomePlayers = dbMatch.home_players.map(mapPlayerToFE);
                const mappedAwayPlayers = dbMatch.away_players.map(mapPlayerToFE);
                
                const gameStore = useGameStore()
                // Popoliamo il match
                gameStore.match = {
                    id: this.matchId,
                    homeTeam: {
                        name: (dbMatch.home_team) ? dbMatch.home_team.club_name : '',
                        id: (dbMatch.home_team) ? dbMatch.home_team.id : (dbMatch.home_team_id ? dbMatch.home_team_id : ''),
                        category: (dbMatch.home_team) ? dbMatch.home_team.category : '',
                        activatedTimer: useSettingsStore().enableHomePlayersTime, // Lo setti a true/false in base ai tuoi settings successivi se serve
                        score: 0,
                        timeOut1: dbMatch.home_timeouts == 1,
                        timeOut2: dbMatch.home_timeouts == 2,
                        // Mappiamo i giocatori e li ordiniamo per numero di calottina (fondamentale per la UI!)
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
                        activatedTimer: useSettingsStore().enableOppPlayersTime,
                        score: 0,
                        timeOut1: dbMatch.away_timeouts == 1,
                        timeOut2: dbMatch.away_timeouts == 2,
                        // Mappiamo i giocatori e li ordiniamo per numero di calottina
                        players: padRosterToMax(
                            mappedAwayPlayers, 
                            settings.maxPlayers, 
                            settings.enableOppPlayersTime
                        )
                    }
                };

                console.log("Match caricato e idratato con successo!");

            } catch (error) {
                console.error("Errore durante il recupero dei dettagli del match:", error);
                // Qui puoi gestire un toast di errore
            }
            
        },

        async getEvents() {
            const gameStore = useGameStore()
            try {
                const res = await getEvents(this.matchId);
                const data = await res.json();

                // 1. TABULA RASA
                gameStore.match.homeTeam.score = 0;
                gameStore.match.awayTeam.score = 0;
                gameStore.events = [];

                // Funzione helper interna per pulire le stat dei giocatori
                const clearTeamStats = (team: Team, isHome: boolean) => {
                    team.players.forEach((p: Player) => {
                        p.active = p.active ? p.active : !isHome;
                    });
                };
                clearTeamStats(gameStore.match.homeTeam, true);
                clearTeamStats(gameStore.match.awayTeam, false);
                
                // 2. ORDINAMENTO FONDAMENTALE
                // Ordiniamo gli eventi in ordine cronologico.
                // Assumo che il cronometro scenda (08:00 -> 00:00), quindi ordiniamo per quarto crescente, 
                // e per tempo decrescente (così i calcoli dei punteggi progressivi saranno perfetti).
                const sortedEvents = data.sort((a: { quarter: number; time: any }, b: { quarter: number; time: string }) => {
                    if (a.quarter !== b.quarter) return a.quarter - b.quarter;
                    return b.time.localeCompare(a.time); 
                });

                // Inizializziamo i contatori del punteggio
                let currentHomeScore = 0;
                let currentAwayScore = 0;

                // 3. IL CICLO DI IDRATAZIONE
                for (const beEvent of sortedEvents) {
                    
                    // A. Identificazione Giocatore e Squadra
                    let isHome = true;
                    let player = gameStore.match.homeTeam.players.find((p: any) => p.id === beEvent.player_id);
                    let opposingTeam = gameStore.match.awayTeam;
                    
                    if (!player) {
                        player = gameStore.match.awayTeam.players.find((p: any) => p.id === beEvent.player_id);
                        isHome = false;
                        opposingTeam = gameStore.match.homeTeam;
                    }

                    // Fallback di sicurezza se il DB ci manda l'ID di un giocatore rimosso o errato
                    if (!player) {
                        console.warn(`Giocatore ID ${beEvent.player_id} non trovato nel Match! Salto l'evento.`);
                        continue;
                    }

                    // B. Calcolo progressivo del Punteggio (serve per la UI della riga dell'evento!)
                    if (beEvent.event_category === MatchEventType.SHOT && beEvent.shot_outcome === ShotOutcome.GOAL) {
                        if (isHome) currentHomeScore++;
                        else currentAwayScore++;
                    }

                    // C. Popolamento Timeline (UI)
                    // Passiamo i punteggi esatti registrati fino a QUESTO momento
                    const currentMatchData = { homeScore: currentHomeScore, awayScore: currentAwayScore };
                    const uiEvent = convertDbEventToUI(beEvent, currentMatchData, gameStore.match);
                    
                    if (uiEvent) {
                        // unshift() mette i più recenti in cima (come la tua UI si aspetta)
                        gameStore.events.push(uiEvent);
                    }
                }

                // 4. Salvataggio Finale
                gameStore.match.homeTeam.score = currentHomeScore;
                gameStore.match.awayTeam.score = currentAwayScore;

                console.log("Idratazione Iniziale Eventi completata con successo!");

            } catch (error) {
                console.error("Errore durante l'idratazione degli eventi:", error);
            }
        }
    }
})
