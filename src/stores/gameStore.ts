import { defineStore } from "pinia";
import type { Player } from "@/interfaces/Player";
import type { MatchEvent } from "@/interfaces/MatchEvent";
import type { Match } from "@/interfaces/Match";
import { ShotCategory, ShotOutcome } from "@/enum/ShotDescription";
import { useSettingsStore, type SettingsStore } from "./settingsStore";
import { EDCSType, FoulPosition, FoulType } from "@/enum/ExclutionDescription";
import { useToast } from "vue-toastification";
import type { Team } from "@/interfaces/Team";
import { MatchEventType } from "@/enum/MatchEventDescription";
import { createNewTeam, getAllTeams, getLastTeamRoster, getTeamRoster, getTeamsByName, restartMatch, savePregameSetup, updatePlayer, updateSubstitutions } from "@/services/matchService";
import type { TeamInfo } from "@/interfaces/TeamInfo";
import type { NewPlayer } from "@/interfaces/NewPlayer";
import { deleteMatchEvent, saveMatchEvent, updateMatchEvent } from "@/services/eventService";
import { convertDbEventToUI, refactorSaveEventPayload } from "@/utils/converter";
import { useTimerStore } from "./timerStore";
import type { Substitutions } from "@/interfaces/Substitutions";
import { useSessionStateStore } from "./sessionStateStore";
import { clearTeam, resetTeam } from "@/utils/utils";

export const useGameStore = defineStore("gameStore", {
  state: () => {
    return {
      isCorrectionMode: false,
      pendingSubstitutions: [] as Substitutions[],
      subsTimeoutId: null as any,
      events: [] as MatchEvent[],
      match: {} as Match,
    };
  },
  getters: {
    actualPlayers: (state) =>
      state.match.homeTeam?.players.filter((player) => player.name.length > 0),
    actualOpponents: (state) =>
      state.match.awayTeam?.players.filter((player) => player.name.length > 0),
    activeOppCount: (state) =>
      state.match.awayTeam?.players.filter((player) => player.active).length,
    activeCount: (state) =>
      state.match.homeTeam?.players.filter((player) => player.active).length,
    partials: (state) => {
      const partials = Array.from({ length: 4 }, (_, i) => ({
        home: 0,
        away: 0
      }));
      state.events.forEach(event => {
        if (event.eventType == MatchEventType.SHOT && event.shotOutcome === ShotOutcome.GOAL && event.quarter <= 4) {
          const qIndex = event.quarter - 1;
          if (event.team === state.match.homeTeam.name) {
            partials[qIndex].home++;
          } else {
            partials[qIndex].away++;
          }
        }
      });
      return partials;
    },
    /**
     * Restituisce tutti i tiri di un giocatore, filtrabili (opzionalmente) per quarto
     */
    getPlayerShots: (state) => {
      return (playerId?: string, quarter?: number) => {
        if (!playerId) return [];
        let playerEvents: MatchEvent[] = state.events.filter(e => 
          e.playerId === playerId && 
          (e.eventType === MatchEventType.SHOT)
        );

        if (quarter) {
          playerEvents = playerEvents.filter(e => e.quarter === quarter);
        }

        return playerEvents;
      }
    },
    /**
     * Separa automaticamente i tiri per categoria
     */
    getPlayerShotsByCategory: (state) => {
      return (playerId: string) => {
        const allShots = state.events.filter(e => 
          e.playerId === playerId && e.eventType === MatchEventType.SHOT
        );

        return {
          even: allShots.filter(s => s.shotCategory === ShotCategory.EVEN),
          sup: allShots.filter(s => s.shotCategory === ShotCategory.SUP),
          penalty: allShots.filter(s => s.shotCategory === ShotCategory.PENALTY),
        };
      }
    },
    /**
     * Statistiche Portiere
     */
    getGoalkeeperShotsFaced: (state) => {
      return (goalkeeperId: string) => {
        const totalShotsFaced = state.events.filter(e => e.defendingGoalkeeperId === goalkeeperId);

        return {
          saves: totalShotsFaced.filter(e => e.shotOutcome === ShotOutcome.SAVED),
          shots: totalShotsFaced
        }
      }
    },
    /**
     * Restituisce tutti i falli di un giocatore, filtrabili (opzionalmente) per quarto
     */
    getPlayerFouls: (state) => {
      return (playerId?: string, quarter?: number) => {
        if (!playerId) return [];
        let playerEvents: MatchEvent[] = state.events.filter(e => 
          e.playerId === playerId && 
          (e.eventType === MatchEventType.FOUL)
        );

        if (quarter) {
          playerEvents = playerEvents.filter(e => e.quarter === quarter);
        }

        return playerEvents ?? [];
      }
    },
    /**
     * Restituisce tutti i falli GUADAGNATI da un giocatore specifico (es. Centro Boa)
     */
    getFoulsEarnedByPlayer: (state) => {
      return (playerId?: string) => {
        if (!playerId) return [];
        return state.events.filter(e => 
          (e.eventType === MatchEventType.FOUL) && 
          e.earnedByPlayerId === playerId
        );
      }
    }
  },
  actions: {
    async loadStore() {
      const settingsStore = useSettingsStore();

      if (!this.match.homeTeam || this.match.homeTeam.players.length == 0) {
        initializeHomeTeam.call(this, settingsStore);
      }
      if (!this.match.awayTeam  || this.match.awayTeam.players.length == 0) {
        initializeAwayTeam.call(this, settingsStore);
      }
    },
    async toggleElement(number: number, team: number) {
      const settingsStore = useSettingsStore();
      const toast = useToast();
      let el;
      let enablePlayersTime
      if (team === 0) {
        el = this.match.homeTeam.players.find((el) => el.number === number);
        enablePlayersTime = settingsStore.enableHomePlayersTime;
      } else {
        el = this.match.awayTeam.players.find((el) => el.number === number);
        enablePlayersTime = settingsStore.enableOppPlayersTime;
      }

      if (!el) return;
      
      const isAttemptingToActivate = !el.active;

      if (isAttemptingToActivate) {
        // 2. Controlli pre-attivazione
        const currentActiveCount = this.match.homeTeam.players.filter(p => p.active).length;
        
        // Controllo espulsioni definitive
        if (this.isOut(el)) {
          toast.warning("Giocatore espulso definitivamente");
          return;
        }
        // Limite di 7 giocatori (se il tempo è abilitato)
        if (enablePlayersTime && currentActiveCount >= 7) {
          toast.warning('Attenzione! Limite massimo di giocatori in acqua raggiunto')
          return; // Esci senza attivare
        }

        // 3. Attivazione effettiva
        this.togglePlayerActive(el)
      } else {
        // 4. Disattivazione semplice
        if(!enablePlayersTime)
          return
        this.togglePlayerActive(el)
      }
      
    },
    togglePlayerActive(player: any) {
      // 1. OPTIMISTIC UI: Aggiorniamo istantaneamente la grafica
      player.active = !player.active;
      
      // Il cambio azzera sempre il tempo effettivo in vasca dell'ultimo "shift"
      player.actualTime = 0; 

      // 2. AGGIUNTA ALLA CODA
      // Se l'operatore clicca due volte (entra ed esce subito), aggiorniamo lo stato nella coda
      const existingIndex = this.pendingSubstitutions.findIndex(s => s.playerId === player.id);
      if (existingIndex !== -1) {
        this.pendingSubstitutions[existingIndex].isActive = player.active;
      } else {
        this.pendingSubstitutions.push({ playerId: player.id, isActive: player.active });
      }

      // 3. DEBOUNCING
      // Cancelliamo il timer precedente se l'utente sta ancora cliccando
      if (this.subsTimeoutId) clearTimeout(this.subsTimeoutId);

      // Impostiamo un nuovo timer di 500ms
      this.subsTimeoutId = setTimeout(() => {
        this.flushSubstitutions();
      }, 800);
    },
    async flushSubstitutions() {
      if (this.pendingSubstitutions.length === 0) return;

      const timerStore = useTimerStore(); // Prendiamo il tempo esatto in questo istante
      const payload = [...this.pendingSubstitutions];
      this.pendingSubstitutions = [];

      try {
        await updateSubstitutions(
          this.match.id, 
          {
            sender_client_id: useSessionStateStore().clientId,
            time: timerStore.formattedTime,
            quarter: timerStore.currentQuarter,
            substitutions: payload 
        });
      } catch (error) {
        console.error("Errore salvataggio cambi:", error);
      }
    },
    /**
     * Modifica massivamente i tempi dei giocatori.
     * @param seconds Quanti secondi aggiungere (es. 1 per lo scorrere normale, o 30 per forward). 
     * Usare valori negativi per il 'back' (es. -10).
     */
    adjustPlayerTimes(seconds: number) {
      const settingsStore = useSettingsStore();
      const maxSeconds = settingsStore.periodDuration * 60 * settingsStore.totalPeriods; // Limite massimo partita

      const updateTeam = (team: any) => {
        team.players.forEach((player: any) => {
          
          if (player.active) {
            // Aggiunge (o sottrae) secondi, assicurandosi di restare tra 0 e il massimo possibile
            player.activeTime = Math.max(0, Math.min(maxSeconds, (player.activeTime || 0) + seconds));
          } else {
            player.benchTime = Math.max(0, Math.min(maxSeconds, (player.benchTime || 0) + seconds));
          }
          
          // actualTime (che si resetta ai cambi) si aggiorna di conseguenza
          player.actualTime = Math.max(0, Math.min(maxSeconds, (player.actualTime || 0) + seconds));
        });
      };

      if(settingsStore.enableHomePlayersTime)
        updateTeam(this.match.homeTeam);
      if(settingsStore.enableOppPlayersTime)
        updateTeam(this.match.awayTeam);
    },
    async clearDistinta() {
      resetTeam(this.match.homeTeam, true);
      resetTeam(this.match.awayTeam, false);
      await this.loadStore();
    },
    clearTeams() {
      clearTeam(this.match.homeTeam, true);
      clearTeam(this.match.awayTeam, false);
    },
    async restartMatch() {
      this.clearTeams();
      this.events = [];
      await restartMatch(this.match.id, {sender_client_id: useSessionStateStore().clientId});
    },
    addShot(
      number: number,
      team: number,
      type: ShotCategory,
      position: string,
      outcome: ShotOutcome,
    ) {
      // 1. Identificazione del team e del giocatore in modo pulito 
      const currentTeam = team === 0 ? this.match.homeTeam : this.match.awayTeam;
      const player = currentTeam.players.find((p: any) => p.number === number);
      
      if (!player) return; 

      // 3. Statistiche Portiere Avversario
      const opposingTeam = team === 0 ? this.match.awayTeam : this.match.homeTeam;
      const activeGoalkeeper = opposingTeam.players.find((p: any) => p.isGK && p.active);
      const gkId = activeGoalkeeper ? activeGoalkeeper.id : undefined;

      // 4. Gestione Evento Live
      if (outcome === ShotOutcome.GOAL) currentTeam.score++;
      
      // 3. Salviamo l'evento
      this.saveEvent({
        eventType: MatchEventType.SHOT,
        currentTeam: currentTeam,
        player: player,
        details: {
          shotCategory: type,
          shotOutcome: outcome,
          shotPosition: position,
          defendingGoalkeeperId: gkId
        }
      });
        
    },
    removeShot(number: number, team: number, type: ShotCategory) {
      const currentTeam = team === 0 ? this.match.homeTeam : this.match.awayTeam;
      const player = currentTeam.players.find((p: any) => p.number === number);

      if (!player) return;

      // 4. Rimuoviamo l'evento dalla cronaca
      this.removeShotEvent(player);
      // 5. Chiudiamo la modalità correzione
      this.setCorrectionMode(false);
    },
    removeGoal(teamIndex: number) {
      if (teamIndex === 0) {
        if (this.match.homeTeam.score > 0) {
          this.match.homeTeam.score--;
        }
      } else {
        if (this.match.awayTeam.score > 0) {
          this.match.awayTeam.score--;
        }
      }
    },
    async removeShotEvent(player: Player) {
      const index = this.events.findLastIndex( event =>
          event.player.id === player.id && event.eventType === MatchEventType.SHOT
      );
      if (index !== -1) {
        // 1. Estrapoliamo l'ID dell'evento generato dal DB
        const eventId = this.events[index].id;

        // 2. Optimistic UI: Rimuoviamo istantaneamente il tiro dalla UI
        this.events.splice(index, 1);

        if(this.events[index].shotOutcome === ShotOutcome.GOAL)
          this.removeGoal(this.match.homeTeam.players.some(pl => pl.id === player.id) ? 0 : 1);

        // 3. Chiamata al BE
        if (eventId) {
          try {
            // Passiamo l'ID e il myClientId per la deduplicazione!
            await deleteMatchEvent(eventId, useSessionStateStore().clientId); 
          } catch (error) {
            console.error("Errore durante l'eliminazione dell'evento:", error);
            // Opzionale: gestire un "rollback" visivo reinserendo l'evento se fallisce la cancellazione
          }
        } else {
          console.warn("Impossibile eliminare a DB: Evento sprovvisto di ID");
        }
      }
    },
    /**
     * Metodo per inserire o aggiornare falli
     */
    async processFoul(payload: {
      number: number;
      team: number;
      type: FoulType;
      exclNumber: number;
      
      // Campi opzionali: dipendono dal tipo di fallo
      position?: FoulPosition;
      ball?: boolean;
      earnedBy?: number;
      edcsType?: EDCSType;
    }) {
      // 1. Identificazione squadra e autore del fallo
      const currentTeam = payload.team === 0 ? this.match.homeTeam : this.match.awayTeam;
      const opposingTeam = payload.team === 0 ? this.match.awayTeam : this.match.homeTeam;
      const player = currentTeam.players.find((p: any) => p.number === payload.number);
      
      if (!player || !player.id) {
        useToast().error('Giocatore non trovato!');
        return;
      }

      let earnedById = undefined;
      if (payload.earnedBy && payload.earnedBy !== 0) {
        const victimPlayer = opposingTeam.players.find((p: any) => p.number === payload.earnedBy);
        if (victimPlayer && victimPlayer.id) earnedById = victimPlayer.id;
      }

      // 3. RECUPERO FALLI DALLA TIMELINE (Single Source of Truth)
      const playerFouls = this.getPlayerFouls(player.id);
      const existingFoulEvent = playerFouls[payload.exclNumber];

      if (existingFoulEvent && existingFoulEvent.id) {
        // --- CASO A: CORRECTION MODE (UPDATE) ---
        
        // Aggiorniamo dinamicamente tutte le proprietà (che siano definite o meno)
        existingFoulEvent.foulType = payload.type;
        existingFoulEvent.foulPosition = payload.position;
        existingFoulEvent.foulWithBall = payload.ball;
        existingFoulEvent.earnedByPlayerId = earnedById;
        existingFoulEvent.edcsType = payload.edcsType;
        
        
        const bePayload = refactorSaveEventPayload(useSessionStateStore().clientId, existingFoulEvent);
        await this.updateEvent(existingFoulEvent.id, bePayload); 
        
      } else {
        // --- CASO B: NUOVO FALLO (INSERT) ---
        
        this.saveEvent({
          eventType: MatchEventType.FOUL,
          currentTeam: currentTeam,
          player: player,
          details: {
            foulType: payload.type,
            foulPosition: payload.position,
            foulWithBall: payload.ball,
            earnedByPlayerId: earnedById,
            edcsType: payload.edcsType,
          }
        });
      }

      // 4. LOGICA DI ESPULSIONE DEFINITIVA
      // Ricalcoliamo il numero totale di falli usando il getter
      if (this.isOut(player)) {
        player.active = false;
        player.actualTime = 0;
        this.pendingSubstitutions.push({ playerId: player.id, isActive: player.active });
        if (this.subsTimeoutId) clearTimeout(this.subsTimeoutId);
        // Impostiamo un nuovo timer di 500ms
        this.subsTimeoutId = setTimeout(() => {
          this.flushSubstitutions();
        }, 800);
      }
    },
    isOut(player: Player): boolean {
      const fouls = player.id ? this.getPlayerFouls(player.id) : [];
      return (
        fouls.length === 3 ||
        fouls.some((excl) => excl.foulType === FoulType.EDCS)
      );
    },
    async removeExclution(number: number, team: number, exclNumber: number) {
      const currentTeam = team === 0 ? this.match.homeTeam : this.match.awayTeam;
      const player = currentTeam.players.find((p: any) => p.number === number);
      if (!player || !player.id) {
        useToast().error('Impossibile trovare il giocatore!')
        return
      }
      const exclusionToRemove = this.getPlayerFouls(player.id)[exclNumber];

      if (exclusionToRemove) {
        // Rimuoviamo l'evento dalla cronaca
        await this.removeExclEvent(player, exclusionToRemove);
        // Riattiviamo il giocatore
        if (!this.isOut(player)) {
          player.active = true;
        }
      }
    },
    async removeExclEvent(player: Player, excl: MatchEvent) {
      // Troviamo l'evento esatto nella cronaca
      const eventToRemove = this.events.find(
        (e: MatchEvent) => 
          e.player.id === player.id &&
          e.eventType === MatchEventType.FOUL &&
          e.quarter === excl.quarter &&
          e.time === excl.time
      );
      if(eventToRemove && eventToRemove.id) {
        const eventIndex = this.events.findIndex((e: MatchEvent) => e.id === eventToRemove.id);
        // Se lo troviamo, lo eliminiamo dalla timeline
        if (eventIndex !== -1) {
          this.events.splice(eventIndex, 1);
        }
        // Chiamata al BE
        try {
          await deleteMatchEvent(eventToRemove.id, useSessionStateStore().clientId);
        } catch (error) {
            console.error("Errore durante l'eliminazione dell'evento:", error);
            // Opzionale: gestire un "rollback" visivo reinserendo l'evento se fallisce la cancellazione
          }
      }
    },
    async addTimeOut(number: number, team: string) {
      number === 1
        ? team === "HOME"
          ? (this.match.homeTeam.timeOut1 = true)
          : (this.match.awayTeam.timeOut1 = true)
        : team === "HOME"
          ? (this.match.homeTeam.timeOut2 = true)
          : (this.match.awayTeam.timeOut2 = true);
    },
    async toggleTimeOut(number: number, team: string) {
      if (team === "HOME") {
        number === 1
          ? (this.match.homeTeam.timeOut1 = !this.match.homeTeam.timeOut1)
          : (this.match.homeTeam.timeOut2 = !this.match.homeTeam.timeOut2);
      } else {
        number === 1
          ? (this.match.awayTeam.timeOut1 = !this.match.awayTeam.timeOut1)
          : (this.match.awayTeam.timeOut2 = !this.match.awayTeam.timeOut2);
      }
    },
    getAllPlayerShots(player: Player) {
      if (!player.id)
        return { goals: 0, shots: 0}
      var totalShots = this.getPlayerShots(player.id);
      var totalGoals = totalShots.filter(
        (shot) => shot.shotOutcome === ShotOutcome.GOAL,
      );
      return {
        goals: totalGoals.length,
        shots: totalShots.length,
      };
    },
    getAllTeamShots(team: number) {
      var totalShots = [];
      var actualTeam = team === 0 ? this.match.homeTeam : this.match.awayTeam;
      actualTeam.players.forEach((player) => {
        totalShots.push(
          player.id? this.getPlayerShots(player.id) : null
        );
      });
      return totalShots.length ?? 0;
    },
    async saveEvent(payload: {
      eventType: MatchEventType;
      currentTeam: Team;
      player: Player;
      details?: {
        // Tiri
        shotCategory?: ShotCategory;
        shotOutcome?: ShotOutcome;
        shotPosition?: string;
        defendingGoalkeeperId?: string;
        // Falli
        foulType?: FoulType; 
        foulPosition?: FoulPosition;
        edcsType?: EDCSType;
        foulWithBall?: boolean;
        earnedByPlayerId?: string;
      }
    }) {
      const details = payload.details || {};

      // 2. Creazione dell'evento locale (TypeScript camelCase)
      const newEvent: MatchEvent = {
        // Info UI
        team: payload.currentTeam.name,
        player: payload.player,
        homeScore: this.match.homeTeam.score,
        awayScore: this.match.awayTeam.score,

        // Info Database
        matchId: this.match.id,
        playerId: payload.player?.id,
        quarter: useTimerStore().currentQuarter,
        time: useTimerStore().formattedTime,
        eventType: payload.eventType,

        // Dati specifici
        shotCategory: details.shotCategory,
        shotOutcome: details.shotOutcome,
        shotPosition: details.shotPosition,
        defendingGoalkeeperId: details.defendingGoalkeeperId,

        foulType: details.foulType,
        foulPosition: details.foulPosition,
        edcsType: details.edcsType,
        foulWithBall: details.foulWithBall,
        earnedByPlayerId: details.earnedByPlayerId,
      };

      // 3. OPTIMISTIC UI UPDATE: Inseriamo subito in cima all'array locale
      this.events.push(newEvent);

      // 5. CHIAMATA AL BACKEND
      try {
        const res = await saveMatchEvent(refactorSaveEventPayload(useSessionStateStore().clientId, newEvent)); // La tua POST

        const response = await res.json();
        
        if (response && response.event.id) {
          newEvent.id = response.event.id;
        }
        
      } catch (error) {
        console.error("Errore critico: salvataggio evento fallito a database", error);
        
        // Gestione Errore: potresti mostrare un toast di errore
        useToast().error("Impossibile salvare l'evento sul server!");
        
        // E opzionalmente rimuovere l'evento fallito dall'UI (Rollback)
        const index = this.events.indexOf(newEvent);
        if (index > -1) this.events.splice(index, 1);
      }
    },
    async updateEvent(eventId: string, payload: any) {
      try {
        await updateMatchEvent(eventId, payload);
      } catch (error) {        
        useToast().error("Impossibile aggiornare l'evento sul server!");
      }
    },
    toggleCorrectionMode() {
      this.isCorrectionMode = !this.isCorrectionMode;
    },
    setCorrectionMode(value: boolean) {
      this.isCorrectionMode = value;
    },
    removeQuarter() {
      useTimerStore().removeQuarter()
      this.toggleCorrectionMode()
    },
    getAllTeamShotsByType(team: Team, type: ShotCategory) {
      const settingsStore = useSettingsStore();
      var totalShots: MatchEvent[] = [];
      var players = (team.name === settingsStore.homeTeamName) ? this.match.homeTeam.players : this.match.awayTeam.players;
      players.forEach(pl => {
        if(pl.id) {
          switch (type) {
            case ShotCategory.EVEN:
              totalShots.push(...this.getPlayerShotsByCategory(pl.id).even)
              break;
          
            case ShotCategory.SUP:
              totalShots.push(...this.getPlayerShotsByCategory(pl.id).sup)
              break;
          
            case ShotCategory.PENALTY:
              totalShots.push(...this.getPlayerShotsByCategory(pl.id).penalty)
              break;
          
            default:
              totalShots.push(...this.getPlayerShots(pl.id))
              break;
          }
        }
      });
      var totalGoals = totalShots.filter(shot => shot.shotOutcome === ShotOutcome.GOAL.toUpperCase() );
      var totalParati = totalShots.filter(shot => shot.shotOutcome === ShotOutcome.SAVED.toUpperCase() );
      var totalFuori = totalShots.filter(shot => shot.shotOutcome === ShotOutcome.MISSED.toUpperCase() );
      var totalStoppati = totalShots.filter(shot => shot.shotOutcome === ShotOutcome.BLOCKED.toUpperCase() );
      return {
        goals: totalGoals,
        shots: totalShots,
        parati: totalParati,
        fuori: totalFuori,
        stoppati: totalStoppati
      }
    },
    getOpponentsPlayerName(playerId: string, team: Team) {
      if(team.name === useSettingsStore().homeTeamName)
        return this.match.awayTeam.players.find(player => player.id === playerId)?.name
      else
        return this.match.homeTeam.players.find(player => player.id === playerId)?.name
    },
    async getTeamsByName(teamName: string): Promise<TeamInfo[]> {
      const response = await getTeamsByName(teamName);
      const data = await response.json();
      return data;
    },
    async getTeamRoster(teamId: string) {
      const response = await getTeamRoster(teamId);
      const data = await response.json();
      return data;
    },
    async getLastTeamRoster(teamId: string) {
      const response = await getLastTeamRoster(teamId, this.match.id);
      const data = await response.json();
      return data;
    },
    async getAllTeams(): Promise<TeamInfo[]> {
      const response = await getAllTeams();
      const data = await response.json();
      return data;
    },
    async savePregameData () {
      try {
        // 1. PULIZIA DATI (Sanitization)
        // Inviamo al BE solo i giocatori con un nome scritto.
        const activeHomePlayers = this.match.homeTeam.players.filter(
          (p: any) => p.name && p.name.trim() !== ''
        );
        
        const activeAwayPlayers = this.match.awayTeam.players.filter(
          (p: any) => p.name && p.name.trim() !== ''
        );

        // 2. CREAZIONE DEL PAYLOAD
        const requestBody = {
          home_team: {
            id: this.match.homeTeam.id || null,
            name: this.match.homeTeam.name,
            category: this.match.homeTeam.category,
            roster: activeHomePlayers
          },
          away_team: {
            id: this.match.awayTeam.id || null,
            name: this.match.awayTeam.name,
            category: this.match.awayTeam.category,
            roster: activeAwayPlayers
          }
        };

        // 3. CHIAMATA API (Singola transazione)
        const response = await savePregameSetup(this.match.id, requestBody);
        const responseData = await response.json();

        if(responseData.new_players && responseData.new_players.length > 0){
          responseData.new_players.forEach((newPlayer: NewPlayer) => {
            if(newPlayer.team_id === this.match.homeTeam.id) {
              const player = this.match.homeTeam.players.find(pl => pl.number === newPlayer.number)
              if (player) {
                player.id = newPlayer.id;
              }
            } else if(newPlayer.team_id === this.match.awayTeam.id) {
              const player = this.match.awayTeam.players.find(pl => pl.number === newPlayer.number)
              if (player) {
                player.id = newPlayer.id;
              }
            }
          });
        }

        return responseData;

      } catch (error) {
        console.error("Errore critico durante il salvataggio pre-partita:", error);

        throw error; 
      }
    },
    async createNewTeam(team: Team) {
      try {
        const requestBody = {
          club_name: team.name,
          category: team.category
        };
        const response = await createNewTeam(requestBody);
        const responseData = await response.json();
        return responseData;

      } catch (error) {
        console.error("Errore critico durante il salvataggio pre-partita:", error);

        throw error; 
      }
    },
    async updatePlayer(payload: any) {
      try {
        if (!payload.id) throw new Error('Giocatore non trovato')
        
        const playerId = payload.id;
        delete payload.id;
        
        const res = await updatePlayer(playerId, payload);
        return res;

      } catch (error) {
        console.error("Errore critico durante il salvataggio pre-partita:", error);
        throw error; 
      }

    },
    syncPlayerTimes(stats: any[]) {
      // subsFromBackend = [{ id: "..", isActive: true, activeTime: 120, benchTime: 45 }, ...]

      stats.forEach(sub => {
        let player = this.match.homeTeam.players.find((p: any) => p.id === sub.id) 
                  || this.match.awayTeam.players.find((p: any) => p.id === sub.id);

        if (player) {
          // 1. Allineiamo lo stato (entrato/uscito)
          player.active = sub.is_playing;
          // 2. SOVRASCRIVIAMO I TEMPI con la verità assoluta del Database
          player.activeTime = sub.active_time;
          player.benchTime = sub.bench_time;
        }
      });
    },
    applyBulkSubstitutions(subsFromBackend: any[]) {
      subsFromBackend.forEach(sub => {
        let player = this.match.homeTeam.players.find((p: Player) => p.id === sub.player_id) 
                  || this.match.awayTeam.players.find((p: Player) => p.id === sub.player_id);

        if (player) {
          // 1. Allineiamo lo stato (entrato/uscito)
          player.active = sub.is_playing;
          
          // 2. SOVRASCRIVIAMO I TEMPI con la verità assoluta del Database
          player.activeTime = sub.active_time;
          player.benchTime = sub.bench_time;

          // 3. Resettiamo il cronometro parziale del Frontend
          if(sub.is_changed)
          player.actualTime = 0; 
        }
      });
    },
    /**
     * Funzione chiamata dal Socket Listener quando arriva un broadcast
     */
    handleIncomingBroadcast(broadcastData: any) {
      const payloadData = broadcastData.payload_json;

      if (payloadData.matchData) {
        this.match.homeTeam.score = payloadData.matchData.homeScore;
        this.match.awayTeam.score = payloadData.matchData.awayScore;
      }

      // 3. Sovrascrittura Statistiche Giocatore
      if (payloadData.playerStats) {
        const playerId = payloadData.playerStats.id;
    
        // Cerchiamo il giocatore da aggiornare e la rispettiva squadra avversaria
        let playerTarget = this.match.homeTeam.players.find((p: any) => p.id === playerId);
        let opposingTeam = this.match.awayTeam;
        
        if (!playerTarget) {
          playerTarget = this.match.awayTeam.players.find((p: any) => p.id === playerId);
          opposingTeam = this.match.homeTeam;
        }

      }
      // Se l'azione è un "ADD" (nuovo evento)
      if (payloadData.action === 'ADD') {
        // 4. Inserimento nella Timeline
        if (payloadData.event) {
          const incomingEvent = convertDbEventToUI(payloadData.event, payloadData.matchData, this.match);
      
          if (incomingEvent) {
            this.events.push(incomingEvent);
          }
        }
      } else if (payloadData.action === 'UPDATE') {
        // Modifica di un evento esistente
        const incomingEvent = convertDbEventToUI(payloadData.event, payloadData.matchData, this.match);
        const idx = this.events.findIndex((e: any) => e.id === payloadData.event.id);
        
        if (idx !== -1 && incomingEvent) {
          // Sovrascriviamo l'evento all'indice trovato (mantenendo la reattività)
          this.events[idx] = incomingEvent;
        }
      } else if (payloadData.action === 'DELETE') {
        // Eliminazione evento
        const idx = this.events.findIndex((e: any) => e.id === payloadData.event.id);
        
        if (idx !== -1) {
          this.events.splice(idx, 1);
        }
      } else if (payloadData.action === 'SUBSTITUTIONS') {
        this.applyBulkSubstitutions(payloadData.substitutions); 
      }
    }
  }
});

function initializeHomeTeam(this: any, settingsStore: SettingsStore) {
  this.match.homeTeam = {
    activatedTimer: settingsStore.enableHomePlayersTime,
    name: this.match.homeTeam.name ? this.match.homeTeam.name : settingsStore.homeTeamName,
    id: this.match.homeTeam.id ? this.match.homeTeam.id : '',
    category: this.match.homeTeam.category ? this.match.homeTeam.category : '',
    score: 0,
    timeOut1: false,
    timeOut2: false,
    players: Array.from({ length: settingsStore.maxPlayers }, (_, i) => {
      const playerNumber = i + 1;
      return {
        number: playerNumber,
        name: "",
        activeTime: 0,
        benchTime: 0,
        actualTime: 0,
        shotsEven: [],
        shotsSup: [],
        shotsPenalty: [],
        exclutions: [],
        shotsFaced: [],
        active: !settingsStore.enableHomePlayersTime,
        isGK: (playerNumber === 1 || playerNumber === 13),
      }
    }),
  };
}

function initializeAwayTeam(this: any, settingsStore: SettingsStore) {
  this.match.awayTeam = {
    activatedTimer: settingsStore.enableOppPlayersTime,
    id: "",
    name: "",
    category: "",
    score: 0,
    timeOut1: false,
    timeOut2: false,
    players: Array.from({ length: settingsStore.maxPlayers }, (_, i) => {
      const playerNumber = i + 1;
      return {
        number: playerNumber,
        name: "",
        activeTime: 0,
        benchTime: 0,
        actualTime: 0,
        shotsEven: [],
        shotsSup: [],
        shotsPenalty: [],
        exclutions: [],
        shotsFaced: [],
        active: !settingsStore.enableOppPlayersTime,
        isGK: (playerNumber === 1 || playerNumber === 13),
      }
    }),
  };
}


