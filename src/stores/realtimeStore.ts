import { supabase } from '@/lib/supabase';
import { useGameStore } from './gameStore';
import { defineStore } from 'pinia';
import { useSessionStateStore } from './sessionStateStore';

export const useRealtimeStore = defineStore('realtime', {
  state: () => ({
    activeChannel: null as any
  }),

  actions: {
    subscribeToMatch() {
      const gameStore = useGameStore();
      const sessionStateStore = useSessionStateStore();

      // 1. Evitiamo di iscriverci due volte
      if (this.activeChannel) {
        supabase.removeChannel(this.activeChannel);
      }
      
      // 2. Creiamo l'iscrizione alla tabella 'realtime_broadcasts'
      this.activeChannel = supabase
        .channel(`match_channel_${sessionStateStore.matchId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'realtime_broadcasts',
            filter: `match_id=eq.${sessionStateStore.matchId}` // FONDAMENTALE: Ascoltiamo solo i broadcast di QUESTA partita!
          },
          (payload) => {
            console.log("Nuovo record broadcast ricevuto dal DB!", payload);
            
            const broadcastData = (payload.new && Object.keys(payload.new).length > 0) ? payload.new : payload.old;
            
            if (broadcastData) {
              gameStore.handleIncomingBroadcast(broadcastData);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`In ascolto degli eventi Live per la partita ${sessionStateStore.matchId}`);
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