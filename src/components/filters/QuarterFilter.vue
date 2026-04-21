<template>
  <div 
    class="flex bg-gray-100 rounded-lg space-x-1"
    :class="isModal ? '' : 'my-2 p-1 bg-slate-200'"
  >
    <button 
      @click="selectQuarter(null)"
      class="px-3 py-1 text-xs font-semibold rounded-md transition-colors"
      :class="modelValue === null ? 'bg-blue-950 text-white shadow' : 'text-gray-600 hover:bg-gray-200'"
    >
      Tutti
    </button>
    
    <button 
      v-for="q in 4" :key="q"
      @click="selectQuarter(q)"
      class="px-3 py-1 text-xs font-semibold rounded-md transition-colors"
      :class="modelValue === q ? 'bg-blue-950 text-white shadow' : 'text-gray-600 hover:bg-gray-200'"
    >
      {{ q }}° Q
    </button>
  </div>
</template>

<script setup lang="ts">
// Definiamo le props, impostando isModal come opzionale (di default false)
const props = withDefaults(defineProps<{
  modelValue: number | null;
  isModal?: boolean;
}>(), {
  isModal: false
});

// Dichiariamo l'evento di aggiornamento per far funzionare il v-model
const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

// Metodo helper per emettere il nuovo valore quando si clicca
const selectQuarter = (val: number | null) => {
  emit('update:modelValue', val);
};
</script>