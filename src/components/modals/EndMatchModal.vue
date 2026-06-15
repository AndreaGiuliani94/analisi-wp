<template>
  <BaseModal :isOpen="isOpen" title="Concludi Partita" @close="$emit('close')">
    <div class="mt-4 text-sm text-slate-500 font-medium">
        <p class="">
            Vuoi terminare il match o procedere con i rigori? 
        </p>
        <p>
            Scegli come procedere.
        </p>
    </div>

    <div class="mt-8 flex flex-col gap-3">
      <button
        type="button"
        class="inline-flex justify-center items-center gap-2 rounded-xl bg-blue-950 px-4 py-3 text-sm font-bold text-white hover:bg-blue-900 transition-all shadow-md active:scale-95"
        @click="$emit('confirmEnd')"
      >
        <CheckCircleIcon class="size-5" />
        Termina Partita
      </button>
      
      <button
        v-if="!hidePenalties"
        type="button"
        class="inline-flex justify-center items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-all shadow-md active:scale-95"
        @click="$emit('goToPenalties')"
      >
        <TrophyIcon class="size-5" />
        Vai ai Rigori
      </button>

      <button
        type="button"
        class="mt-2 inline-flex justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
        @click="$emit('close')"
      >
        Annulla
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import { CheckCircleIcon, TrophyIcon } from '@heroicons/vue/20/solid'

defineProps<{
  isOpen: boolean,
  hidePenalties?: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirmEnd'): void
  (e: 'goToPenalties'): void
}>()
</script>
