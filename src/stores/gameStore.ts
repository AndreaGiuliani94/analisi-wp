import { defineStore, type Store } from "pinia";
import router from "@/router";
import type { Player } from "@/interfaces/Player";
import type { MatchEvent } from "@/interfaces/MatchEvent";
import type { Match } from "@/interfaces/Match";
import type { Exclution } from "@/interfaces/Exclution";
import { ShotCategory, ShotOutcome } from "@/enum/ShotDescription";
import { useSettingsStore, type SettingsStore } from "./settingsStore";
import { EDCSType, FoulPosition, FoulType } from "@/enum/ExclutionDescription";
import { useToast } from "vue-toastification";
import type { Shot } from "@/interfaces/Shot";
import type { Team } from "@/interfaces/Team";
import { MatchEventType } from "@/enum/MatchEventDescription";
import { createNewTeam, getAllTeams, getLastTeamRoster, getTeamRoster, getTeamsByName, savePregameSetup, updatePlayer, updateSubstitutions } from "@/services/matchService";
import type { TeamInfo } from "@/interfaces/TeamInfo";
import type { NewPlayer } from "@/interfaces/NewPlayer";
import { deleteMatchEvent, saveMatchEvent } from "@/services/eventService";
import { applyStatsToPlayer, convertDbEventToUI, refactorSaveEventPayload } from "@/utils/converter";
import { useTimerStore } from "./timerStore";
import type { Substitutions } from "@/interfaces/Substitutions";

const myClientId = crypto.randomUUID();

export const useGameStore = defineStore("gameStore", {
  state: () => {
    const savedEvents = localStorage.getItem("events");
    const savedMatch = localStorage.getItem("match");
    return {
      isCorrectionMode: false,
      pendingSubstitutions: [] as Substitutions[],
      subsTimeoutId: null as any,
      events: savedEvents ? (JSON.parse(savedEvents) as MatchEvent[]) : [],
      match: savedMatch ? (JSON.parse(savedMatch) as Match) : ({} as Match),
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
        if (el.exclutions.length >= 3 || el.exclutions.findIndex(excl => excl.type === FoulType.EDCS) != -1) {
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
            sender_client_id: myClientId,
            time: timerStore.formattedTime,
            quarter: timerStore.currentQuarter,
            substitutions: payload 
        });
      } catch (error) {
        console.error("Errore salvataggio cambi:", error);
      }
    },
    /**
     * Chiamato 1 volta al secondo dal timerStore.
     * Incrementa i contatori temporanei di chi è in vasca e chi è in panchina.
     */
    tickPlayerTimes() {
      const updateTimes = (team: Team) => {
        team.players.forEach((p: Player) => {
          if (p.active) {
            p.activeTime = (p.activeTime || 0) + 1;
            p.actualTime = (p.actualTime || 0) + 1;
          } else {
            p.benchTime = (p.benchTime || 0) + 1;
          }
        });
      };

      updateTimes(this.match.homeTeam);
      updateTimes(this.match.awayTeam);
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
    async resetAll() {
      this.match = {} as Match;
      this.events = [];
      // this.stopGlobalTimer();
      await this.loadStore();
      router.push("/game");
    },
    async clearDistinta() {
      this.match = {} as Match;
      await this.loadStore();
    },
    resetTimer() {
      const settingsStore = useSettingsStore();
      this.match.homeTeam.score = 0;
      this.match.homeTeam.timeOut1 = false;
      this.match.homeTeam.timeOut2 = false;
      this.match.homeTeam.players.forEach((player) => {
        player.activeTime = 0;
        player.actualTime = 0;
        player.benchTime = 0;
        player.exclutions = [];
        player.shotsEven = [];
        player.shotsSup = [];
        player.shotsPenalty = [];
        player.shotsFaced = [];
        player.active = !settingsStore.enableHomePlayersTime;
        player.isGK =
          player.number === 1 || player.number === 13 ? true : false;
      });
      this.match.awayTeam.score = 0;
      this.match.awayTeam.timeOut1 = false;
      this.match.awayTeam.timeOut2 = false;
      this.match.awayTeam.players.forEach((player) => {
        player.activeTime = 0;
        player.actualTime = 0;
        player.benchTime = 0;
        player.exclutions = [];
        player.shotsEven = [];
        player.shotsSup = [];
        player.shotsPenalty = [];
        player.shotsFaced = [];
        player.active = !settingsStore.enableOppPlayersTime;
        player.isGK =
          player.number === 1 || player.number === 13 ? true : false;
      });
      this.events = [];
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

      // 2. Aggiornamento Statistiche Giocatore 
      const shotData = { position, outcome };
      const targetArray = {
        [ShotCategory.EVEN]: player.shotsEven,
        [ShotCategory.SUP]: player.shotsSup,
        [ShotCategory.PENALTY]: player.shotsPenalty,
        [ShotCategory.OUTCOME]: null
      }[type];

      if (targetArray) targetArray.push(shotData);

      // 3. Statistiche Portiere Avversario
      const opposingTeam = team === 0 ? this.match.awayTeam : this.match.homeTeam;
      const activeGoalkeeper = opposingTeam.players.find((p: any) => p.isGK && p.active);
      const gkId = activeGoalkeeper ? activeGoalkeeper.id : undefined;
      activeGoalkeeper?.shotsFaced.push({ type: type, position: position, outcome: outcome, shooter: number });

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

      // 1. Individuiamo l'array corretto tramite mappa dinamica
      const targetArray = {
        [ShotCategory.EVEN]: player.shotsEven,
        [ShotCategory.SUP]: player.shotsSup,
        [ShotCategory.PENALTY]: player.shotsPenalty,
        [ShotCategory.OUTCOME]: null
      }[type];

      // 2. Assicuriamoci che ci sia almeno un tiro da rimuovere
      if (targetArray && targetArray.length > 0) {
        
        // Controlliamo se l'ultimo tiro registrato era un GOAL
        const lastShot = targetArray[targetArray.length - 1];
        if (lastShot.outcome === ShotOutcome.GOAL) {
          this.removeGoal(team);
        }
        // Rimuoviamo effettivamente l'ultimo tiro dall'array
        targetArray.pop();
      }

      // 3. Rimuoviamo il tiro subito dal portiere avversario
      this.removeShotFaced(number, team, type);
      // 4. Rimuoviamo l'evento dalla cronaca
      this.removeShotEvent(player);
      // 5. Chiudiamo la modalità correzione
      this.setCorrectionMode(false);
    },
    removeShotFaced(number: number, team: number, type: ShotCategory) {
      // Se ha tirato la squadra 'team', cerchiamo il portiere dell'altra squadra
      const opposingTeam = team === 0 ? this.match.awayTeam : this.match.homeTeam;
      const goalkeeper = opposingTeam.players.find((p: any) => p.isGK && p.active);

      if (!goalkeeper || !goalkeeper.shotsFaced) return;

      // Troviamo l'ultimo tiro affrontato da QUESTO tiratore in QUESTA categoria
      const index = goalkeeper.shotsFaced.findLastIndex(
        (shot: any) => shot.shooter === number && shot.type === type
      );

      // FIX: Controlliamo solo che sia diverso da -1. (0 è un indice validissimo!)
      if (index !== -1) {
        goalkeeper.shotsFaced.splice(index, 1);
      }
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
          event.player.id === player.id && 
          (event.eventType === MatchEventType.SHOT)
      );
      if (index !== -1) {
        // 1. Estrapoliamo l'ID dell'evento generato dal DB
        const eventId = this.events[index].id;

        // 2. Optimistic UI: Rimuoviamo istantaneamente il tiro dalla UI
        this.events.splice(index, 1);

        // 3. Chiamata al BE
        if (eventId) {
          try {
            // Passiamo l'ID e il myClientId per la deduplicazione!
            await deleteMatchEvent(eventId, myClientId); 
          } catch (error) {
            console.error("Errore durante l'eliminazione dell'evento:", error);
            // Opzionale: gestire un "rollback" visivo reinserendo l'evento se fallisce la cancellazione
          }
        } else {
          console.warn("Impossibile eliminare a DB: Evento sprovvisto di ID");
        }
      }
    },
    addExclution(
      number: number,
      team: number,
      type: FoulType,
      position: FoulPosition,
      ball: boolean,
      earnedBy: number,
      exclNumber: number,
    ) {
      // 1. Identificazione delle squadre e del giocatore autore del fallo
      const currentTeam = team === 0 ? this.match.homeTeam : this.match.awayTeam;
      const opposingTeam = team === 0 ? this.match.awayTeam : this.match.homeTeam;
      const player = currentTeam.players.find((p: any) => p.number === number);
      // Uscita di sicurezza se il giocatore non viene trovato
      if (!player) return;

      // 2. Recupero ID del giocatore che ha GUADAGNATO l'espulsione (Centro boa / attaccante)
      // Se earnedBy è 0 (la nostra opzione "?" generica), earnedById rimarrà null
      let earnedById = undefined;
      if (earnedBy && earnedBy !== 0) {
        const victimPlayer = opposingTeam.players.find((p: any) => p.number === earnedBy);
        if (victimPlayer && victimPlayer.id) {
          earnedById = victimPlayer.id;
        }
      }

      // 3. Aggiornamento dello statino locale del giocatore
      const exclusionData = {
        position: position,
        type: type,
        ball: ball,
        quarter: useTimerStore().currentQuarter,
        earnedBy: earnedBy,
        time: useTimerStore().formattedTime,
      };

      // Logica sicura per inserimento/sovrascrittura (Correction Mode)
      if (player.exclutions.length <= exclNumber) {
        player.exclutions.push(exclusionData);
      } else {
        player.exclutions[exclNumber] = exclusionData;
      }

      // 4. Salvataggio dell'evento con la nuova struttura DB!
      this.saveEvent({
        eventType: MatchEventType.FOUL,
        currentTeam: currentTeam,
        player: player,
        details: {
          foulType: type,
          foulPosition: position,
          foulWithBall: ball,
          earnedByPlayerId: earnedById,
        }
      });

      if (this.isOut(player)) {
        player.active = false;
        player.actualTime = 0;
      }
    },
    addEDCS(
      number: number,
      team: number,
      type: FoulType,
      edcsType: EDCSType,
      exclNumber: number,
    ) {
      // 1. Identificazione delle squadre e del giocatore autore del fallo
      const currentTeam = team === 0 ? this.match.homeTeam : this.match.awayTeam;
      const player = currentTeam.players.find((p: any) => p.number === number);
      // Uscita di sicurezza se il giocatore non viene trovato
      if (!player) return;

      // 3. Aggiornamento dello statino locale del giocatore
      const exclusionData = {
        type: type,
        edcsType: edcsType,
        quarter: useTimerStore().currentQuarter,
        time: useTimerStore().formattedTime,
      };

      // Logica sicura per inserimento/sovrascrittura (Correction Mode)
      if (player.exclutions.length <= exclNumber) {
        player.exclutions.push(exclusionData);
      } else {
        player.exclutions[exclNumber] = exclusionData;
      }

      // 4. Salvataggio dell'evento con la nuova struttura DB!
      this.saveEvent({
        eventType: MatchEventType.FOUL,
        currentTeam: currentTeam,
        player: player,
        details: {
          foulType: type,
          edcsType: edcsType
        }
      });

      if (this.isOut(player)) {
        player.active = false;
        player.actualTime = 0;
      }
    },
    isOut(player: Player): boolean {
      return (
        player.exclutions.length === 3 ||
        player.exclutions.some((excl) => excl.type === "EDCS")
      );
    },
    async removeExclution(number: number, team: number, exclNumber: number) {
      // 1. Identificazione sicura
      const currentTeam = team === 0 ? this.match.homeTeam : this.match.awayTeam;
      const player = currentTeam.players.find((p: any) => p.number === number);
      if (!player) return;
      const exclusionToRemove = player.exclutions[exclNumber];

      // 2. Verifichiamo che il fallo da rimuovere esista davvero
      if (exclusionToRemove) {
        // Rimuoviamo l'evento dalla cronaca
        await this.removeExclEvent(player, exclusionToRemove);
        // Rimuoviamo il fallo dallo statino del giocatore
        player.exclutions.splice(exclNumber, 1);
        // Riattiviamo il giocatore
        if (!this.isOut(player)) {
          player.active = true;
        }
      }
    },
    async removeExclEvent(player: Player, excl: Exclution) {
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
          await deleteMatchEvent(eventToRemove.id, myClientId);
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
      var totalShots = [];
      totalShots.push(
        ...player.shotsEven,
        ...player.shotsSup,
        ...player.shotsPenalty,
      );
      var totalGoals = totalShots.filter(
        (shot) => shot.outcome.toUpperCase() === "GOAL",
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
          ...player.shotsEven,
          ...player.shotsSup,
          ...player.shotsPenalty,
        );
      });
      return totalShots.length;
    },
    getAllSaves(player: Player) {
      var totalShots = player.shotsFaced.filter(shot => shot.outcome === ShotOutcome.SAVED || shot.outcome === ShotOutcome.GOAL).length;
      var totalSaves = player.shotsFaced.filter(shot => shot.outcome === ShotOutcome.SAVED).length;
      return {
        saves: totalSaves,
        shots: totalShots
      }
      
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
        const res = await saveMatchEvent(refactorSaveEventPayload(myClientId, newEvent)); // La tua POST

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
      var totalShots: Shot[] = [];
      var players = (team.name === settingsStore.homeTeamName) ? this.match.homeTeam.players : this.match.awayTeam.players;
      switch(type) {
        case ShotCategory.EVEN:
          players.forEach(pl => totalShots.push(...pl.shotsEven));
          break;
        case ShotCategory.SUP:
          players.forEach(pl => totalShots.push(...pl.shotsSup));
          break;
        case ShotCategory.PENALTY:
          players.forEach(pl => totalShots.push(...pl.shotsPenalty));
          break;
        case ShotCategory.OUTCOME:
        default:
          players.forEach(pl => totalShots.push(
            ...pl.shotsEven,
            ...pl.shotsSup,
            ...pl.shotsPenalty,));
          break

    }
    var totalGoals = totalShots.filter(shot => shot.outcome.toUpperCase() === ShotOutcome.GOAL.toUpperCase() );
    var totalParati = totalShots.filter(shot => shot.outcome.toUpperCase() === ShotOutcome.SAVED.toUpperCase() );
    var totalFuori = totalShots.filter(shot => shot.outcome.toUpperCase() === ShotOutcome.MISSED.toUpperCase() );
    var totalStoppati = totalShots.filter(shot => shot.outcome.toUpperCase() === ShotOutcome.BLOCKED.toUpperCase() );
    return {
        goals: totalGoals,
        shots: totalShots,
        parati: totalParati,
        fuori: totalFuori,
        stoppati: totalStoppati
      }
    },
    getAllExclutionsEarned(team: Team, player: Player) {
      const settings = useSettingsStore()
      const opponentTeam = team.name === settings.homeTeamName 
        ? this.match.awayTeam 
        : this.match.homeTeam;

      const allOpponentExclutions = opponentTeam.players.flatMap(oppPlayer => 
        oppPlayer.exclutions.map(excl => ({
          ...excl, 
          earnedOn: oppPlayer.name 
        }))
      );

      return allOpponentExclutions.filter(excl => excl.earnedBy === player.number);
    },
    getOpponentsPlayerName(team: Team, number: number) {
      const settings = useSettingsStore()
      if(team.name == settings.homeTeamName)
        return this.match.awayTeam.players.find(player => player.number === number)?.name
      else
        this.match.homeTeam.players.find(player => player.number === number)?.name
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
    enableAutoSave() {
      // Il $subscribe "ascolta" ogni singola mutazione dello state
      this.$subscribe((mutation, state) => {
        
        if (state.match) {
            localStorage.setItem("match", JSON.stringify(state.match));
        }

        if (state.events) {
            localStorage.setItem("events", JSON.stringify(state.events));
        }
        
      }, { 
        // L'opzione detached: true è FONDAMENTALE. 
        // Dice a Pinia di mantenere in vita questo "watch" anche se 
        // il componente che lo ha attivato viene distrutto (cambio pagina).
        detached: true 
      });

      console.log("Auto-salvataggio locale attivato!");
    },
    /**
     * Funzione chiamata dal Socket Listener quando arriva un broadcast
     */
    handleIncomingBroadcast(broadcastData: any) {
      // 1. DEDUPLICAZIONE: Controlliamo se siamo stati noi a generare l'evento
      if (broadcastData.sender_client_id === myClientId) {
        console.log("Broadcast ignorato: sono il mittente.");
        return; 
      }
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

        if (playerTarget) {
          applyStatsToPlayer(
            playerTarget, 
            payloadData.playerStats, 
            opposingTeam, 
            (p) => this.isOut(p) 
          );
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
