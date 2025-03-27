<template>
    <video ref="videoPlayer" class="w-full mt-1 rounded-lg shadow-md" controls>
        Il tuo browser non supporta il tag video.
    </video>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Hls from 'hls.js';
import { useVideoStore } from '@/stores/videoStore';

const videoStore = useVideoStore();

// Definisci la prop 'videoUrl' tipizzata
const props = defineProps({
    videoUrl: {
        type: String,
        required: true
    },
    videoName: {
        type: String,
        required: true
    }
});

// Riferimento al tag <video>
const videoPlayer = ref<HTMLVideoElement | null>(null);
const hlsInstance = ref<Hls | null>(null);
const videoUrl = ref<string | null>(null);

// Funzione per caricare e riprodurre il video HLS
const loadHlsVideo = async () => {
    const video = videoPlayer.value;
    if (!video) return;

    const m3u8Response = await fetch(props.videoUrl);
    let m3u8Content = await m3u8Response.text();

    videoStore.tsUrls.forEach((tsUrl: string, index: number) => {
      m3u8Content = m3u8Content.replace(new RegExp(`${props.videoName}__0*${index+1}\.ts`, 'g'), tsUrl);
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
            video.play();
        });


    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari e altri browser che supportano nativamente HLS
        video.src = props.videoUrl;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    } else {
        console.error("Il tuo browser non supporta HLS.");
    }
};

onMounted(() => {
    if (props.videoUrl && videoStore.tsUrls.length > 0) {
        loadHlsVideo()
    }
})

onUnmounted(() => {
    hlsInstance.value?.destroy();
});

</script>
