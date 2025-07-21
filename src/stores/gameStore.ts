import { defineStore, type Store } from "pinia";
import * as XLSX from "xlsx";
import router from "@/router";
import type { Player } from "@/components/Interfaces/Player";
import type { Event } from "@/components/Interfaces/Event";
import type { Match } from "@/components/Interfaces/Match";
import type { Exclution } from "@/components/Interfaces/Exclution";
import { ShotCategory, ShotOutcome } from "@/enum/ShotDescription";
import { useSettingsStore, type SettingsStore } from "./settingsStore";
import { useSessionStateStore } from "./sessionStateStore";

export const useGameStore = defineStore("elementStore", {
  state: () => {
    const savedEvents = localStorage.getItem("events");
    const savedMatch = localStorage.getItem("match");
    return {
      opponentsTeamName: '',
      globalInterval: null as number | null,
      activeCount: 0,
      activeOppCount: 0,
      countdown: 0,
      countdownInterval: null as number | null,
      events: savedEvents ? JSON.parse(savedEvents) as Event[] : [],
      match: savedMatch ? JSON.parse(savedMatch) as Match : {} as Match,
    };
  },
  getters: {
    actualPlayers: (state) =>
      state.match.homeTeam?.players.filter((player) => player.name.length > 0),
    actualOpponents: (state) =>
      state.match.awayTeam?.players.filter((player) => player.name.length > 0),
  },
  actions: {
    loadStore() {
      const settingsStore = useSettingsStore();
      this.countdown = settingsStore.periodDuration * 60;
      
      if(!this.match.homeTeam) {
        initializeHomeTeam.call(this, settingsStore);
      }
      if(!this.match.awayTeam) {
        initializeAwayTeam.call(this, settingsStore);
      }
      if(this.match.quarter == 0) {
        this.match.quarter = 1;
      }
      this.saveData();
    },
    updateMatch(opponentsTeam: string) {
      if (opponentsTeam) {
        this.match.awayTeam.name = opponentsTeam.toUpperCase();
        this.saveData();
      }
    },
    toggleElement(number: number, team: number) {
      var el;
      if (team === 0) {
        el = this.match.homeTeam.players.find((el) => el.number === number);
        if (el) {
          el.active = !el.active;
          this.activeCount = this.match.homeTeam.players.filter((e) => e.active).length;
        }
        if (this.activeCount > 7) {
          if (el) el.active = false;
          this.activeCount--;
        } else if (el?.exclutions.length == 3) {
          if (el) el.active = false;
          if (el) el.actualTime = 0;
          this.activeCount--;
        } else {
          if (el) el.actualTime = 0;
        }
      } else {
        el = this.match.awayTeam.players.find((el) => el.number === number);
        if (el) {
          el.active = !el.active;
          this.activeOppCount = this.match.awayTeam.players.filter((e) => e.active).length;
        }
        if (this.activeOppCount > 7) {
          if (el) el.active = false;
          this.activeOppCount--;
        } else if (el?.exclutions.length == 3) {
          if (el) el.active = false;
          if (el) el.actualTime = 0;
          this.activeOppCount--;
        } else {
          if (el) el.actualTime = 0;
        }
      }
      this.saveData();
    },
    updatePlayerName(number: number, name: string, team: number) {
      var el;
      if (team === 0) el = this.match.homeTeam.players.find((el) => el.number === number);
      else el = this.match.awayTeam.players.find((el) => el.number === number);
      if (el) {
        el.name = name;
        this.saveData();
      }
    },
    startGlobalTimer() {
      if (this.activeCount === 7 && /* (this.opponentsTimerActivated && this.activeOppCount === 7) && */ !this.globalInterval) {
        this.globalInterval = window.setInterval(() => {
          this.match.homeTeam.players.forEach((el) => {
            if (el.active) {
              el.activeTime++;
            } else {
              el.benchTime++;
            }
            el.actualTime++;
          });
        }, 1000);
      }
      if (!this.countdownInterval) {
        this.countdownInterval = window.setInterval(() => {
          if (this.countdown > 1) {
            this.countdown--;
          } else {
            this.countdown = 480;
            this.match.quarter++;
            this.stopGlobalTimer();
          }
        }, 1000);
      }
    },
    stopGlobalTimer() {
      if (this.globalInterval !== null) {
        clearInterval(this.globalInterval);
        this.globalInterval = null;
      }
      if (this.countdownInterval !== null) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
    },
    toggleGlobalTimer() {
      if (this.globalInterval) {
        this.stopGlobalTimer();
      } else {
        this.startGlobalTimer();
      }
    },
    resetAll() {
      this.match = {} as Match;
      this.events = [];
      this.activeCount = 0;
      this.activeOppCount = 0;
      this.stopGlobalTimer();
      this.saveData();
      this.loadStore();
      router.push("/game");
    },
    clearDistinta() {
      this.match = {} as Match;
      this.saveData();
      this.loadStore();
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
        player.active = false;
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
        player.active = !settingsStore.enableOppTime;
      });
      this.countdown = settingsStore.periodDuration * 60;
      this.events = [];
    },
    addShoot(number: number, team: number, type: ShotCategory, position: string, outcome: ShotOutcome) {
      var el;
      if (team === 0) el = this.match.homeTeam.players.find((el) => el.number === number);
      else el = this.match.awayTeam.players.find((el) => el.number === number);
      if (el) {
        switch (type) {
          case ShotCategory.EVEN:
            el.shotsEven.push({position: position, outcome: outcome});
            break;
          case ShotCategory.SUP:
            el.shotsSup.push({position: position, outcome: outcome});
            break;
          case ShotCategory.PENALTY:
            el.shotsPenalty.push({position: position, outcome: outcome});
            break;
          default:
            break;
        }
        switch (outcome) {
          case ShotOutcome.GOAL:
            this.addGoal(number, team, type, position, outcome);
            break;
          default:
            var description = outcome + " - " + type + ", " + position + " "; 
            this.saveEvents("Tiro - " + description, el, (team===0 ? this.match.homeTeam.name : this.match.awayTeam.name));
            break;
        }
      }
    },
    addGoal(number: number, team: number, type: string, position: string, outcome: string) {
      var el;
      if (team === 0) {
        el = this.match.homeTeam.players.find((el) => el.number === number);
        this.match.homeTeam.score++;
      }
      else {
        el = this.match.awayTeam.players.find((el) => el.number === number);
        this.match.awayTeam.score++;
      }
      if (el) {
        var description = outcome + " - " + type + ", " + position + " "; 
        this.saveEvents(description, el, (team===0 ? this.match.homeTeam.name : this.match.awayTeam.name));
      }
    },
    addExclution(number: number, team: number, type: string, position: string, ball: boolean, exclNumber: number) {
      var el;
      el = (team === 0) ? this.match.homeTeam.players.find((el) => el.number === number) : this.match.awayTeam.players.find((el) => el.number === number) ;
      
      if (el) {
        if(el.exclutions.length <= exclNumber) {
          el.exclutions.push({
            position: position,
            type: type,
            ball: ball,
            quarter: this.match.quarter,
            time: this.formatTime(this.countdown)
          })
        } else {
          el.exclutions[exclNumber] = {
            position: position, 
            type: type,
            ball: ball,
            quarter: this.match.quarter,
            time: this.formatTime(this.countdown)
          }
        }
        
        this.saveEvents(type + ' ' + position + ' ' + (ball ? 'Con palla' : 'Senza palla'), el, (team===0 ? this.match.homeTeam.name : this.match.awayTeam.name));
        
        if (this.isOut(el)) {
        this.toggleElement(el.number, team);
        if (this.activeCount != 7) 
          this.stopGlobalTimer;
      }
      }
    },
    isOut(player: Player): boolean {
      return player.exclutions.length === 3 || player.exclutions.some(excl => excl.type==="EDCS")
    },
    removeExclution(number: number, team: number, exclNumber: number) {
      var el;
      el = (team === 0) ? this.match.homeTeam.players.find((el) => el.number === number) : this.match.awayTeam.players.find((el) => el.number === number) ;
      
      if (el) {
        if(el.exclutions[exclNumber]) {
          this.removeEvent((team===0 ? this.match.homeTeam.name : this.match.awayTeam.name), el, el.exclutions[exclNumber])
          el.exclutions.splice(exclNumber, 1)
        }
      }

      this.saveData();
    },
    addTimeOut(number: number, team: string) {
      number === 1 ? (team === 'HOME' ? this.match.homeTeam.timeOut1 = true : this.match.awayTeam.timeOut1 = true ) :  (team === 'HOME' ? this.match.homeTeam.timeOut2 = true : this.match.awayTeam.timeOut2 = true );
      this.saveData();
    },
    toggleTimeOut(number: number, team: string) {
      if(team === 'HOME') {
        number === 1 ? ( this.match.homeTeam.timeOut1 = !this.match.homeTeam.timeOut1 ) : ( this.match.homeTeam.timeOut2 = !this.match.homeTeam.timeOut2 )
      } else {
        number === 1 ? ( this.match.awayTeam.timeOut1 = !this.match.awayTeam.timeOut1 ) : ( this.match.awayTeam.timeOut2 = !this.match.awayTeam.timeOut2 )
      }
      this.saveData();
    },
    getAllShoots(player: Player) {
      var totalShots = [];
      totalShots.push(...player.shotsEven, ...player.shotsSup, ...player.shotsPenalty)
      var totalGoals = totalShots.filter(shot => shot.outcome.toUpperCase() === 'GOAL' )
      return {
        goals: totalGoals.length,
        shots: totalShots.length
      }
    },
    async saveData() {
      localStorage.setItem("match", JSON.stringify(this.match));
      localStorage.setItem("events", JSON.stringify(this.events));
      const sessionStore = useSessionStateStore();
      await sessionStore.updateState(this.match, this.events);
    },
    formatTime(seconds: number) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
      ).padStart(2, "0")}`;
    },
    exportToExcel(dataToExport: any) {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, "players.xlsx");
    },
    saveEvents(description: string, player: Player, team: string) {
      const event: Event = {
        team: team,
        player: player,
        time: this.formatTime(this.countdown),
        description: description,
        quarter: this.match.quarter,
      };
      this.events.push(event);
      this.saveData();
    },
    removeEvent(team: string, player: Player, excl: Exclution) {
      const index = this.events.findIndex(e => e.team == team && e.player.number == player.number && e.time == excl.time && e.quarter == excl.quarter);
      if(index != -1) {
        this.events.splice(index, 1);
      }
      this.saveData();
    },
    back(seconds: number) {
      this.countdown += seconds;
      this.match.homeTeam.players.forEach((player) => {
        if (player.active) {
          player.activeTime -= seconds;
          player.actualTime -= seconds;
        } else {
          player.benchTime -= seconds;
          player.actualTime -= seconds;
        }
      });
      this.saveData();
    },
    forward(seconds: number) {
      this.countdown -= seconds;
      this.match.homeTeam.players.forEach((player) => {
        if (player.active) {
          player.activeTime += seconds;
          player.actualTime += seconds;
        } else {
          player.benchTime += seconds;
          player.actualTime += seconds;
        }
      });
      this.saveData();
    },
  },
});

function initializeHomeTeam(this: any, settingsStore: SettingsStore) {
  this.match.homeTeam = {
    activatedTimer: true,
    name: settingsStore.homeTeamName,
    score: 0,
    timeOut1: false,
    timeOut2: false,
    players: Array.from({ length: settingsStore.maxPlayers }, (_, i) => ({
      number: i + 1,
      name: "",
      activeTime: 0,
      benchTime: 0,
      actualTime: 0,
      shotsEven: [],
      shotsSup: [],
      shotsPenalty: [],
      exclutions: [],
      active: false,
    }))
  };
}

function initializeAwayTeam(this: any, settingsStore: SettingsStore) {
  this.match.awayTeam = {
    activatedTimer: settingsStore.enableOppTime,
    name: '',
    score: 0,
    timeOut1: false,
    timeOut2: false,
    players: Array.from({ length: settingsStore.maxPlayers }, (_, i) => ({
      number: i + 1,
      name: "",
      activeTime: 0,
      benchTime: 0,
      actualTime: 0,
      shotsEven: [],
      shotsSup: [],
      shotsPenalty: [],
      exclutions: [],
      active: !settingsStore.enableOppTime,
    }))
  };
}

