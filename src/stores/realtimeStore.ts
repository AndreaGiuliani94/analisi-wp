import { supabase } from '@/lib/supabase';
import { useGameStore } from './gameStore';
import { defineStore } from 'pinia';
import { useTimerStore } from './timerStore';

export const useRealtimeStore = defineStore('realtime', {
  state: () => ({
    activeChannel: null as any
  }),

  actions: {
    subscribeToMatch() {
      const gameStore = useGameStore();
      const timerStore = useTimerStore();

      // 1. Evitiamo di iscriverci due volte
      if (this.activeChannel) {
        supabase.removeChannel(this.activeChannel);
      }
      
      // 2. Creiamo l'iscrizione alla tabella 'realtime_broadcasts'
      this.activeChannel = supabase
        .channel(`match_channel_${gameStore.match.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'realtime_broadcasts',
            filter: `match_id=eq.${gameStore.match.id}` // FONDAMENTALE: Ascoltiamo solo i broadcast di QUESTA partita!
          },
          (payload) => {
            console.log("Nuovo record broadcast ricevuto dal DB!", payload);
            
            const broadcastData: any = (payload.new && Object.keys(payload.new).length > 0) ? payload.new : payload.old;
            
            if (broadcastData) {
              if (broadcastData.payload_json.action === 'TIMER_PLAY') {
                  timerStore.countdown = broadcastData.payload_json.time;
                  timerStore.currentQuarter = broadcastData.payload_json.quarter;
                  timerStore.runLocalTimer();
              } 
              else if (broadcastData.payload_json.action === 'TIMER_STOP') {
                  timerStore.stopLocalTimer();
                  timerStore.countdown = broadcastData.payload_json.countdown;
                  timerStore.currentQuarter = broadcastData.payload_json.quarter;
                  
                  // Sincronizziamo i tempi dei giocatori dal database
                  if (broadcastData.playerStatsTime) {
                    gameStore.syncPlayerTimes(broadcastData.payload_json.playerStats);
                  }
              }
              else if (broadcastData.payload_json.action === 'ADD' || broadcastData.action === 'UPDATE' || broadcastData.action === 'DELETE') {
                  // Passiamo gli eventi sportivi al gameStore
                  gameStore.handleIncomingBroadcast(broadcastData);
              }
              else if (broadcastData.payload_json.action === 'SUBSTITUTIONS') {
                  // Gestione sostituzioni da remoto
                  gameStore.applyBulkSubstitutions(broadcastData.payload_json.playerStats);
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`In ascolto degli eventi Live per la partita ${gameStore.match.id}`);
          }
        });
    },

    unsubscribe() {
      if (this.activeChannel) {
        supabase.removeChannel(this.activeChannel);
        this.activeChannel = null;
        console.log("Disconnesso dagli eventi Live");
      }
    }
  }
});