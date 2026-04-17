import { defineStore } from 'pinia';
import { useGameStore } from './gameStore';
import { useSettingsStore } from './settingsStore';
// import { playTimerApi, stopTimerApi } from '@/services/timerService'; // Le tue API

export const useTimerStore = defineStore('timerStore', {
  state: () => ({
    countdown: 480,
    currentQuarter: 1,
    isTimerRunning: false,
    isTimerMaster: false,
    timerInterval: null as any,
  }),

  getters: {
    formattedTime: (state) => {
      const minutes = Math.floor(state.countdown / 60);
      const remainingSeconds = state.countdown % 60;
      return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }
  },

  actions: {
    // --- AZIONI MASTER (chiamate dai bottoni UI) ---
    async toggleGlobalTimer() {
      if (this.isTimerRunning) await this.masterStop();
      else await this.masterPlay();
    },

    async masterPlay() {
      if (this.isTimerRunning) return;
      // await timerPlayApi({...}) --> Notifica gli Slave
      this.runLocalTimer();
    },

    async masterStop() {
      if (!this.isTimerRunning) return;
      this.stopLocalTimer();
      // await timerStopApi({...}) --> Notifica gli Slave e salva a DB
    },

    async masterBack(seconds: number) {
      const settingsStore = useSettingsStore();
      const gameStore = useGameStore();
      
      this.countdown = Math.min(settingsStore.periodDuration * 60, this.countdown + seconds);
      gameStore.adjustPlayerTimes(-seconds); // Togliamo secondi alle stats
      
      // await syncTimerApi(this.countdown, gameStore.getPlayerStats()); --> Sincronizza tutti
    },

    async masterForward(seconds: number) {
      const gameStore = useGameStore();

      this.countdown = Math.max(0, this.countdown - seconds);
      gameStore.adjustPlayerTimes(seconds); // Aggiungiamo secondi alle stats
      
      // await syncTimerApi(this.countdown, gameStore.getPlayerStats()); --> Sincronizza tutti
    },

    removeQuarter() {
        this.currentQuarter = Math.min(1, this.currentQuarter - 1)
    },

    // --- LOGICA CONDIVISA (L'intervallo locale) ---
    runLocalTimer() {
      this.stopLocalTimer(); // 1. PULIZIA PREVENTIVA (come avevi fatto tu!)
      this.isTimerRunning = true;
      const gameStore = useGameStore();

      this.timerInterval = window.setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
          
          // Diciamo al gameStore di avanzare le stats di 1 secondo
          gameStore.adjustPlayerTimes(1); 
        } else {
          this.handleEndOfQuarter();
        }
      }, 1000);
    },

    stopLocalTimer() {
      this.isTimerRunning = false;
      if (this.timerInterval !== null) {
        window.clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    handleEndOfQuarter() {
      const settingsStore = useSettingsStore();
      this.stopLocalTimer();
      
      // Evitiamo di andare oltre i tempi prestabiliti
      if (this.currentQuarter >= settingsStore.totalPeriods) return;
      
      this.currentQuarter++;
      this.countdown = settingsStore.periodDuration * 60;
    }
  }
});