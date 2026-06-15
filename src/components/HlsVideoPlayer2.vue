<template>
  <div class="relative bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800">
    <video 
      ref="videoRef"
      :src="videoUrl" 
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

defineProps<{
  videoUrl: string;
}>();

const emit = defineEmits(['time-update']);
const videoRef = ref<HTMLVideoElement | null>(null);

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

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>