import { defineStore } from "pinia";
import * as XLSX from "xlsx";
import router from "@/router";
import type { Player } from "@/components/Interfaces/Player";
import type { Event } from "@/components/Interfaces/Event";
import type { Match } from "@/components/Interfaces/Match";
import { computed } from "vue";

export const useElementStore = defineStore("elementStore", {
  state: () => {
    const savedPlayers = localStorage.getItem("players");
    const savedEvents = localStorage.getItem("events");
    const savedMatch = localStorage.getItem("match");
    return {
      players: savedPlayers ? (JSON.parse(savedPlayers) as Player[]) : [],
      globalInterval: null as number | null,
      activeCount: 0,
      countdown: 480,
      countdownInterval: null as number | null,
      events: savedEvents ? (JSON.parse(savedEvents) as Event[]) : [],
      match: savedMatch ? JSON.parse(savedMatch) : {},
    };
  },
  getters: {
    actualPlayers: (state) =>
      state.players.filter((player) => player.name.length > 0),
  },
  actions: {
    loadStore() {
      if (this.actualPlayers.length == 0) {
        this.players = Array.from({ length: 15 }, (_, i) => ({
          number: i + 1,
          name: "",
          activeTime: 0,
          benchTime: 0,
          actualTime: 0,
          shoots: 0,
          goals: 0,
          exclutions: 0,
          active: false,
        }));
      }
      this.saveData();
    },
    updateMatch(matchName: string) {
      if (matchName) {
        const match: Match = {
          name: matchName,
          quarter: 1,
        };
        this.match = match;
        this.saveData();
      }
    },
    toggleElement(number: number) {
      const el = this.players.find((el) => el.number === number);
      if (el) {
        el.active = !el.active;
        this.activeCount = this.players.filter((e) => e.active).length;
      }

      if (this.activeCount > 7) {
        if (el) el.active = false;
        this.activeCount--;
      } else if (el?.exclutions == 3) {
        if (el) el.active = false;
        if (el) el.actualTime = 0;
        this.activeCount--;
      } else {
        if (el) el.actualTime = 0;
      }
      this.saveData();
    },
    updatePlayerName(number: number, name: string) {
      const el = this.players.find((el) => el.number === number);
      if (el) {
        el.name = name;
        this.saveData();
      }
    },
    startGlobalTimer() {
      if (this.activeCount === 7 && !this.globalInterval) {
        this.globalInterval = window.setInterval(() => {
          this.players.forEach((el) => {
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
      this.players = [];
      this.match = {};
      this.events = [];
      this.activeCount = 0;
      this.countdown = 480;
      this.stopGlobalTimer();
      this.saveData();
      this.loadStore();
      router.push("/");
    },
    clearDistinta(){
      this.players = [];
      this.match.name = '';
      this.saveData();
      this.loadStore();
    },
    resetTimer() {
      this.match.quarter = 1;
      this.players.forEach(player => {
        player.activeTime = 0;
        player.actualTime = 0;
        player.benchTime = 0;
        player.exclutions = 0;
        player.goals = 0;
        player.shoots = 0;
        player.active = false;
      });
      this.countdown = 480;
      this.events = [];
    },
    addShoot(number: number) {
      const el = this.players.find((el) => el.number === number);
      if (el) {
        el.shoots++;
        this.saveEvents("SHOOT", el);
      }
    },
    addGoal(number: number) {
      const el = this.players.find((el) => el.number === number);
      if (el) {
        el.goals++;
        el.shoots++;
        this.saveEvents("GOAL", el);
      }
    },
    addExclution(number: number) {
      const el = this.players.find((el) => el.number === number);
      if (el) {
        el.exclutions++;
        this.saveEvents("EXCLUTION", el);
      }
      if (el?.exclutions == 3) {
        this.toggleElement(el.number);
        if(this.activeCount != 7) this.stopGlobalTimer;
      }
    },
    saveData() {
      localStorage.setItem("match", JSON.stringify(this.match));
      localStorage.setItem("events", JSON.stringify(this.events));
      localStorage.setItem("players", JSON.stringify(this.players));
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
    saveEvents(description: string, player: Player) {
      const event: Event = {
        player: player,
        time: this.formatTime(this.countdown),
        description: description,
        quarter: this.match.quarter,
      };
      this.events.push(event);
      this.saveData();
    },
    back(seconds: number) {
      this.countdown += seconds;
      this.players.forEach(player => {
        if(player.active) {
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
      this.players.forEach(player => {
        if(player.active) {
          player.activeTime += seconds;
          player.actualTime += seconds;
        } else {
          player.benchTime += seconds;
          player.actualTime += seconds;
        }
      });
      this.saveData();
    }

  },
});
