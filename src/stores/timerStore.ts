import { defineStore } from 'pinia';
import { useGameStore } from './gameStore';
import { useSettingsStore } from './settingsStore';
import { useSessionStateStore } from './sessionStateStore';
import { timerPlay, timerStop } from '@/services/timerService';
import { useToast } from 'vue-toastification';

export const useTimerStore = defineStore('timerStore', {
  state: () => ({
    countdown: 480,
    currentQuarter: 1,
    isTimerRunning: false,
    isTimerMaster: localStorage.getItem("is_timer_master") === "true",
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
    setTimerMaster(data: any) {
      let isMaster = false;
      if(data.user_role === 'timekeeper') {
          isMaster = true;
      } else if(data.user_role === 'owner') {
          isMaster = true
      }
      this.isTimerMaster = isMaster;
      localStorage.setItem("is_timer_master", isMaster ? "true" : "false");
    },
    giveUpTimerMaster() {
      console.log("È entrato un Timekeeper. Cedo il controllo del tempo.");

      const timerStore = useTimerStore();
      timerStore.isTimerMaster = false;
      localStorage.setItem("is_timer_master", "false");

      // Opzionale: Mostra un Toast/Alert all'owner per avvisarlo!
      useToast().info("Non sei più il gestore del tempo!");
    },
    takeTimerMaster() {
      console.log("È uscito un Timekeeper. Prendo il controllo del tempo.");
      
      const timerStore = useTimerStore();
      timerStore.isTimerMaster = true;
      localStorage.setItem("is_timer_master", "true");
      
      // Opzionale: Mostra un Toast/Alert all'owner per avvisarlo!
      useToast().info("Sei diventato il nuovo gestore del tempo!")
    },
    setTimeFromString(timeString: string) {
      if (!timeString || !timeString.includes(':')) {
        console.warn("Formato tempo non valido ricevuto dal BE:", timeString);
        return;
      }

      // Dividiamo la stringa in un array [minuti, secondi] e li convertiamo in numeri
      const [minutes, seconds] = timeString.split(':').map(num => parseInt(num, 10));

      // Controllo di sicurezza nel caso arrivino stringhe sporche tipo "08:xx"
      if (isNaN(minutes) || isNaN(seconds)) {
        console.warn("Impossibile convertire il tempo:", timeString);
        return;
      }

      // Aggiorniamo il vero state numerico!
      this.countdown = (minutes * 60) + seconds;
    },
    // --- AZIONI MASTER (chiamate dai bottoni UI) ---
    async toggleGlobalTimer() {
      if (this.isTimerRunning) await this.masterStop();
      else await this.masterPlay();
    },

    async masterPlay() {
      if (this.isTimerRunning) return;
      this.runLocalTimer();
      const gameStore = useGameStore();
      const sessionStateStore = useSessionStateStore();
      const payload = {
        match_id: gameStore.match.id,
        sender_client_id: sessionStateStore.clientId,
        quarter: this.currentQuarter,
        time: this.formattedTime
      }
      await timerPlay(payload)
    },

    async masterStop() {
      if (!this.isTimerRunning) return;
      this.stopLocalTimer();
      const gameStore = useGameStore();
      const sessionStateStore = useSessionStateStore();
      const payload = {
        match_id: gameStore.match.id,
        sender_client_id: sessionStateStore.clientId,
        quarter: this.currentQuarter,
        time: this.formattedTime
      }
      await timerStop(payload);
    },

    async masterBack(seconds: number) {
      const settingsStore = useSettingsStore();
      const gameStore = useGameStore();
      
      this.countdown = Math.min(settingsStore.periodDuration * 60, this.countdown + seconds);
      gameStore.adjustPlayerTimes(-seconds); // Togliamo secondi alle stats
    },

    async masterForward(seconds: number) {
      const gameStore = useGameStore();

      this.countdown = Math.max(0, this.countdown - seconds);
      gameStore.adjustPlayerTimes(seconds); // Aggiungiamo secondi alle stats
    },

    removeQuarter() {
        this.currentQuarter = Math.min(1, this.currentQuarter - 1)
    },

    // --- LOGICA CONDIVISA (L'intervallo locale) ---
    runLocalTimer() {
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
    },

    resetTimer() {
      const settingsStore = useSettingsStore();
      this.stopLocalTimer();
      this.currentQuarter = 1;
      this.countdown = settingsStore.periodDuration * 60;
      this.isTimerRunning = true;
      if(this.isTimerMaster)
        this.masterStop();
    }
  }
});