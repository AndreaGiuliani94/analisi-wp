<template>
  <div class="">
    <Menu as="div">
      <MenuButton
        :as="'button'"
        class="flex items-center justify-center min-w-6 h-6 border rounded-full text-xs font-bold
               transition cursor-pointer
               "
        :class=" (props.exclutionState) ?
          'bg-red-800 text-white border-red-800 disabled:text-gray-200 disabled:border-red-800 disabled:bg-red-800 disabled:cursor-not-allowed': 
          'bg-white text-red-800 border-red-800 disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed'
        "
        :disabled="props.disabled"
      >
      {{ props.exclutionState ? props.exclutionState : '' }}

      </MenuButton>

      <transition
        enter="transition ease-out duration-100"
        enter-from="transform opacity-0 scale-95"
        enter-to="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leave-from="transform opacity-100 scale-100"
        leave-to="transform opacity-0 scale-95"
      >
        <MenuItems
          v-if="!props.disabled"
          class="mt-1 absolute bg-white border border-red-800 
          rounded-md shadow-lg z-50 flex flex-col"
        >
          <div class="grid p-1 gap-x-1"
              :style="{ 
                // Definiamo quante colonne avere. Ogni colonna si adatta al contenuto (max-content)
                gridTemplateColumns: `repeat(${currentColumns}, max-content)`,
                // Opzionale: se vuoi che le righe siano distribuite uniformemente
                gridAutoRows: 'minmax(0, 1fr)'
              }"
            >

            <template v-if="activeStep === 'first'">
              <MenuItem
                v-for="item in foulKeys"
                :key="item"
                v-slot="{ active }"
              >
                <button
                  @click.stop.prevent="handleFirstSelect(item)"
                  class="group flex w-full items-center rounded-md p-1 text-sm whitespace-nowrap"
                  :class="active ? 'bg-red-800 text-white' : 'text-blue-950'"
                >
                  {{ getFoulValue(item) }}
                </button>
              </MenuItem>
              <template v-if="props.exclutionState">
                <MenuItem v-slot="{ active, close }">
                  <button
                    @click="removeExclusion(close)"
                    class="group flex w-full items-center justify-center rounded-md p-1 text-sm whitespace-nowrap"
                    :class="active ? 'bg-gray-200 text-blue-950' : 'text-gray-600'"
                  >
                    <XCircleIcon 
                    class="size-5 pe-1"/> Rimuovi 
                  </button>
                </MenuItem>
              </template>
            </template>

            <template v-else-if="activeStep === 'second'">
              <MenuItem
                v-for="sub in availableSecondOptions"
                :key="sub"
                v-slot="{ active, close }"
              >
                <button
                  @click.stop.prevent="handleSecondSelect(sub, close)"
                  class="group flex w-full items-center rounded-md p-1 text-sm whitespace-nowrap"
                  :class="active ? 'bg-red-800 text-white' : 'text-blue-950'"
                >
                  {{ sub }}
                </button>
              </MenuItem>
            </template>

            <template v-else-if="activeStep === 'third'">
              <MenuItem
                v-for="sub in thirdLevelOptions"
                :key="sub"
                v-slot="{ active, close }"
              >
                <button
                  @click.stop.prevent="handleThirdSelect(sub, close)"
                  class="group flex w-full items-center rounded-md p-1 text-sm whitespace-nowrap"
                  :class="active ? 'bg-red-800 text-white' : 'text-blue-950'"
                >
                  {{ sub }}
                </button>
              </MenuItem>
            </template>

            <template v-else-if="activeStep === 'fourth'">
              <MenuItem
                v-for="sub in fourthLevelOptions"
                :key="sub"
                v-slot="{ active, close }"
              >
                <button
                  @click="handleFourthSelect(sub, close)"
                  class="group flex w-full items-center justify-center rounded-md px-2 py-1 min-w-8 text-sm whitespace-nowrap"
                  :class="active ? 'bg-red-800 text-white' : 'text-blue-950'"
                >
                  {{ sub === 0 ? 'ND' : sub }}
                </button>
              </MenuItem>
            </template>
          </div>
          <div v-if="activeStep !== 'first'" class="p-1 border-t border-gray-100">
            <MenuItem v-slot="{ active }">
              <button
                @click.stop.prevent="handleBack"
                class="group flex w-full items-center justify-center rounded-md p-1 text-sm whitespace-nowrap font-semibold"
                :class="active ? 'bg-gray-200 text-blue-950' : 'text-gray-500'"
              >
                ← Indietro
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { XCircleIcon } from "@heroicons/vue/24/outline";
import { EDCSType, FoulDescription, FoulPosition, FoulType } from '@/enum/ExclutionDescription';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const props = defineProps<{
  disabled?: boolean,
  exclutionState: string,
  team: number,
}>()

const emit = defineEmits<{
  (e: 'handleExclution', payload: { type: string, position: string, ball: boolean, earnedBy: number, }): void
  (e: 'remove'): void
}>()

// Stati possibili: 'idle', 'selected'
const state = ref<'idle' | 'selected'>('idle');
const activeStep = ref<'first' | 'second' | 'third' | 'fourth'>('first');
const firstSelection = ref<string | null>(null);
const secondSelection = ref<string | null>(null);
const thirdSelection = ref<string | null>(null);
const selectedCode = ref<string | null>(null);

const foulKeys = computed(() => Object.keys(secondLevelOptions) as (keyof typeof FoulType)[])

const secondLevelOptions: Record<keyof typeof FoulType, string[]> = {
  EXCL: Object.values(FoulPosition),
  PEN: Object.values(FoulPosition),
  EDCS: Object.values(EDCSType)
};

function getFoulValue(key: keyof typeof FoulType): FoulType {
  return FoulType[key]
}

const thirdLevelOptions: string[] = Object.values(FoulDescription);

const fourthLevelOptions: number[] = [
  ...(props.team === 0 
        ? gameStore.actualOpponents.map(player => player.number) 
        : gameStore.actualPlayers.map(player => player.number)
  ),
  0
];

const currentOptionsLength = computed(() => {
  switch (activeStep.value) {
    case 'first': 
      return foulKeys.value.length + (props.exclutionState ? 1 : 0);
    case 'second': 
      return availableSecondOptions.value.length;
    case 'third': 
      return thirdLevelOptions.length;
    case 'fourth': 
      return fourthLevelOptions.length;
    default: 
      return 0;
  }
});

const currentColumns = computed(() => {
  // Calcoliamo quante colonne servono per non superare le 4 righe
  return Math.ceil(currentOptionsLength.value / 4);
});

const handleFirstSelect = (item: string) => {
  firstSelection.value = item;
  activeStep.value = 'second';
}

const handleSecondSelect = (item: string, close: () => void) => {
  if(firstSelection.value === FoulType.EDCS) {
    selectedCode.value = `${item.toUpperCase().substring(0,1)}`
    state.value = 'selected'
    if(firstSelection.value) {
      emit('handleExclution', {
        type: firstSelection.value,
        position: item,
        ball: false,
        earnedBy: 0
      })
    }
    resetSelection();
    close();
  }
  else {
    selectedCode.value = `${firstSelection.value?.charAt(0)}-${item.charAt(0)}`
    secondSelection.value = item;
    if(secondSelection.value == FoulPosition.OTHER && firstSelection.value) {
      emit('handleExclution', {
        type: firstSelection.value,
        position: secondSelection.value,
        ball: false,
        earnedBy: 0
      })
      resetSelection();
      close();
    }
    activeStep.value = 'third';
  }
}

const handleThirdSelect = (item: string, close: () => void) => {
  thirdSelection.value = item;
  activeStep.value = 'fourth';
}

const handleFourthSelect = (item: number, close: () => void) => {
  state.value = 'selected'
  if(firstSelection.value && secondSelection.value && thirdSelection.value) {
    emit('handleExclution', {
      type: FoulType[firstSelection.value as (keyof typeof FoulType)],
      position: secondSelection.value,
      ball: thirdSelection.value == FoulDescription.WITH,
      earnedBy: item
    })
  }
  resetSelection();
  close();
}

const availableSecondOptions = computed(() => {
  return firstSelection.value ? secondLevelOptions[firstSelection.value as keyof typeof secondLevelOptions] || [] : []
})

const handleBack = () => {
  if (activeStep.value === 'second') {
    resetSelection();
    return;
  }
  
  back();
};

const resetSelection = () => {
  activeStep.value = 'first'
  firstSelection.value = null
  secondSelection.value = null
}

const back = () => {
  if(activeStep.value === 'third') { 
    activeStep.value = 'second';
    secondSelection.value = null;
  } else {
    activeStep.value = 'third';
    thirdSelection.value = null;
  }
}

const removeExclusion = (close: () => void) => {
  state.value = 'idle';
  resetSelection();
  selectedCode.value = '';
  emit('remove');
  close();
}

</script>
