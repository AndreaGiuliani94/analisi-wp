<template>
  <Transition
    enter-active-class="transform transition ease-out duration-500"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="modelValue" class="fixed top-24 right-4 z-100 w-72 pointer-events-none">
      <div :class="[
        'bg-white rounded-2xl shadow-2xl border-l-8 overflow-hidden flex items-center p-4 gap-4 transition-all',
        isHome ? 'border-red-800' : 'border-blue-800'
      ]">
        <!-- Icona dinamica -->
        <div :class="[
          'size-12 rounded-full flex items-center justify-center shrink-0 animate-bounce',
          isHome ? 'bg-red-50 text-red-900' : 'bg-blue-50 text-blue-800'
        ]">
          <component :is="icon || InformationCircleIcon" class="size-7" />
        </div>

        <!-- Messaggio -->
        <div class="flex flex-col min-w-0">
          <span v-if="title" class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ title }}
          </span>
          <h4 class="text-blue-950 font-bold text-lg leading-tight">
            {{ message }}
          </h4>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { InformationCircleIcon } from '@heroicons/vue/24/solid';

defineProps<{
  modelValue: boolean;
  message: string;
  title?: string;
  isHome?: boolean;
  icon?: any;
}>();
</script>
