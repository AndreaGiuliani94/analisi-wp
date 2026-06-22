<template>
  <div class="relative bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800">
    <video 
      ref="videoRef"
      controls 
      class="w-full aspect-video"
      @timeupdate="emitTime"
    ></video>

    <div class="bg-slate-900 text-slate-400 text-xs px-4 py-2 flex gap-4 border-t border-slate-800 font-mono">
      <span>[Spazio] Play/Pausa</span>
      <span>[← / →] -5s / +5s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Hls from 'hls.js';
import { useVideoStore } from '@/stores/videoStore';

const videoStore = useVideoStore();

const props = defineProps({
    videoUrl: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['time-update']);
const videoRef = ref<HTMLVideoElement | null>(null);
const hlsInstance = ref<Hls | null>(null);
const videoUrl = ref<string | null>(null);

const loadHlsVideo = async () => {
    const video = videoRef.value;
    if (!video) return;

    const m3u8Response = await fetch(props.videoUrl);
    let m3u8Content = await m3u8Response.text();

    videoStore.tsUrls.forEach((tsUrl: string, index: number) => {
      m3u8Content = m3u8Content.replace(new RegExp(`index${index}\\.ts`, 'g'), tsUrl);
    });

    const blob = new Blob([m3u8Content], { type: 'application/vnd.apple.mpegurl' });
    videoUrl.value = URL.createObjectURL(blob);

    if (Hls.isSupported()) {
        hlsInstance.value = new Hls();
        // Carica il flusso HLS
        hlsInstance.value.loadSource(videoUrl.value);
        // Collega HLS.js al tag video
        hlsInstance.value.attachMedia(video);
        // Inizia la riproduzione una volta che il flusso è pronto
        hlsInstance.value.on(Hls.Events.MANIFEST_PARSED, function () {
            // video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari e altri browser che supportano nativamente HLS
        video.src = props.videoUrl;
        video.addEventListener('loadedmetadata', function () {
            // video.play();
        });
    } else {
        console.error("Il tuo browser non supporta HLS.");
    }
};

const emitTime = () => {
  if (videoRef.value) {
    emit('time-update', videoRef.value.currentTime);
  }
};

// Gestione delle scorciatoie da tastiera
const handleKeydown = (e: KeyboardEvent) => {
  // UX Safe: disabilita le scorciatoie se l'utente sta digitando un testo
  const activeEl = document.activeElement as HTMLElement;
  if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
    return;
  }

  if (!videoRef.value) return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      if (videoRef.value.paused) {
        videoRef.value.play();
      } else {
        videoRef.value.pause();
      }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 5);
      break;
    case 'ArrowRight':
      e.preventDefault();
      videoRef.value.currentTime = Math.min(videoRef.value.duration || 0, videoRef.value.currentTime + 5);
      break;
  }
};

// Metodi esposti al padre tramite template ref
defineExpose({
  getCurrentTime: () => videoRef.value?.currentTime || 0,
  pause: () => videoRef.value?.pause(),
  seek: (seconds: number) => {
    if (videoRef.value) videoRef.value.currentTime = seconds;
  }
});

onMounted(async() => {
  window.addEventListener('keydown', handleKeydown)
  if (props.videoUrl && videoStore.tsUrls.length > 0) {
    await loadHlsVideo()
  }
});

onUnmounted(async () => { 
  window.removeEventListener('keydown', handleKeydown)
  hlsInstance.value?.destroy();
});

</script>