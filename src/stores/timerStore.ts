import { defineStore } from 'pinia';
import { useGameStore } from './gameStore';
import { useSettingsStore } from './settingsStore';
import { useMatchStateStore } from './matchStateStore';
import { startPenalties, timerPlay, timerStop } from '@/services/timerService';
import { useToast } from 'vue-toastification';
import { matchPeriodToNumber, numberToMatchPeriod } from '@/const/consts';
import { MatchPeriod } from '@/enum/MatchPeriod';
import { useTimeFormat } from '@/composables/useTimeFormat';
import { MatchRole } from '@/enum/RoleType';
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

    setTimerMaster(userRole: MatchRole) {
      let isMaster = false;
      if(userRole === MatchRole.TIMEKEEPER) {
          isMaster = true;
      } else if(userRole === MatchRole.OWNER) {
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
      const settingsStore = useSettingsStore();
      if (this.isTimerRunning) return;
      if(settingsStore.enableTimekeeping) this.runLocalTimer();
      else this.isTimerRunning = true;
      
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
      const settingsStore = useSettingsStore();
      if (!this.isTimerRunning) return;
      if(settingsStore.enableTimekeeping) this.stopLocalTimer() 
      else this.isTimerRunning = false;
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
      
      this.countdown = Math.min(settingsStore.periodDuration, this.countdown + seconds * 1000);
      gameStore.adjustPlayerTimes(-(seconds * 1000)); // Togliamo secondi alle stats
    },

    async masterForward(seconds: number) {
      const gameStore = useGameStore();

      this.countdown = Math.max(0, this.countdown - seconds * 1000);
      gameStore.adjustPlayerTimes(seconds * 1000); // Aggiungiamo secondi alle stats
    },

    removeQuarter() {
        this.currentPeriod = Math.min(1, this.currentPeriod - 1)
    },

    runLocalTimer() {
      this.isTimerRunning = true;
      const gameStore = useGameStore();
      
      // Registriamo il momento esatto in cui parte il timer
      this.lastTickTime = Math.round(performance.now());

      // Definiamo la funzione di loop
      const tick = () => {
        if (!this.isTimerRunning) return;

        // 1. Calcolo del Delta Time (quanto tempo REALE è passato dall'ultimo ciclo?)
        const now = Math.round(performance.now());
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
      
      // Evitiamo di andare oltre i tempi prestabiliti
      if (this.currentPeriod > settingsStore.totalPeriods) return;
      else if (this.currentPeriod === settingsStore.totalPeriods) this.countdown = 0;
      else {
        this.currentPeriod++;
        this.countdown = settingsStore.periodDuration;
      }
      
      if (this.isTimerMaster) {
        await this.masterStop();
      } else {
        if (settingsStore.enableTimekeeping) this.stopLocalTimer();
        else this.isTimerRunning = false;
      }
      
    },

    resetTimer() {
      const settingsStore = useSettingsStore();
      if(settingsStore.enableTimekeeping) this.stopLocalTimer();
      else this.isTimerRunning = false;
      this.currentPeriod = 1;
      this.countdown = settingsStore.periodDuration;
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
