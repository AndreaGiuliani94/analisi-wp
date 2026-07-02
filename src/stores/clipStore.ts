import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabase';
import * as videoService from '@/services/videoService';

// Stato possibili di una clip nella tabella `clips`
export enum ClipStatus {
  TO_CLIP = 'TO_CLIP',
  CLIPPED = 'CLIPPED',
  ERROR = 'ERROR',
  DOWNLOADED = 'DOWNLOADED',
  DRAFT = 'DRAFT',
}

export interface Clip {
  id: string;
  video_id: string;
  status: ClipStatus;
  title?: string;
  type?: string;
  s3_source?: string;
  zip_s3_path?: string;
  created_at?: string;
  [key: string]: any;
}

interface ClipStoreState {
  clips: Clip[];
  activeChannel: any;
  isLoading: boolean;
}

import { IntervalsStatus, type VideoIntervalNew, JobStatus } from '@/interfaces/VideoInterval';
import { useVideoStore } from './videoStore';

export function mapClipToFE(clip: Clip): VideoIntervalNew {
  let mappedStatus = IntervalsStatus.DRAFT;
  switch (clip.status) {
    case ClipStatus.DRAFT: mappedStatus = IntervalsStatus.DRAFT; break;
    case ClipStatus.TO_CLIP: mappedStatus = IntervalsStatus.PROCESSING; break;
    case ClipStatus.CLIPPED: mappedStatus = IntervalsStatus.COMPLETED; break;
    case ClipStatus.DOWNLOADED: mappedStatus = IntervalsStatus.COMPLETED; break;
    case ClipStatus.ERROR: mappedStatus = IntervalsStatus.FAILED; break;
  }

  return {
    id: clip.id,
    title: clip.title || 'Clip',
    type: clip.type || 'GENERICO',
    category: clip.category || '',
    anchorTime: clip.anchor_time || 0,
    offsetStart: clip.offset_start || 5,
    offsetEnd: clip.offset_end || 5,
    status: mappedStatus,
    s3Path: clip.s3_source
  };
}

export const useClipStore = defineStore('clips', {
  state: (): ClipStoreState => ({
    clips: [],
    activeChannel: null,
    isLoading: false,
  }),

  getters: {
    clippedClips: (state) => state.clips.filter((c) => c.status === ClipStatus.CLIPPED),
    pendingClips: (state) => state.clips.filter((c) => c.status === ClipStatus.TO_CLIP),
    errorClips: (state) => state.clips.filter((c) => c.status === ClipStatus.ERROR),
    downloadedClips: (state) => state.clips.filter((c) => c.status === ClipStatus.DOWNLOADED),
    draftClips: (state) => state.clips.filter((c) => c.status === ClipStatus.DRAFT),
    hasProcessingClips: (state) => state.clips.some((c) => c.status === ClipStatus.TO_CLIP),
  },

  actions: {
    /** Carica le clip iniziali dal DB per il videoId fornito */
    async getAllClips(videoId: string): Promise<void> {
      if (!videoId) return;

      this.isLoading = true;

      try {
        const response = await videoService.getAllClips(videoId);
        const data = await response.json();
        if (data.error) {
          console.error("Errore: " + data.error)
          alert("Errore nel recupero delle clip")
        } else {
          this.clips = data;
        }
      } catch (error) {
        this.isLoading = false;
        console.error('[clipStore] Errore nel fetch delle clip:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /** Disconnette il canale realtime attivo */
    unsubscribeClipUpdates(): void {
      if (this.activeChannel) {
        supabase.removeChannel(this.activeChannel);
        this.activeChannel = null;
        console.log('[clipStore] Disconnesso dal channel clips');
      }
    },

    /**
     * Sottoscrive il canale realtime sulla tabella `clips`
     * filtrato per video_id = videoId.
     * Aggiorna lo stato locale in base alla colonna `status`.
     */
    subscribeToClipUpdates(videoId: string): void {
      if (!videoId) return;

      // Rimuovi eventuale canale precedente
      this.unsubscribeClipUpdates();

      this.activeChannel = supabase
        .channel(`clips_channel_${videoId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clips',
            filter: `video_id=eq.${videoId}`,
          },
          (payload) => {
            console.log('[clipStore] Aggiornamento clip ricevuto:', payload);

            if (payload.eventType === 'INSERT') {
              const newClip = payload.new as Clip;
              // Evita duplicati
              if (!this.clips.find((c) => c.id === newClip.id)) {
                this.clips.unshift(newClip);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedClip = payload.new as Clip;
              const index = this.clips.findIndex((c) => c.id === updatedClip.id);
              if (index !== -1) {
                this.clips[index] = { ...this.clips[index], ...updatedClip };
              } else {
                // La clip non era in cache: aggiungila
                this.clips.unshift(updatedClip);
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as Clip).id;
              this.clips = this.clips.filter((c) => c.id !== deletedId);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[clipStore] In ascolto sulle clip del video ${videoId}`);
          }
        });
    },

    /**
     * Inizializza lo store: carica le clip esistenti e si mette in
     * ascolto degli aggiornamenti realtime.
     */
    async initForVideo(videoId: string): Promise<void> {
      await this.getAllClips(videoId);
      this.subscribeToClipUpdates(videoId);
    },

    async exportDraftClips(videoId: string) {
      const drafts = this.clips.filter(c => c.status === ClipStatus.DRAFT);
      if (drafts.length === 0) return;

      const videoStore = useVideoStore();

      // Converti le draft nel formato FE per l'esportazione se necessario
      // Il BE adesso accetta probabilmente le properties come in VideoIntervalNew
      const draftsFE = drafts.map(mapClipToFE);

      drafts.forEach(c => {
        c.status = ClipStatus.TO_CLIP;
      });

      videoStore.clipJobs.unshift({
        status: JobStatus.PROCESSING,
        clipCount: drafts.length
      });

      try {
        var res = await videoService.exportClips(videoId, draftsFE);
        var data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Errore esportazione", error);
        drafts.forEach(c => c.status = ClipStatus.DRAFT);
      }
    },

    /** Resetta lo store e rimuove il canale attivo */
    resetStore(): void {
      this.unsubscribeClipUpdates();
      this.clips = [];
      this.isLoading = false;
    },
  },
});
