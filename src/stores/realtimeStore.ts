import { supabase } from '@/lib/supabase';
import { useGameStore } from './gameStore';
import { defineStore } from 'pinia';
import { useTimerStore } from './timerStore';
import { useSessionStateStore } from './sessionStateStore';

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

      const myRole = localStorage.getItem("user_role") || "viewer";
      const mySessionId = localStorage.getItem("session_id");
      
      // 2. Creiamo l'iscrizione alla tabella 'realtime_broadcasts'
      this.activeChannel = supabase
        .channel(`match_channel_${gameStore.match.id}`)
        // 1. ASCOLTIAMO GLI EVENTI DEL DATABASE
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
              // 1. DEDUPLICAZIONE: Controlliamo se siamo stati noi a generare l'evento
              if (broadcastData.sender_client_id === useSessionStateStore().clientId) {
                console.log("Broadcast ignorato: sono il mittente.");
                return; 
              }
              else if (broadcastData.payload_json.action === 'TIMER_PLAY') {
                  timerStore.setTimeFromString(broadcastData.payload_json.time);
                  timerStore.currentQuarter = broadcastData.payload_json.quarter;
                  timerStore.runLocalTimer();
              } 
              else if (broadcastData.payload_json.action === 'TIMER_STOP') {
                  timerStore.stopLocalTimer();
                  timerStore.setTimeFromString(broadcastData.payload_json.time);
                  timerStore.currentQuarter = broadcastData.payload_json.quarter;
                  
                  // Sincronizziamo i tempi dei giocatori dal database
                  if (broadcastData.playerStatsTime) {
                    gameStore.syncPlayerTimes(broadcastData.payload_json.playerStats);
                  }
              }
              else if (broadcastData.payload_json.action === 'ADD' || broadcastData.payload_json.action === 'UPDATE' || broadcastData.payload_json.action === 'DELETE') {
                  // Passiamo gli eventi sportivi al gameStore
                  gameStore.handleIncomingBroadcast(broadcastData);
              }
              else if (broadcastData.payload_json.action === 'SUBSTITUTIONS') {
                  // Gestione sostituzioni da remoto
                  gameStore.applyBulkSubstitutions(broadcastData.payload_json.playerStats);
              }
              else if (broadcastData.payload_json.action === 'MATCH_RESTART') {
                console.log("Comando di reset ricevuto dal Master. Svuoto la UI.");
                gameStore.clearTeams();
                gameStore.events = [];
                timerStore.resetTimer();
              } 
            }
          }
        )
        // 2. ASCOLTIAMO CHI ENTRA (PRESENCE JOIN)
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log("Nuovi utenti entrati nel canale:", newPresences);
          // Controlliamo se qualcuno dei nuovi entrati è un timekeeper
          const isTimekeeperJoined = newPresences.some((p: any) => p.role === 'timekeeper');
          if (isTimekeeperJoined && myRole === 'owner') {
            timerStore.giveUpTimerMaster();
          }
        })
        // 3. ASCOLTIAMO CHI ESCE (PRESENCE LEAVE)
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log("Utenti usciti dal canale:", leftPresences);
          // Se un timekeeper è uscito (o gli è crashato il tablet)...
          const isTimekeeperLeft = leftPresences.some((p: any) => p.role === 'timekeeper');
          if (isTimekeeperLeft && myRole === 'owner') {
            timerStore.takeTimerMaster();
          }
        })
        
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`In ascolto sulla partita ${gameStore.match.id}`);
            
            // 4. TRACCIAMO LA NOSTRA PRESENZA!
            const presenceStatus = await this.activeChannel.track({
              user_id: mySessionId,
              role: myRole,
              online_at: new Date().toISOString(),
            });
          }
        });
    },

    unsubscribe() {
      if (this.activeChannel) {
        this.activeChannel.untrack();
        supabase.removeChannel(this.activeChannel);
        this.activeChannel = null;
        console.log("Disconnesso dagli eventi Live");
      }
    }
  }
});