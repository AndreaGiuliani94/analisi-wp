<template>
  <BaseModal :is-open="isOpen" title="Download Clip Esportate" @close="closeModal">
    <div class="flex flex-col gap-4 mt-4">
      <div v-if="loading" class="text-center py-6 text-slate-500 flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-blue-900 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Preparazione in corso...</span>
      </div>

      <div v-else>
        <p class="text-sm text-slate-600 mb-4">
          Le clip sono state esportate correttamente.
        </p>

        <!-- Scarica tutto in ZIP -->
        <!-- <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div class="flex flex-col">
            <span class="font-bold text-blue-950">Scarica tutto (ZIP)</span>
            <span class="text-xs text-blue-700">Comprime tutte le clip in un unico file</span>
          </div>
          <ActionButton label="Scarica ZIP" color="blue" @click="downloadAllAsZip" />
        </div> -->

        <!-- Lista Clip Singole -->
        <div class="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
          <h4 class="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
            Clip Singole ({{ links.length }})
          </h4>
          <div 
            v-for="(link, index) in links" 
            :key="index"
            class="flex items-center justify-between p-2 border border-slate-100 rounded bg-slate-50"
          >
            <span class="text-sm font-semibold text-slate-700 truncate mr-3">
              Clip #{{ index + 1 }}
            </span>
            
            <button 
              @click="downloadClip(link, index)" 
              :disabled="isDownloading(index)"
              class="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded font-bold transition-colors shrink-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isDownloading(index)" class="flex items-center gap-1">
                <svg class="animate-spin h-3 w-3 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Attendere...
              </span>
              <span v-else>Scarica .mp4</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <ActionButton label="Chiudi" color="gray" @click="closeModal" />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ActionButton from "../buttons/ActionButton.vue";
import BaseModal from "./BaseModal.vue";
import { exportZip } from '@/services/videoService';
import { useVideoStore } from '@/stores/videoStore.ts';

const props = defineProps<{
  isOpen: boolean;
  links: any[];
}>();

const emit = defineEmits(["close"]);
const loading = ref(false);

const closeModal = () => {
  emit("close");
};

// Usiamo un Set per tenere traccia di quali indici stanno scaricando
// (utile se l'utente clicca "Scarica" su 3 clip diverse contemporaneamente)
const downloadingItems = ref<Set<number>>(new Set());

const isDownloading = (index: number) => downloadingItems.value.has(index);

const downloadClip = async (clip: any, index: number) => {
  // 1. Attivo lo stato di caricamento per questa specifica clip
  downloadingItems.value.add(index);
  const videoStore = useVideoStore()

  try {
    // 2. Chiamata al Backend per ottenere l'URL pre-firmato
    // Sostituisci questo blocco con la tua vera chiamata Axios/Fetch al BE
    
    const response = await videoStore.getDownloadUrl(clip.s3_source)
    const presignedUrl = response;

    // 3. Forzare il download nel browser
    // Creiamo un tag <a> invisibile, gli passiamo l'URL di S3 e lo clicchiamo programmaticamente
    const linkElement = document.createElement('a');
    linkElement.href = presignedUrl;
    
    // Il nome del file suggerito (funziona solo se il BE non forza un nome diverso)
    linkElement.download = `Clip_WPStudio_${index + 1}.mp4`; 
    
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

  } catch (error) {
    console.error("Errore durante la generazione del link di download:", error);
    // Qui puoi gestire un toast o un alert di errore
    alert("Impossibile generare il link per il download.");
  } finally {
    // 4. Spengo lo stato di caricamento indipendentemente dal risultato
    downloadingItems.value.delete(index);
  }
};

const downloadAllAsZip = async () => {
  if (!props.links.length) return;
  loading.value = true;
  try {
    const response = await exportZip(props.links);
    const data = await response.json();
    if (data.zip_url) {
      window.open(data.zip_url, '_blank');
    } else {
      alert("Errore nella generazione dello zip.");
    }
  } catch (error) {
    console.error("Errore ZIP:", error);
    alert("Si è verificato un errore durante la preparazione dello ZIP.");
  } finally {
    loading.value = false;
  }
};
</script>
