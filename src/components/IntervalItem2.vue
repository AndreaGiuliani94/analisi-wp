<template>
  <div 
    v-if="!isEditing" 
    @click="isEditing = true"
    class="bg-white border-2 rounded-lg p-3 flex items-center justify-between shadow-sm hover:bg-slate-50 transition-colors group cursor-pointer"
    :class="categoryBorderColorClass"
  >
    <div class="flex items-center gap-3 overflow-hidden">
      <span class="text-sm font-bold text-slate-700 truncate">
        {{ interval.title || 'Clip senza titolo' }}
      </span>
      <span v-if="interval.playerNumber" class="text-xs font-semibold text-slate-400 shrink-0">
        (#{{ interval.playerNumber }})
      </span>
    </div>

    <div class="flex items-center gap-4 shrink-0">
      <div class="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
        {{ useTimeFormat().formatMsToTimer(interval.anchorTime + interval.offsetStart) }} - {{ useTimeFormat().formatMsToTimer(interval.anchorTime + interval.offsetEnd) }}
      </div>
      
      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          @click.stop="$emit('remove')"
          class="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
          title="Elimina"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
    </div>
  </div>

  <div 
    v-else 
    class="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm relative group"
  >
    <div class="flex justify-between items-center border-b border-blue-100 pb-2 cursor-pointer" @click="isEditing = false" title="Riduci">
      <h4 class="text-xs font-black text-blue-900 uppercase tracking-wider">Modifica Clip</h4>
      <button class="p-1 text-blue-500 hover:text-blue-700 rounded transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
      </button>
    </div>

    <div class="grid grid-rows-2 gap-3">
      <div class="flex flex-col text-xs">
        <label class="font-bold text-slate-600 mb-1">Titolo:</label>
        <input 
          type="text" 
          v-model="interval.title"
          @keyup.enter="isEditing = false"
          placeholder="Es: Gol del capitano"
          class="p-2 h-9 border border-slate-300 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
        />
      </div>

      <CategoryListbox v-model="interval.category" />
    </div>

    <!-- <div class="grid grid-cols-2 gap-3">
      <div class="flex flex-col text-xs">
        <label class="font-bold text-slate-600 mb-1">Squadra (Opzionale):</label>
        <select v-model="interval.teamId" class="p-2 h-9 border border-slate-300 rounded-md bg-white text-xs">
          <option :value="null">Nessuna</option>
          <option value="home">Casa</option>
          <option value="away">Ospite</option>
        </select>
      </div>
      <div class="flex flex-col text-xs">
        <label class="font-bold text-slate-600 mb-1">Giocatore (Opzionale):</label>
        <input 
          type="number" 
          v-model="interval.playerNumber" 
          @keyup.enter="isEditing = false"
          placeholder="Num. Calottina"
          class="p-2 h-9 border border-slate-300 rounded-md bg-white text-xs"
        />
      </div>
    </div> -->

    <div class="bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-xs font-semibold text-slate-500">
          <span>Inizio (Prima del click)</span>
          <span class="text-blue-600 font-mono">{{ interval.offsetStart }}s</span>
        </div>
        <input 
          type="range" min="-30" max="0" step="1" 
          v-model.number="interval.offsetStart"
          class="w-full accent-blue-900 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
        />
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-xs font-semibold text-slate-500">
          <span>Fine (Dopo il click)</span>
          <span class="text-blue-600 font-mono">+{{ interval.offsetEnd }}s</span>
        </div>
        <input 
          type="range" min="0" max="30" step="1" 
          v-model.number="interval.offsetEnd"
          class="w-full accent-blue-900 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
        />
      </div>
    </div>

    <div class="flex justify-between items-center mt-2">
      <div class="flex flex-col text-[10px] text-slate-400 font-mono">
        <span>Ancoraggio: {{ useTimeFormat().formatMsToTimer(interval.anchorTime) }}</span>
        <span class="font-bold text-slate-700">
          Clip: {{ useTimeFormat().formatMsToTimer(interval.anchorTime + interval.offsetStart) }} - {{ useTimeFormat().formatMsToTimer(interval.anchorTime + interval.offsetEnd) }}
        </span>
      </div>
      
      <div class="flex gap-2">
        <button 
          @click="$emit('remove')"
          class="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
        >
          Elimina
        </button>
        <button 
          @click="isEditing = false"
          class="px-5 py-1.5 text-xs font-black text-white bg-blue-900 hover:bg-blue-950 rounded-md shadow-sm transition-colors"
        >
          Conferma
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VideoIntervalNew } from '@/interfaces/VideoInterval';
import { ref, computed } from 'vue';
import CategoryListbox from './listbox/CategoryListbox.vue';
import { useTimeFormat } from '@/composables/useTimeFormat.ts';

const props = defineProps<{
  interval: VideoIntervalNew
}>();

defineEmits(['remove']);

// Lo stato locale che controlla se stiamo modificando o se è ridotto a riga compatta.
// Quando viene creata una nuova clip, parte aperto in modalità "Editing"
const isEditing = ref(true);

// Computed property per dare un colore al bordo in base alla categoria
const categoryBorderColorClass = computed(() => {
  switch (props.interval.type) {
    case 'GOL': return 'border-green-500';
    case 'TIRO': return 'border-blue-500';
    case 'ESPULSIONE': return 'border-red-500';
    default: return 'border-amber-500'; // Generico
  }
});

</script>