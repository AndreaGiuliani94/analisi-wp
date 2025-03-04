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
  intervals: VideoInterval[];
}

export const useVideoStore = defineStore("video", {
  state: (): VideoStoreState => ({
    selectedFile: null,
    videoUploaded: false,
    intervals: [],
  }),

  actions: {
    setFile(file: File) {
      this.selectedFile = file;
    },

    async uploadVideo(): Promise<void> {
      if (!this.selectedFile) return;

      const formData = new FormData();
      formData.append("body", this.selectedFile);
      formData.append("file", this.selectedFile);

      try {
        await axios.post("http://127.0.0.1:8000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.videoUploaded = true;
      } catch (error) {
        console.error("Errore nell'upload del video", error);
      }
    },

    addInterval(): void {
      this.intervals.push({ start: 0, end: 0 });
    },

    removeInterval(index: number): void {
      this.intervals.splice(index, 1);
    },

    async sendIntervals(): Promise<void> {
      const request: any = {
        intervals: this.intervals,
        filename: this.selectedFile?.name
      }
      
      try {
        const response = await axios.post("http://127.0.0.1:8000/cut", request,
          {
            headers: { "Content-Type": "application/json" },
            responseType: "blob"
          },
        );
        const zipBlob = new Blob([response.data], { type: "application/zip" });
        saveAs(zipBlob, "video_clips.zip");
      } catch (error) {
        console.error("Errore nell'invio degli intervalli", error);
      }
    },

    resetStore(): void {
      this.selectedFile = null;
      this.videoUploaded = false;
      this.intervals = [];
    },
  },
});
