<template>
  <div v-if="isCorrectionMode">
    <button @click.stop.prevent="handleStatClick()" class="flex items-center justify-center w-6 h-6 rounded-full
              transition text-white bg-red-800 border border-red-800
              disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200" 
              :class="[props.disabled ? 'cursor-not-allowed' : 'cursor-pointer']" :disabled="props.disabled">
      <MinusIcon class="size-4 stroke-4 text-white" /> 
    </button>
  </div>

  <div v-else-if="props.type === ShotCategory.EVEN || props.type === ShotCategory.SUP">
    <Menu as="div" v-slot="{ open }">
      <MenuButton
          ref="buttonRef"
          @click.stop.prevent="calculatePosition"
          :as="'button'" 
          class="flex items-center justify-center w-6 h-6 rounded-full
            transition text-white bg-blue-950 border border-blue-950
            disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200" 
          :class="[props.disabled ? 'cursor-not-allowed' : 'cursor-pointer']" :disabled="props.disabled">
        <PlusIcon class="size-4 stroke-3 text-white" />
      </MenuButton>

      <Portal>
        <transition enter="transition ease-out duration-100" enter-from="transform opacity-0 scale-95"
          enter-to="transform opacity-100 scale-100" leave="transition ease-in duration-75"
          leave-from="transform opacity-100 scale-100" leave-to="transform opacity-0 scale-95">
          <MenuItems v-if="open && !props.disabled" class="absolute right-0 bg-white border border-blue-950 
            rounded-md shadow-lg z-50 font-semibold max-w-fit"
            :style="dropdownStyle">
            <div class="grid p-1 gap-x-1"
              :style="{ 
                // Definiamo quante colonne avere. Ogni colonna si adatta al contenuto (max-content)
                gridTemplateColumns: `repeat(${currentColumns}, max-content)`,
                // Opzionale: se vuoi che le righe siano distribuite uniformemente
                gridAutoRows: 'minmax(0, 1fr)'
              }"
            >
              <template v-if="activeStep === 'first'">
                <MenuItem v-for="item in shotOptions[props.type]" :key="item" v-slot="{ active, close }">
                  <button @click.stop.prevent="handleStatClick(item, close)"
                    class="group flex w-full items-center justify-center rounded-md p-1 min-w-8 text-sm whitespace-nowrap"
                    :class="[active ? 'bg-blue-950 text-white' : 'text-blue-950']">
                    {{ getLabel(item, shotOutcomeLabels) }}
                  </button>
                </MenuItem>
              </template>
  
              <template v-else>
                <MenuItem v-for="sub in shotOptions[ShotCategory.OUTCOME]" :key="sub" v-slot="{ active, close }">
                  <button @click.stop.prevent="handleSecondSelect(sub, close)"
                    class="group flex w-full items-center rounded-md p-1 text-sm whitespace-nowrap"
                    :class="active ? 'bg-blue-950 text-white' : 'text-blue-950'">
                    {{ getLabel(sub, shotOutcomeLabels) }}
                  </button>
                </MenuItem>
              </template>
  
            </div>
            <div v-if="activeStep !== 'first'" class="p-1 border-t border-gray-100">
              <MenuItem v-slot="{ active }">
                <button @click.stop.prevent="resetSelection" class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-gray-200 text-blue-950' : 'text-gray-600'">
                  ← Indietro
                </button>
              </MenuItem>
          </div>
          </MenuItems>
        </transition>
      </Portal>
    </Menu>
  </div>

  <div v-else-if="props.type === ShotCategory.PENALTY">
    <Menu as="div" v-slot="{ open }">
      <MenuButton 
              ref="buttonRef"
              @click.stop.prevent="calculatePosition"
              :as="'button'" 
              class="flex items-center justify-center w-6 h-6 rounded-full
              transition text-white bg-blue-950 border border-blue-950
              disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200" 
              :class="[props.disabled ? 'cursor-not-allowed' : 'cursor-pointer']" :disabled="props.disabled">
        <PlusIcon class="size-4 stroke-3 text-white" />
      </MenuButton>

      <Portal>
        <transition enter="transition ease-out duration-100" enter-from="transform opacity-0 scale-95"
          enter-to="transform opacity-100 scale-100" leave="transition ease-in duration-75"
          leave-from="transform opacity-100 scale-100" leave-to="transform opacity-0 scale-95">
          <MenuItems v-if="open && !props.disabled" 
            class="absolute bg-white border border-blue-950 rounded-md shadow-lg z-50 font-semibold"
            :style="dropdownStyle"
          >
            <div class="p-1">
            <MenuItem v-for="sub in shotOptions[ShotCategory.PENALTY]" :key="sub" v-slot="{ active, close }">
              <button @click.stop.prevent="handleSecondSelect(sub, close)"
                class="group flex w-full items-center rounded-md p-1 text-sm"
                :class="active ? 'bg-blue-950 text-white' : 'text-blue-950'">
                {{ getLabel(sub, shotOutcomeLabels) }}
              </button>
            </MenuItem>
          </div>
          </MenuItems>
        </transition>
      </Portal>
    </Menu>
  </div>
</template>


<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, toRef } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem, Portal } from '@headlessui/vue'
import { PlusIcon, MinusIcon } from '@heroicons/vue/24/outline';
import { EvenShot, MenUpShot, ShotOutcome, ShotCategory } from '@/enum/ShotDescription';
import { useGameStore } from '@/stores/gameStore';
import { getLabel } from '@/utils/utils';
import { shotOutcomeLabels } from '@/const/consts';

const gameStore = useGameStore()
const isCorrectionMode = toRef(gameStore, 'isCorrectionMode');

const props = defineProps<{
  disabled: boolean;
  type: string;
}>()

const emit = defineEmits<{
  (e: 'handleShot', payload: { type: ShotCategory, position: string, outcome: ShotOutcome }): void
  (e: 'removeShot', payload: { type: ShotCategory }): void
}>()

const shotOptions: Record<string, string[]> = {
  [ShotCategory.EVEN]: Object.values(EvenShot),
  [ShotCategory.SUP]: Object.values(MenUpShot),
  [ShotCategory.PENALTY]: [ShotOutcome.GOAL, ShotOutcome.SAVED, ShotOutcome.MISSED, ShotOutcome.NULL],
  [ShotCategory.OUTCOME]: [ShotOutcome.GOAL, ShotOutcome.SAVED, ShotOutcome.MISSED, ShotOutcome.BLOCKED]
};

const currentOptionsLength = computed(() => {
  if (activeStep.value === 'first') {
    // Recupera l'array basato sulla prop 'type' (es. PARI, SUP, RIG)
    const firstLevel = shotOptions[props.type];
    return firstLevel ? firstLevel.length : 0;
  } else {
    // Recupera l'array OUTCOME (Gol, Parata, Palo, ecc.)
    const secondLevel = shotOptions[ShotCategory.OUTCOME];
    return secondLevel ? secondLevel.length : 0;
  }
});

const currentColumns = computed(() => {
  // Calcoliamo quante colonne servono per non superare le 4 righe
  return Math.ceil(currentOptionsLength.value / 4);
});

const handleStatClick = (item?: string, close?: () => void) => {
  if (!isCorrectionMode.value && close && item)
    handleFirstSelect(item, close)
  else
    emit("removeShot", {
      type: props.type as ShotCategory
    })
}

const activeStep = ref<'first' | 'second'>('first')
const firstSelection = ref<string | null>(null)

const handleFirstSelect = (item: string, close: () => void) => {
  firstSelection.value = item
  if (item !== ShotOutcome.GOAL) {
    activeStep.value = 'second'
  } else {
    emit('handleShot', {
      type: props.type as ShotCategory,
      position: '',
      outcome: item
    })
    close();
  }
}

const handleSecondSelect = (item: string, close: () => void) => {
  emit('handleShot', {
    type: props.type as ShotCategory,
    position: firstSelection.value ? firstSelection.value : '',
    outcome: item as ShotOutcome
  });
  resetSelection();
  close();
}

const resetSelection = () => {
  activeStep.value = 'first'
  firstSelection.value = null
}

// --- NUOVA LOGICA SMART DROPDOWN ---
const buttonRef = ref<any>(null);
const dropdownStyle = ref({});
const MENU_ESTIMATED_HEIGHT = 170; // Altezza stimata del menu aperto

const calculatePosition = async () => {
  // Aspettiamo che Vue sia pronto
  await nextTick();
  
  const el = buttonRef.value?.$el || buttonRef.value;
  if (!el) return;

  // getBoundingClientRect ci dà le coordinate ESATTE del bottone rispetto allo schermo
  const rect = el.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  
  // Usiamo 'absolute' con scrollY/X per rimanere ancorati al documento
  if (spaceBelow < MENU_ESTIMATED_HEIGHT) {
    // Non c'è spazio: APRI VERSO L'ALTO
    dropdownStyle.value = {
      position: 'absolute',
      top: `${scrollY + rect.top - 4}px`,
      left: `${scrollX + rect.left}px`,
      transform: 'translateY(-100%)',
      transformOrigin: 'bottom left',
    };
  } else {
    // C'è spazio: APRI VERSO IL BASSO
    dropdownStyle.value = {
      position: 'absolute',
      top: `${scrollY + rect.bottom + 4}px`,
      left: `${scrollX + rect.left}px`,
      transformOrigin: 'top left',
    };
  }
};

onMounted(() => {
  window.addEventListener('resize', calculatePosition);
});

onUnmounted(() => {
  window.removeEventListener('resize', calculatePosition);
});
// -----------------------------------

</script>