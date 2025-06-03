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
          rounded-md shadow-lg z-50"
        >
          <div class="p-1">

            <template v-if="activeStep === 'first'">
              <MenuItem
                v-for="item in Object.keys(secondLevelOptions)"
                :key="item"
                v-slot="{ active }"
              >
                <button
                  @click.stop.prevent="handleFirstSelect(item)"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-red-800 text-white' : 'text-blue-950'"
                >
                  {{ item }}
                </button>
              </MenuItem>
              <template v-if="props.exclutionState">
                <MenuItem v-slot="{ active, close }">
                  <button
                    @click="removeExclusion(close)"
                    class="group flex w-full items-center justify-center rounded-md p-1 text-sm"
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
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-red-800 text-white' : 'text-blue-950'"
                >
                  {{ sub }}
                </button>
              </MenuItem>

              <!-- Pulsante per tornare indietro -->
              <MenuItem v-slot="{ active }">
                <button
                  @click.stop.prevent="resetSelection"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-gray-200 text-blue-950' : 'text-gray-600'"
                >
                  ← Indietro
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
                  @click="handleThirdSelect(sub, close)"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-red-800 text-white' : 'text-blue-950'"
                >
                  {{ sub }}
                </button>
              </MenuItem>

              <!-- Pulsante per tornare indietro -->
              <MenuItem v-slot="{ active }">
                <button
                  @click.stop.prevent="back"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-gray-200 text-blue-950' : 'text-gray-600'"
                >
                  ← Indietro
                </button>
              </MenuItem>

            </template>
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

const props = defineProps<{
  disabled?: boolean,
  exclutionState: string
}>()

const emit = defineEmits<{
  (e: 'handleExclution', payload: { type: string, position: string, ball: boolean }): void
  (e: 'remove'): void
}>()

// Stati possibili: 'idle', 'selected'
const state = ref<'idle' | 'selected'>('idle');
const activeStep = ref<'first' | 'second' | 'third'>('first');
const firstSelection = ref<string | null>(null);
const secondSelection = ref<string | null>(null);
const selectedCode = ref<string | null>(null);

const secondLevelOptions: Record<string, string[]> = {
  'Espulsione': ['Perimetro', 'Centroboa', 'Ripartenza'],
  'Rigore': ['Perimetro', 'Centroboa', 'Ripartenza'],
  'EDCS': ['Brutalità', 'Gioco Violento', 'Proteste']
}

const thirdLevelOptions: string[] = ['Con palla', 'Senza palla'];

const handleFirstSelect = (item: string) => {
  firstSelection.value = item;
  activeStep.value = 'second';
}

const handleSecondSelect = (item: string, close: () => void) => {
  if(firstSelection.value === 'EDCS') {
    selectedCode.value = `${item.toUpperCase().substring(0,1)}`
    state.value = 'selected'
    if(firstSelection.value) {
      emit('handleExclution', {
        type: firstSelection.value,
        position: item,
        ball: false
      })
    }
    resetSelection();
    close();
  }
  else {
    selectedCode.value = `${firstSelection.value?.charAt(0)}-${item.charAt(0)}`
    secondSelection.value = item;
    activeStep.value = 'third';
  }
}

const handleThirdSelect = (item: string, close: () => void) => {
  state.value = 'selected'
  if(firstSelection.value && secondSelection.value) {
    emit('handleExclution', {
      type: firstSelection.value,
      position: secondSelection.value,
      ball: item == "Con palla"
    })
  }
  resetSelection();
  close();
}

const availableSecondOptions = computed(() => {
  return firstSelection.value ? secondLevelOptions[firstSelection.value] || [] : []
})

const resetSelection = () => {
  activeStep.value = 'first'
  firstSelection.value = null
  secondSelection.value = null
}

const back = () => {
  activeStep.value = 'second';
  secondSelection.value = null;
}

const removeExclusion = (close: () => void) => {
  state.value = 'idle';
  resetSelection();
  selectedCode.value = '';
  emit('remove');
  close();
}

</script>
