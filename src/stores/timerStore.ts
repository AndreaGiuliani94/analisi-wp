import { defineStore } from 'pinia';
import { useGameStore } from './gameStore';
import { useSettingsStore } from './settingsStore';
import { useMatchStateStore } from './matchStateStore';
import { startPenalties, timerPlay, timerStop } from '@/services/timerService';
import { useToast } from 'vue-toastification';
import { matchPeriodToNumber, numberToMatchPeriod } from '@/const/consts';
import { MatchPeriod } from '@/enum/MatchPeriod';
import { useTimeFormat } from '@/composables/useTimeFormat';
const { formatMsToTimer } = useTimeFormat();

export const useTimerStore = defineStore('timerStore', {
  state: () => ({
    lastTickTime: 0,
    msAccumulator: 0,
    animationFrameId: null as any,
    countdown: 480000,
    currentPeriod: 1,
    isTimerRunning: false,
    isTimerMaster: localStorage.getItem("is_timer_master") === "true"
  }),

  getters: {
    formattedTime: (state) => {
      return formatMsToTimer(state.countdown, true);
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

    // --- AZIONI MASTER (chiamate dai bottoni UI) ---
    async toggleGlobalTimer() {
      if (this.isTimerRunning) await this.masterStop();
      else await this.masterPlay();
    },

    async masterPlay() {
      if (this.isTimerRunning) return;
      this.runLocalTimer();
      const gameStore = useGameStore();
      const matchStateStore = useMatchStateStore();
      const payload = {
        match_id: gameStore.match.id,
        sender_client_id: matchStateStore.clientId,
        period: numberToMatchPeriod[this.currentPeriod],
        time: this.countdown
      }
      await timerPlay(payload)
    },

    async masterStop() {
      if (!this.isTimerRunning) return;
      this.stopLocalTimer();
      const gameStore = useGameStore();
      const matchStateStore = useMatchStateStore();
      const payload = {
        match_id: gameStore.match.id,
        sender_client_id: matchStateStore.clientId,
        period: numberToMatchPeriod[this.currentPeriod],
        time: this.countdown
      }
      await timerStop(payload);
    },

    async masterBack(seconds: number) {
      const settingsStore = useSettingsStore();
      const gameStore = useGameStore();
      
      this.countdown = Math.min(settingsStore.periodDuration * 60 * 1000, this.countdown + seconds * 1000);
      gameStore.adjustPlayerTimes(-(seconds * 1000)); // Togliamo secondi alle stats
    },

    async masterForward(seconds: number) {
      const gameStore = useGameStore();

      this.countdown = Math.max(0, this.countdown - seconds * 100);
      gameStore.adjustPlayerTimes(seconds * 100); // Aggiungiamo secondi alle stats
    },

    removeQuarter() {
        this.currentPeriod = Math.min(1, this.currentPeriod - 1)
    },

    // --- LOGICA CONDIVISA (L'intervallo locale) ---
    // runLocalTimer() {
    //   this.isTimerRunning = true;
    //   const gameStore = useGameStore();

    //   this.timerInterval = window.setInterval(() => {
    //     if (this.countdown > 0) {
    //       this.countdown--;
          
    //       // Diciamo al gameStore di avanzare le stats di 1 secondo
    //       gameStore.adjustPlayerTimes(1); 
    //     } else {
    //       this.handleEndOfQuarter();
    //     }
    //   }, 1000);
    // },

    runLocalTimer() {
      this.isTimerRunning = true;
      const gameStore = useGameStore();
      
      // Registriamo il momento esatto in cui parte il timer
      this.lastTickTime = performance.now();

      // Definiamo la funzione di loop
      const tick = () => {
        if (!this.isTimerRunning) return;

        // 1. Calcolo del Delta Time (quanto tempo REALE è passato dall'ultimo ciclo?)
        const now = performance.now();
        const delta = now - this.lastTickTime;
        this.lastTickTime = now;

        if (this.countdown > 0) {
          // 1. Scaliamo il tempo principale della partita
          this.countdown -= delta;

          // 2. Scaliamo i tempi dei giocatori passando esattamente i millisecondi
          gameStore.adjustPlayerTimes(delta); 

          // 3. Continuiamo il loop
          this.animationFrameId = requestAnimationFrame(tick);
          
        } else {
          // Fine del tempo!
          this.countdown = 0; // Evita che il tempo vada in negativo
          this.isTimerRunning = false;
          this.handleEndOfQuarter();
        }
      };

      // Avviamo il primo ciclo
      this.animationFrameId = requestAnimationFrame(tick);
    },

    stopLocalTimer() {
      this.isTimerRunning = false;
      cancelAnimationFrame(this.animationFrameId);
    },

    async handleEndOfQuarter() {
      const settingsStore = useSettingsStore();
      
      if (this.isTimerMaster) {
        await this.masterStop();
      } else {
        this.stopLocalTimer();
      }
      
      // Evitiamo di andare oltre i tempi prestabiliti
      if (this.currentPeriod >= settingsStore.totalPeriods) return;
      
      this.currentPeriod++;
      this.countdown = settingsStore.periodDuration * 60 * 1000;
    },

    resetTimer() {
      const settingsStore = useSettingsStore();
      this.stopLocalTimer();
      this.currentPeriod = 1;
      this.countdown = settingsStore.periodDuration * 60 * 1000;
      this.isTimerRunning = true;
      if(this.isTimerMaster)
        this.masterStop();
    },

    async goToPenalties(matchId: string) {
      try {
        const matchStateStore = useMatchStateStore();
        await startPenalties(matchId, { sender_client_id: matchStateStore.clientId });
        this.currentPeriod = matchPeriodToNumber[MatchPeriod.PENALTIES];
        this.countdown = 0;
        useToast().info("Spostamento ai tiri di rigore effettuato");
      } catch (error) {
        console.error("Errore durante la chiusura del match:", error);
        useToast().error("Impossibile avviare i rigori");
        throw error;
      }
    },
  }

});
