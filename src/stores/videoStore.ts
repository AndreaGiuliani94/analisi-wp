import { defineStore } from "pinia";
import axios from "axios";
import { saveAs } from "file-saver";

// Definiamo il tipo di un intervallo di tempo
interface VideoInterval {
  start: number;
  end: number;
}

// Definiamo il tipo dello stato dello store
interface VideoStoreState {
  selectedFile: File | null;
  videoUploaded: boolean;
  videoURL: string | null;
  intervals: VideoInterval[];
  downloadProgress: number;
  isUploading: boolean;
}

export const useVideoStore = defineStore("video", {
  state: (): VideoStoreState => ({
    selectedFile: null,
    videoUploaded: false,
    videoURL: null,
    intervals: [],
    downloadProgress: 0,
    isUploading: false,
  }),

  actions: {
    setFile(file: File) {
      this.selectedFile = file;
    },

    setVideoURL(url: string) {
      this.videoURL = url;
    },

    addInterval(): void {
      this.intervals.push({ start: 0, end: 0 });
    },

    removeInterval(index: number): void {
      this.intervals.splice(index, 1);
    },

    async uploadVideo(): Promise<void> {
      if (!this.selectedFile) return;

      this.isUploading = true; // Mostra lo spinner

      const formData = new FormData();
      formData.append("body", this.selectedFile);
      formData.append("file", this.selectedFile);

      try {
        const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.videoUploaded = true;
        this.videoURL = response.data.video_url; // Usa un URL servito dal backend
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
        filename: this.selectedFile?.name
      }
      
      try {
        const response = await axios.post("http://127.0.0.1:8000/cut", request,
          {
            headers: { "Content-Type": "application/json" },
            responseType: "blob",
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                this.downloadProgress = (progressEvent.loaded / progressEvent.total) * 100;
              }
            },
          },
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

    resetStore(): void {
      this.selectedFile = null;
      this.videoUploaded = false;
      this.videoURL = null;
      this.intervals = [];
      this.downloadProgress = 0;
      this.isUploading = false;
    },
  },
});
