import { defineStore } from "pinia";
import axios from "axios";
import { saveAs } from "file-saver";
import type { VideoInterval } from "@/components/Interfaces/VideoInterval";
import type { TacticsData } from "@/components/Interfaces/TacticsData";
import type { Interval } from "@/components/Interfaces/Interval";

// Definiamo il tipo dello stato dello store
interface VideoStoreState {
  selectedFile: File | null;
  videoName: string;
  videoUploaded: boolean;
  videoURL: string | null;
  videoDuration: number;
  tsUrls: string [];
  intervals: VideoInterval[];
  downloadProgress: number;
  isUploading: boolean;
  tactics: TacticsData | null;
}

export const useVideoStore = defineStore("video", {
  state: (): VideoStoreState => ({
    selectedFile: null,
    videoName: '',
    videoUploaded: false,
    videoURL: null,
    videoDuration: 0,
    tsUrls: [],
    intervals: [],
    downloadProgress: 0,
    isUploading: false,
    tactics: null,
  }),
  getters: {
    requestIntervals: (state) => {
      var reqInt: Interval[] = [];
      state.intervals.map(
        (interval) => (reqInt.push({ 
          start: timeStringToSeconds(interval.start),
          end: timeStringToSeconds(interval.end),
          category: interval.category,
          title: interval.title
         }))
      );
      return reqInt;
    },
  },

  actions: {
    setFile(file: File) {
      this.selectedFile = file;
    },

    setVideoURL(url: string) {
      this.videoURL = url;
    },

    setVideoName(name: string) {
      this.videoName = name;
    },

    addInterval(): void {
      this.intervals.push({
        start: "",
        end: "",
        category: "",
        title: "",
        errors: { start: "", end: "", title: ""},
      });
    },

    removeInterval(index: number): void {
      this.intervals.splice(index, 1);
    },

    validateTime(index: number, field: "start" | "end"): void {
      const value = this.intervals[index][field];
      const timeRegex = /^[0-5]?[0-9]:[0-5][0-9]$/;

      if (!value.match(timeRegex)) {
        this.intervals[index].errors[field] = "Formato non valido (mm:ss)";
        return;
      } else {
        this.intervals[index].errors[field] = ""; // Nessun errore
      }

      if (timeStringToSeconds(value) > this.videoDuration) {
        this.intervals[index].errors[field] = "Inserisci un tempo più breve";
      }
    },

    async loadVideo(): Promise<void> {
      await this.uploadVideo();
      await this.fetchTactics();
      this.addInterval();
    },

    async uploadVideo(): Promise<void> {
      if (!this.selectedFile) return;

      this.setVideoName(this.selectedFile.name.replace(/\.[^/.]+$/, ""));

      this.isUploading = true; // Mostra lo spinner

      try {
        const response = await axios.get(import.meta.env.VITE_BE_URL + `/video/link/?file_name=${this.selectedFile.name}`);
        const presignedUrl = response.data.url;
        const jobId = response.data.job_id;

        // Carica il file direttamente su S3 usando l'URL pre-firmato
        const uploadResponse = await axios.put(presignedUrl, this.selectedFile, {
          headers: {
            'Content-Type': this.selectedFile.type,  // Puoi configurare il content-type a seconda del tipo di file
          },
        });

        await this.waitForCompletion(jobId, 1800000); // 30min

        if (uploadResponse.status === 200 && this.videoUploaded) {
          console.log('File caricato con successo su S3!');
          const response = await axios.get(import.meta.env.VITE_BE_URL + `/video/info/?file_name=${this.videoName}`);
          if(response.data.error){
            console.error("Errore: " + response.data.error)
            alert("Errore nel caricamento del video")
          } else {
            this.videoURL = response.data.video_url;
            this.tsUrls = response.data.ts_urls;
            this.videoDuration = response.data.duration;
          }
        } else {
          throw new Error("Errore in upload")
        }
      } catch (error) {
        console.error("Errore nell'upload del video", error);
        alert("Errore nell'upload del video");
      } finally {
        this.isUploading = false; // Nasconde lo spinner
      }
    },

    async waitForCompletion(jobId:string, timeout: number) {
      return new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout di attesa superato.'));
        }, timeout);

        const intervalId = setInterval(async () => {
          await this.getConversionStatus(jobId);
  
          // Se la conversione è completata, ferma il ciclo
          if (this.videoUploaded) {
            clearInterval(intervalId); // Ferma l'intervallo
            clearTimeout(timeoutId);
            resolve(); // Risolve la Promise, terminando l'attesa
          }
        }, 10000); // 10 secondi
      });
    },

    async getConversionStatus(jobId:string): Promise<void> {
      try {
        const statusResponse = await axios.get(import.meta.env.VITE_BE_URL + `/status/check/?job_id=${jobId}`);
        const status = statusResponse.data.status;

        if (status.toUpperCase() === 'COMPLETE'.toUpperCase()) {
          console.log('Il processo di conversione è completato!' + statusResponse.data);
          this.videoUploaded = true;
        } else if (status.toUpperCase() === 'ERROR'.toUpperCase()) {
          console.error('Il processo di conversione è fallito');
          this.videoUploaded = false;
        } else {
          console.log('Il processo di conversione non è ancora completato');
          this.videoUploaded = false;
        }
      } catch (error) {
        console.error('Errore durante il polling dello stato', error);
        this.videoUploaded = false;
      }
      
    },

    async sendIntervals(): Promise<void> {
      this.downloadProgress = 0; // Reset progress
      this.isUploading = true; // Mostra lo spinner

      const request: any = {
        intervals: this.requestIntervals,
        video_id: this.selectedFile?.name,
      };

      try {
        const response = await axios.post(
          import.meta.env.VITE_BE_URL + "/video/extract-clips-mc/",
          request,
          {
            headers: { "Content-Type": "application/json" },
            responseType: "blob",
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                this.downloadProgress =
                  (progressEvent.loaded / progressEvent.total) * 100;
              }
            },
          }
        );
        const zipBlob = new Blob([response.data], { type: "application/zip" });
        saveAs(zipBlob, "video_clips.zip");

        this.downloadProgress = 100;
        setTimeout(() => (this.downloadProgress = 0), 2000);
      } catch (error) {
        console.error("Errore durante il taglio del video", error);
        alert("Errore durante il taglio del video");
      } finally {
        this.isUploading = false; // Nasconde lo spinner
      }
    },

    async cleanupVideos(): Promise<void> {
      try {
        await axios.delete(import.meta.env.VITE_BE_URL + "/video/clean-bucket/");
        this.resetStore();
        alert("Cartelle pulite con successo!");
      } catch (error) {
        console.error("Errore nella pulizia dei video", error);
      }
    },

    async fetchTactics(): Promise<void> {
      try {
        const response = await axios.get<TacticsData>(
          import.meta.env.VITE_BE_URL + "/video/categories/"
        );
        this.tactics = response.data;
      } catch (error) {
        console.error("Errore nel recupero delle tattiche:", error);
      }
    },

    async testS3Connection(): Promise<void> {
      try{
        const response = await axios.get<TacticsData>(
          import.meta.env.VITE_BE_URL + "/test-s3"
        );
        console.log("connesso a S3", response);
      } catch(error) {
        console.error("Errore nella connsessiona a S3", error);
      }
    },

    resetStore(): void {
      this.selectedFile = null;
      this.videoUploaded = false;
      this.videoURL = null;
      this.intervals = [];
      this.downloadProgress = 0;
      this.isUploading = false;
      this.tactics = null;
    },
  },
});

function timeStringToSeconds(timeString: string): number {
  const regex = /^(\d{1,2}):([0-5][0-9])$/;
  const match = timeString.match(regex);

  if (!match) {
    throw new Error("Formato non valido, usa mm:ss");
  }

  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}
