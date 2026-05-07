<template>
  <Menu as="div" class="relative inline-block text-left">
    <MenuButton 
      ref="buttonRef"
      @click="calculatePosition"
      class="inline-flex items-center gap-2 px-4 py-2 bg-blue-950 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-md active:bg-blue-900 transition-all duration-100"
    >
      Opzioni Partita
      <ChevronUpDownIcon class="size-4" aria-hidden="true" />
    </MenuButton>

    <Portal>
        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems 
            :style="dropdownStyle"
            class="fixed w-40 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-100 overflow-hidden border border-slate-100"
          >
            <div class="p-1">
                <MenuItem v-slot="{ active }">
                    <button
                    @click="$emit('end')"
                    :class="[
                        active ? 'bg-blue-50 text-blue-950' : 'text-slate-700',
                        'group flex w-full items-center p-2 text-sm font-semibold rounded-lg transition-colors'
                    ]"
                    >
                    <CheckCircleIcon class="mr-3 size-5 text-slate-400 group-hover:text-blue-600" aria-hidden="true" />
                      Termina
                    </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                    <button
                    @click="$emit('restart')"
                    :class="[
                        active ? 'bg-red-50 text-red-700' : 'text-slate-700',
                        'group flex w-full items-center p-2 text-sm font-semibold rounded-lg transition-colors'
                    ]"
                    >
                    <ArrowPathIcon class="mr-3 size-5 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
                      Riavvia
                    </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                    <button
                    @click="$emit('suspend')"
                    :class="[
                        active ? 'bg-red-50 text-red-700' : 'text-slate-700',
                        'group flex w-full items-center p-2 text-sm font-semibold rounded-lg transition-colors'
                    ]"
                    >
                    <PauseCircleIcon class="mr-3 size-5 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
                      Sospendi
                    </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                    <button
                    @click="$emit('cancel')"
                    :class="[
                        active ? 'bg-red-50 text-red-700' : 'text-slate-700',
                        'group flex w-full items-center p-2 text-sm font-semibold rounded-lg transition-colors'
                    ]"
                    >
                    <XCircleIcon class="mr-3 size-5 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
                      Annulla
                    </button>
                </MenuItem>
            </div>
          </MenuItems>
        </transition>
    </Portal>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems, Portal } from '@headlessui/vue'
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { ArrowPathIcon, ChevronUpDownIcon, CheckCircleIcon, XCircleIcon, PauseCircleIcon } from '@heroicons/vue/24/outline';

defineEmits(['restart', 'end', 'cancel', 'suspend'])

const buttonRef = ref<any>(null);
const dropdownStyle = ref<any>({});

const calculatePosition = async () => {
  await nextTick();
  
  const el = buttonRef.value?.$el || buttonRef.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  
  // Verifichiamo se c'è spazio sotto (altezza stimata menu 160px)
  const spaceBelow = window.innerHeight - rect.bottom;
  const menuHeight = 160; 

  if (spaceBelow < menuHeight) {
    // Apri verso l'alto
    dropdownStyle.value = {
      top: `${scrollY + rect.top - 4}px`,
      left: `${scrollX + rect.right}px`,
      transform: 'translateX(-100%) translateY(-100%)',
    };
  } else {
    // Apri verso il basso
    dropdownStyle.value = {
      top: `${scrollY + rect.bottom + 4}px`,
      left: `${scrollX + rect.right}px`,
      transform: 'translateX(-100%)',
    };
  }
};

onMounted(() => {
  window.addEventListener('resize', calculatePosition);
});

onUnmounted(() => {
  window.removeEventListener('resize', calculatePosition);
});
</script>
