import { defineStore } from "pinia";
import axios from "axios";
import { saveAs } from "file-saver";
import type { VideoInterval } from "@/components/Interfaces/VideoInterval";
import type { TacticsData } from "@/components/Interfaces/TacticsData";

// Definiamo il tipo dello stato dello store
interface VideoStoreState {
  selectedFile: File | null;
  videoUploaded: boolean;
  videoURL: string | null;
  videoDuration: number;
  intervals: VideoInterval[];
  downloadProgress: number;
  isUploading: boolean;
  tactics: TacticsData | null;
}

export const useVideoStore = defineStore("video", {
  state: (): VideoStoreState => ({
    selectedFile: null,
    videoUploaded: false,
    videoURL: null,
    videoDuration: 0,
    intervals: [],
    downloadProgress: 0,
    isUploading: false,
    tactics: null,
  }),

  actions: {
    setFile(file: File) {
      this.selectedFile = file;
    },

    setVideoURL(url: string) {
      this.videoURL = url;
    },

    addInterval(): void {
      this.intervals.push({
        start: "",
        end: "",
        category: "",
        errors: { start: "", end: "" },
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
      } else {
        this.intervals[index].errors[field] = ""; // Nessun errore
      }
      
      if(this.timeStringToSeconds(value) > this.videoDuration) {
        this.intervals[index].errors[field] = "Inserisci un tempo più breve"
      }

    },

    timeStringToSeconds(timeString: string): number {
      const regex = /^(\d{1,2}):([0-5][0-9])$/;
      const match = timeString.match(regex);

      if (!match) {
        throw new Error("Formato non valido, usa mm:ss");
      }

      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    },

    async loadVideo(): Promise<void> {
      await this.uploadVideo();
      await this.fetchTactics();
      this.addInterval();
    },

    async uploadVideo(): Promise<void> {
      if (!this.selectedFile) return;

      this.isUploading = true; // Mostra lo spinner

      const formData = new FormData();
      formData.append("body", this.selectedFile);
      formData.append("file", this.selectedFile);

      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        this.videoUploaded = true;
        this.videoURL = response.data.video_url;
        this.videoDuration = response.data.duration;
      } catch (error) {
        console.error("Errore nell'upload del video", error);
        alert("Errore nell'upload del video");
      } finally {
        this.isUploading = false; // Nasconde lo spinner
      }
    },

    async sendIntervals(): Promise<void> {
      this.downloadProgress = 0; // Reset progress
      this.isUploading = true; // Mostra lo spinner

      const request: any = {
        intervals: this.intervals,
        filename: this.selectedFile?.name,
      };

      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/cut",
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
        await axios.delete("http://127.0.0.1:8000/cleanup/");
        this.resetStore();
        alert("Cartelle pulite con successo!");
      } catch (error) {
        console.error("Errore nella pulizia dei video", error);
      }
    },

    async fetchTactics(): Promise<void> {
      try {
        const response = await axios.get<TacticsData>("https://ws-analisi-wp-production.up.railway.app/categories/");
        this.tactics = response.data;
      } catch (error) {
        console.error("Errore nel recupero delle tattiche:", error);
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
