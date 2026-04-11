import { defineStore } from "pinia";
import router from "@/router";
import type { Player } from "@/interfaces/Player";
import type { Event } from "@/interfaces/event/Event";
import type { Match } from "@/interfaces/Match";
import type { Exclution } from "@/interfaces/Exclution";
import { ShotCategory, ShotOutcome } from "@/enum/ShotDescription";
import { useSettingsStore, type SettingsStore } from "./settingsStore";
import { useSessionStateStore } from "./sessionStateStore";
import { FoulType } from "@/enum/ExclutionDescription";
import { useToast } from "vue-toastification";
import type { Shot } from "@/interfaces/Shot";
import type { Team } from "@/interfaces/Team";
import { MatchEventType } from "@/enum/MatchEventDescription";
import type { EventDetails } from "@/interfaces/event/EventDetails";
import { createNewPlayer, getAllTeams, getLastTeamRoster, getTeamRoster, getTeamsByName, updatePlayerName } from "@/services/matchService";
import type { TeamInfo } from "@/interfaces/TeamInfo";

export const useGameStore = defineStore("gameStore", {
  state: () => {
    const savedEvents = localStorage.getItem("events");
    const savedMatch = localStorage.getItem("match");
    return {
      countdown: 0,
      countdownInterval: null as number | null,
      isCorrectionMode: false,
      events: savedEvents ? (JSON.parse(savedEvents) as Event[]) : [],
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
        if (event.type == MatchEventType.GOAL && event.quarter <= 4) {
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
      this.countdown = settingsStore.periodDuration * 60;

      if (!this.match.homeTeam || this.match.homeTeam.players.length == 0) {
        initializeHomeTeam.call(this, settingsStore);
      }
      if (!this.match.awayTeam  || this.match.awayTeam.players.length == 0) {
        initializeAwayTeam.call(this, settingsStore);
      }
      if (!this.match.quarter || this.match.quarter == 0) {
        this.match.quarter = 1;
      }
      await this.saveData();
    },
    async updateMatch(opponentsTeam: string) {
      if (opponentsTeam) {
        this.match.awayTeam.name = opponentsTeam.toUpperCase();
        await this.saveData();
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
        el.active = true;
        el.actualTime = 0; // Reset del tempo per il nuovo ingresso
      } else {
        // 4. Disattivazione semplice
        if(!enablePlayersTime)
          return
        el.active = false;
        el.actualTime = 0; // Reset del tempo all'uscita
      }
      
      await this.saveData();
    },
    async saveOrUpdatePlayer(player: Player, isHomeTeam: boolean) {
      const sessionStateStore = useSessionStateStore();
      // 1. SCENARIO A: Il giocatore esiste già (Ha un ID) -> Facciamo UPDATE
      if (player.id) {
          await updatePlayerName(player.id, player.name)
          return;
      }

      // 2. SCENARIO B: Il giocatore è nuovo (ID è null) -> Facciamo CREATE
      const response = await createNewPlayer(sessionStateStore.matchId, isHomeTeam, player);
      const data = await response.json();
      player.id = data.id; 
  },
    startGlobalTimer() {
      const settingsStore = useSettingsStore();
      // 1. PULIZIA PREVENTIVA: evita che il tempo scorra al doppio della velocità
      this.stopGlobalTimer(); 
      // 2. UNICO INTERVALLO
      this.countdownInterval = window.setInterval(() => {
        // --- LOGICA CRONOMETRO GARA ---
        if (this.countdown > 0) {
          this.countdown--;
          // --- LOGICA STATISTICHE GIOCATORI ---
          // Facciamo avanzare i tempi dei giocatori SOLO se il cronometro sta scorrendo
          this.match.homeTeam.players.forEach((player) => {
            if (player.active) {
              player.activeTime++;
            } else {
              player.benchTime++;
            }
            player.actualTime++;
          });
          // Se hai anche la squadra ospite, aggiungila qui
          this.match.awayTeam.players.forEach((player) => {
            if (player.active) {
              player.activeTime++;
            } else {
              player.benchTime++;
            }
            player.actualTime++;
          });

        } else {
          // --- FINE PERIODO ---
          this.handleEndOfQuarter(settingsStore);
        }
        // Salvataggio automatico ogni secondo (opzionale, per persistenza PWA)
        // this.saveData();
      }, 1000);

    },
    handleEndOfQuarter(settingsStore: any) {
      this.stopGlobalTimer();
      if(this.match.quarter + 1 == 5)
        return
      this.match.quarter++;
      this.countdown = settingsStore.periodDuration * 60;
    },
    stopGlobalTimer() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
    },
    toggleGlobalTimer() {
      if (this.countdownInterval) {
        this.stopGlobalTimer();
      } else {
        this.startGlobalTimer();
      }
    },
    async resetAll() {
      this.match = {} as Match;
      this.events = [];
      this.stopGlobalTimer();
      await this.saveData();
      await this.loadStore();
      router.push("/game");
    },
    async clearDistinta() {
      this.match = {} as Match;
      await this.saveData();
      await this.loadStore();
    },
    resetTimer() {
      const settingsStore = useSettingsStore();
      this.match.quarter = 1;
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
      this.countdown = settingsStore.periodDuration * 60;
      this.events = [];
    },
    addShoot(
      number: number,
      team: number,
      type: ShotCategory,
      position: string,
      outcome: ShotOutcome,
    ) {
      var el;
      if (team === 0)
        el = this.match.homeTeam.players.find((el) => el.number === number);
      else el = this.match.awayTeam.players.find((el) => el.number === number);
      if (el) {
        switch (type) {
          case ShotCategory.EVEN:
            el.shotsEven.push({ position: position, outcome: outcome });
            break;
          case ShotCategory.SUP:
            el.shotsSup.push({ position: position, outcome: outcome });
            break;
          case ShotCategory.PENALTY:
            el.shotsPenalty.push({ position: position, outcome: outcome });
            break;
          default:
            break;
        }
        this.addShotFaced(number, team, type, position, outcome);
        switch (outcome) {
          case ShotOutcome.GOAL:
            this.addGoal(number, team, type, position, outcome);
            break;
          default:
            var description = outcome + " - " + type + ", " + position + " ";
            this.saveEvents(
              "Tiro - " + description,
              el,
              team === 0 ? this.match.homeTeam.name : this.match.awayTeam.name,
              MatchEventType.SHOT
            );
            break;
        }
      }
    },
    removeShot(number: number, team: number, type: ShotCategory) {
      var el;
      if (team === 0)
        el = this.match.homeTeam.players.find((el) => el.number === number);
      else el = this.match.awayTeam.players.find((el) => el.number === number);
      if (el) {
        switch (type) {
          case ShotCategory.EVEN:
            if (el.shotsEven[el.shotsEven.length - 1].outcome == ShotOutcome.GOAL)
              this.removeGoal(team);
            el.shotsEven.pop();
            break;
          case ShotCategory.SUP:
            if (el.shotsSup[el.shotsSup.length - 1].outcome == ShotOutcome.GOAL)
              this.removeGoal(team);
            el.shotsSup.pop();
            break;
          case ShotCategory.PENALTY:
            if (el.shotsPenalty[el.shotsPenalty.length - 1].outcome == ShotOutcome.GOAL)
              this.removeGoal(team);
            el.shotsPenalty.pop();
            break;
          default:
            break;
        }
        this.removeShotFaced(number, team, type)
        this.removeShootEvent(
          team === 0 ? this.match.homeTeam.name : this.match.awayTeam.name,
          el,
        );
        this.setCorrectionMode(false);
      }
    },
    removeShotFaced(number: number, team: number, type: ShotCategory) {
      var el;
      if (team === 0) {
        el = this.match.awayTeam.players.find((el) => el.isGK && el.active);
      } else {
        el = this.match.homeTeam.players.find((el) => el.isGK && el.active);
      }
      const index = el?.shotsFaced.findLastIndex(shot => shot.shooter === number && shot.type === type)
      if (index && index != -1) {
        el?.shotsFaced.splice(index, 1)
      }
    },
    addGoal(
      number: number,
      team: number,
      type: string,
      position: string,
      outcome: string,
    ) {
      var el;
      if (team === 0) {
        el = this.match.homeTeam.players.find((el) => el.number === number);
        this.match.homeTeam.score++;
      } else {
        el = this.match.awayTeam.players.find((el) => el.number === number);
        this.match.awayTeam.score++;
      }
      if (el) {
        var description = outcome + " - " + type + ", " + position + " ";
        this.saveEvents(
          description,
          el,
          team === 0 ? this.match.homeTeam.name : this.match.awayTeam.name,
          MatchEventType.GOAL
        );
      }
    },
    removeGoal(team: number) {
      if (team === 0) {
        this.match.homeTeam.score--;
      } else {
        this.match.awayTeam.score--;
      }
    },
    async addExclution(
      number: number,
      team: number,
      type: string,
      position: string,
      ball: boolean,
      earnedBy: number,
      exclNumber: number,
    ) {
      var el;
      el =
        team === 0
          ? this.match.homeTeam.players.find((el) => el.number === number)
          : this.match.awayTeam.players.find((el) => el.number === number);

      if (el) {
        if (el.exclutions.length <= exclNumber) {
          el.exclutions.push({
            position: position,
            type: type,
            ball: ball,
            quarter: this.match.quarter,
            earnedBy: earnedBy,
            time: this.formatTime(this.countdown),
          });
        } else {
          el.exclutions[exclNumber] = {
            position: position,
            type: type,
            ball: ball,
            quarter: this.match.quarter,
            earnedBy: earnedBy,
            time: this.formatTime(this.countdown),
          };
        }

        await this.saveEvents(
          type + " " + position + " " + (ball ? "Con palla" : "Senza palla"),
          el,
          team === 0 ? this.match.homeTeam.name : this.match.awayTeam.name,
          MatchEventType.FOUL,
        );

        if (this.isOut(el)) {
          el.active = false;
          el.actualTime = 0;
          await this.saveData();
        }
      }
    },
    isOut(player: Player): boolean {
      return (
        player.exclutions.length === 3 ||
        player.exclutions.some((excl) => excl.type === "EDCS")
      );
    },
    async removeExclution(number: number, team: number, exclNumber: number) {
      var el;
      el =
        team === 0
          ? this.match.homeTeam.players.find((el) => el.number === number)
          : this.match.awayTeam.players.find((el) => el.number === number);

      if (el) {
        if (el.exclutions[exclNumber]) {
          this.removeExclEvent(
            team === 0 ? this.match.homeTeam.name : this.match.awayTeam.name,
            el,
            el.exclutions[exclNumber],
          );
          el.exclutions.splice(exclNumber, 1);
        }
      }

      await this.saveData();
    },
    addShotFaced(number: number, team: number, type: string, position: string, outcome: string) {
      var el;
      if (team === 0) {
        el = this.match.awayTeam.players.find((el) => el.isGK && el.active);
      } else {
        el = this.match.homeTeam.players.find((el) => el.isGK && el.active);
      }
      el?.shotsFaced.push({ type: type, position: position, outcome: outcome, shooter: number });
    },
    async addTimeOut(number: number, team: string) {
      number === 1
        ? team === "HOME"
          ? (this.match.homeTeam.timeOut1 = true)
          : (this.match.awayTeam.timeOut1 = true)
        : team === "HOME"
          ? (this.match.homeTeam.timeOut2 = true)
          : (this.match.awayTeam.timeOut2 = true);
      await this.saveData();
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
      await this.saveData();
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
    async saveData() {
      localStorage.setItem("match", JSON.stringify(this.match));
      localStorage.setItem("events", JSON.stringify(this.events));
      // const sessionStore = useSessionStateStore();
      // await sessionStore.updateState(this.match, this.events);
    },
    formatTime(seconds: number) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds,
      ).padStart(2, "0")}`;
    },
    async saveData2() {
      // Salvataggio locale per persistenza in caso di refresh
      localStorage.setItem("match", JSON.stringify(this.match));
      localStorage.setItem("events", JSON.stringify(this.events));
      
      // COSTRUIAMO IL PAYLOAD LEGGERO PER IL REALTIME (Supabase Channel)
      const sessionStore = useSessionStateStore();
      
      const liveSessionPayload = {
        quarter: this.match.quarter,
        clock: this.formatTime(this.countdown),
        homeScore: this.match.homeTeam.score,
        awayScore: this.match.awayTeam.score,
        // Inviamo solo gli ID/Numeri dei giocatori in acqua
        activeHomePlayers: this.match.homeTeam.players.filter(p => p.active).map(p => p.number),
        activeAwayPlayers: this.match.awayTeam.players.filter(p => p.active).map(p => p.number)
      };

      // Invece di inviare i mega JSON, inviamo solo lo statino leggero!
      // await sessionStore.updateLiveState(liveSessionPayload);
},
    async saveEvents(description: string, player: Player, team: string, type: MatchEventType) {
      const event: Event = {
        team: team,
        player: player,
        time: this.formatTime(this.countdown),
        description: description,
        quarter: this.match.quarter,
        homeScore: this.match.homeTeam.score,
        awayScore: this.match.awayTeam.score,
        type: type,
      };
      this.events.push(event);
      await this.saveData();
    },
    async saveEvents2(
      player: Player, 
      team: string, 
      type: MatchEventType, 
      details?: EventDetails
    ) {
      // 1. Ricostruiamo la vecchia description testuale per compatibilità 
      // (così non rompiamo il Play-by-play visivo attuale)
      let description = type.toString();
      if (type === MatchEventType.SHOT || type === MatchEventType.GOAL) {
        description = `${details?.outcome} - ${details?.situation}, ${details?.position}`;
      } else if (type === MatchEventType.FOUL) {
        description = `${details?.situation} ${details?.position} ${details?.withBall ? "Con palla" : "Senza palla"}`;
      }

      // 2. Creiamo l'evento locale per la UI di Pinia (uguale a prima)
      const localEvent: Event = {
        team: team,
        player: player,
        time: this.formatTime(this.countdown),
        description: description,
        quarter: this.match.quarter,
        homeScore: this.match.homeTeam.score,
        awayScore: this.match.awayTeam.score,
        type: type,
      };
      this.events.push(localEvent);

      // 3. CREAZIONE DEL DTO LEGGERO PER IL BACKEND (Nuovo!)
      const backendEventDTO = {
        // Nota: Aggiungi matchId se lo hai salvato nello store
        quarter: this.match.quarter,
        time: localEvent.time,
        teamName: team, // o teamId se lo possiedi
        playerNumber: player.number,
        type: type,
        situation: details?.situation || null,
        outcome: details?.outcome || null,
        position: details?.position || null,
        withBall: details?.withBall ?? null
      };

      // 4. CHIAMATA AL BACKEND (Delegata al servizio API)
      // await apiService.postEvent(backendEventDTO);

      // 5. Aggiornamento stato effimero
      await this.saveData();
    },
    async removeExclEvent(team: string, player: Player, excl: Exclution) {
      const index = this.events.findIndex(
        (e) =>
          e.team == team &&
          e.player.number == player.number &&
          e.time == excl.time &&
          e.quarter == excl.quarter,
      );
      if (index != -1) {
        this.events.splice(index, 1);
      }
      await this.saveData();
    },
    async removeShootEvent(team: string, player: Player) {
      const index = this.events.findLastIndex(
        (e) =>
          e.team == team &&
          e.player.number == player.number &&
          (e.description.startsWith("Tiro") ||
            e.description.startsWith("Goal")),
      );
      if (index != -1) {
        this.events.splice(index, 1);
      }
      await this.saveData();
    },
    async back(seconds: number) {
      const settingsStore = useSettingsStore();
      this.countdown = Math.min(settingsStore.periodDuration * 60, this.countdown + seconds);
      this.match.homeTeam.players.forEach((player) => {
        if (player.active) {
          player.activeTime = Math.max(0, player.activeTime - seconds);
        } else {
          player.benchTime = Math.max(0, player.benchTime - seconds);
        }
        player.actualTime = Math.max(0, player.actualTime - seconds);
      });
      await this.saveData();
    },
    async forward(seconds: number) {
      const settingsStore = useSettingsStore();
      this.countdown = Math.max(0, this.countdown - seconds);
      this.match.homeTeam.players.forEach((player) => {
        if (player.active) {
          player.activeTime = Math.min(settingsStore.periodDuration * 60 * settingsStore.totalPeriods, player.activeTime + seconds);
        } else {
          player.benchTime = Math.min(settingsStore.periodDuration * 60 * settingsStore.totalPeriods, player.benchTime + seconds);
        }
        player.actualTime = Math.min(settingsStore.periodDuration * 60 * settingsStore.totalPeriods, player.actualTime + seconds);
      });
      await this.saveData();
    },
    toggleCorrectionMode() {
      this.isCorrectionMode = !this.isCorrectionMode;
    },
    setCorrectionMode(value: boolean) {
      this.isCorrectionMode = value;
    },
    removeQuarter() {
      this.match.quarter = Math.min(1, this.match.quarter - 1)
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
      const sessionStateStore = useSessionStateStore()
      const response = await getLastTeamRoster(teamId, sessionStateStore.matchId);
      const data = await response.json();
      return data;
    },
    async getAllTeams(): Promise<TeamInfo[]> {
      const response = await getAllTeams();
      const data = await response.json();
      return data;
    }
  },
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
