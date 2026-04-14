import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useGameStore } from './gameStore'
import { getEvents, getMatchDetails, getMatchIdBySessionId, updateSession } from '@/services/sessionService'
import type { Match } from '@/interfaces/Match'
import type { Event } from "@/interfaces/event/Event";
import { useSessionStore } from './sessionStore'
import type { Player } from '@/interfaces/Player'
import { mapPlayerToFE, padRosterToMax } from '@/utils/utils'
import { MatchEventType } from '@/enum/MatchEventDescription'
import type { SessionState } from '@/interfaces/session/SessionState'
import { useSettingsStore } from './settingsStore'

export const useSessionStateStore = defineStore('sessionState', {
    state: (): SessionState => {
        const savedEvents = localStorage.getItem("events");
        const savedMatch = localStorage.getItem("match");
        const savedSessionId = localStorage.getItem("session_id");
        const savedMatchId = localStorage.getItem("match_id");
        return {
            sessionId: savedSessionId ? savedSessionId : '',
            matchId: savedMatchId ? savedMatchId : '',
            events: savedEvents ? JSON.parse(savedEvents) as Event[] : [],
            match: savedMatch ? JSON.parse(savedMatch) as Match : {} as Match,
            channel: null,
            title: ''
        }
    },

    actions: {
        async joinSession(sessionId: string) {
            this.sessionId = sessionId
            localStorage.setItem("session_id", sessionId);
            
            await this.getMatchIdBySessionId();
            await this.getMatchDetails();
            await this.getEvents();

            const gameStore = useGameStore()
            gameStore.match = this.match as Match;
            gameStore.events = this.events as Event[];

            const sessionStore = useSessionStore()
            await sessionStore.joinSession(sessionId);

            // this.subscribe() TODO: SISTEMARE CON NUOVA STRUTTURA
        },

        subscribe() {
            if (this.channel) return

            this.channel = supabase
                .channel(`session_state:${this.sessionId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'session_state',
                        filter: `session_id=eq.${this.sessionId}`
                    },
                    (payload) => {
                        const newData = payload.new as any
                        this.match = newData.match
                        this.events = newData.events

                        const gameStore = useGameStore()
                        gameStore.match = this.match as Match;
                        gameStore.events = this.events as Event[];
                        localStorage.setItem("match", JSON.stringify(this.match));
                        localStorage.setItem("events", JSON.stringify(this.events));
                    }
                )
                .subscribe()

        },

        async updateState(match: any, events: any[]) {
            if (!this.sessionId) {
                console.log("sessionId non trovato, lo recupero da local storage");
                const sessionIdLS = localStorage.getItem("session_id");
                if (sessionIdLS !== null) {
                    console.log("LocalStorageSessionId: " + sessionIdLS);
                    this.sessionId = sessionIdLS;
                } else {
                    console.log("session_id non trovato in localStorage");
                    return;
                }
            }
            await updateSession(this.sessionId, match, events);
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
                
                // 2. Mappiamo i giocatori del BE per il Frontend (se lo facevi già)
                const mappedHomePlayers = dbMatch.home_players.map(mapPlayerToFE);
                const mappedAwayPlayers = dbMatch.away_players.map(mapPlayerToFE);
                    
                // Popoliamo il match
                this.match = {
                    quarter: dbMatch.current_quarter, 
                    
                    homeTeam: {
                        name: (dbMatch.home_team) ? dbMatch.home_team.club_name : '',
                        id: (dbMatch.home_team) ? dbMatch.home_team.id : (dbMatch.home_team_id ? dbMatch.home_team_id : ''),
                        category: (dbMatch.home_team) ? dbMatch.home_team.category : '',
                        activatedTimer: false, // Lo setti a true/false in base ai tuoi settings successivi se serve
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
                        activatedTimer: false,
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

                console.log("Match caricato e idratato con successo!", this.match);

            } catch (error) {
                console.error("Errore durante il recupero dei dettagli del match:", error);
                // Qui puoi gestire un toast di errore
            }
            
        },

        async getEvents() {
            try {
                const res = await getEvents(this.matchId);
                const data = await res.json();

                // 1. Resettiamo la lista eventi locale per evitare duplicati se ricarichiamo la pagina
                this.events = [];
                
                // Inizializziamo i contatori del punteggio
                let currentHomeScore = 0;
                let currentAwayScore = 0;

                // 2. ORDINAMENTO FONDAMENTALE
                // Ordiniamo gli eventi in ordine cronologico.
                // Assumo che il cronometro scenda (08:00 -> 00:00), quindi ordiniamo per quarto crescente, 
                // e per tempo decrescente (così i calcoli dei punteggi progressivi saranno perfetti).
                const sortedEvents = data.sort((a: { quarter: number; time: any }, b: { quarter: number; time: string }) => {
                    if (a.quarter !== b.quarter) return a.quarter - b.quarter;
                    return b.time.localeCompare(a.time); 
                });

                // 3. IL CICLO DI IDRATAZIONE
                if(this.match) {
                    for (const beEvent of sortedEvents) {
                        
                        // --- A. Trovare il Giocatore e la Squadra ---
                        let player = this.match.homeTeam.players.find((p: any) => p.id === beEvent.player_id);
                        let teamName = "";
                        let isHome = false;
    
                        if (player) {
                            teamName = this.match.homeTeam.name;
                            isHome = true;
                        } else {
                            player = this.match.awayTeam.players.find((p: any) => p.id === beEvent.player_id);
                            if (player) {
                                teamName = this.match.awayTeam.name;
                            }
                        }
    
                        // Fallback di sicurezza se il DB ci manda l'ID di un giocatore rimosso o errato
                        if (!player) {
                            console.warn(`Giocatore ID ${beEvent.player_id} non trovato nel Match! Salto l'evento.`);
                            continue;
                        }
    
                        // Variabili per l'oggetto Event finale
                        let desc = "";
                        let eventType: MatchEventType = MatchEventType.SHOT;
    
                        // --- B. Smistamento Logica TIRI ---
                        if (beEvent.event_category === 'SHOT') {
                            eventType = MatchEventType.SHOT;
                            
                            // Mappiamo i valori BE in italiano per la UI
                            const outcomeMapped = beEvent.shot_outcome === 'GOAL' ? 'Goal' : 
                                                beEvent.shot_outcome === 'SAVED' ? 'Parato' : 'Fuori'; // Puoi estendere con Stoppato
                                                
                            const catMapped = beEvent.shot_category === 'EVEN' ? 'Pari' :
                                            beEvent.shot_category === 'SUP' ? 'Superiorità' : 'Rigore';
    
                            // Popoliamo l'anagrafica del giocatore!
                            const shotObj = { position: beEvent.shot_position || "", outcome: outcomeMapped };
                            if (beEvent.shot_category === 'EVEN') player.shotsEven.push(shotObj);
                            else if (beEvent.shot_category === 'SUP') player.shotsSup.push(shotObj);
                            else if (beEvent.shot_category === 'PENALTY') player.shotsPenalty.push(shotObj);
    
                            // Logica Gol
                            if (beEvent.shot_outcome === 'GOAL') {
                                if (isHome) currentHomeScore++;
                                else currentAwayScore++;
                                
                                eventType = MatchEventType.GOAL; // Se hai l'enum separato per i gol
                                desc = `Goal - ${catMapped}, ${beEvent.shot_position || ''}`;
                            } else {
                                desc = `Tiro - ${outcomeMapped} - ${catMapped}, ${beEvent.shot_position || ''}`;
                            }
                        } 
                        // --- C. Smistamento Logica FALLI ---
                        else if (beEvent.event_category === 'FOUL') {
                            eventType = MatchEventType.FOUL;
                            
                            const typeMapped = beEvent.foul_type === 'EXCL' ? 'Espulsione' : 
                                            beEvent.foul_type === 'PEN' ? 'Rigore' : 'EDCS';
    
                            // Popoliamo la lista falli del giocatore!
                            player.exclutions.push({
                                type: typeMapped,
                                position: beEvent.foul_position || "",
                                ball: !!beEvent.foul_with_ball,
                                quarter: beEvent.quarter,
                                time: beEvent.time,
                                earnedBy: 0 // Da mappare se il backend te lo invia
                            });
    
                            desc = `${typeMapped} ${beEvent.foul_position || ''} ${beEvent.foul_with_ball ? 'Con palla' : 'Senza palla'}`;
                        }
    
                        // --- D. Inserimento Evento nel Play-by-Play ---
                        this.events.push({
                            team: teamName,
                            player: player,
                            time: beEvent.time,
                            quarter: beEvent.quarter,
                            description: desc.trim(),
                            type: eventType,
                            // Salviamo lo score in QUELL'ESATTO MOMENTO (fondamentale per i badge verdi e bianchi della tabella!)
                            homeScore: currentHomeScore,
                            awayScore: currentAwayScore,
    
                            // Inserisco anche i campi strutturati per coerenza col modello nuovo che avevamo pensato
                            situation: beEvent.shot_category || beEvent.foul_type,
                            outcome: beEvent.shot_outcome,
                            position: beEvent.shot_position || beEvent.foul_position,
                            withBall: beEvent.foul_with_ball
                        });
                    }
    
                    // 4. Aggiorniamo il punteggio finale "Master" sulla base degli eventi processati
                    this.match.homeTeam.score = currentHomeScore;
                    this.match.awayTeam.score = currentAwayScore;
                }

                console.log("Idratazione completata! Eventi:", this.events);

            } catch (error) {
                console.error("Errore durante l'idratazione degli eventi:", error);
            }
        }
    }
})
