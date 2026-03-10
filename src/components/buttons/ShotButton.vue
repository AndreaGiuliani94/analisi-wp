<template>
  <div v-if="props.type === ShotCategory.EVEN || ShotCategory.SUP">
    <div v-if="isCorrectionMode">
      <button @click="handleStatClick()" class="flex items-center justify-center w-6 h-6 rounded-full
                transition text-white bg-red-800 border border-red-800
                disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200" 
                :class="[props.disabled ? 'cursor-not-allowed' : 'cursor-pointer']" :disabled="props.disabled">
        <MinusIcon class="size-4 stroke-4 text-white" /> 
      </button>
    </div>
    <div v-else>
      <Menu as="div">
        <MenuButton :as="'button'" class="flex items-center justify-center w-6 h-6 rounded-full
                transition text-white bg-blue-950 border border-blue-950
                disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200" 
                :class="[props.disabled ? 'cursor-not-allowed' : 'cursor-pointer']" :disabled="props.disabled">
          <PlusIcon class="size-4 stroke-3 text-white" />
        </MenuButton>

        <transition enter="transition ease-out duration-100" enter-from="transform opacity-0 scale-95"
          enter-to="transform opacity-100 scale-100" leave="transition ease-in duration-75"
          leave-from="transform opacity-100 scale-100" leave-to="transform opacity-0 scale-95">
          <MenuItems v-if="!props.disabled" class="absolute mt-1 bg-white border border-blue-950 
            rounded-md shadow-lg z-50">
            <div class="p-1">
              <template v-if="activeStep === 'first'">
                <MenuItem v-for="item in shotOptions[props.type]" :key="item" v-slot="{ active, close }">
                <button @click.stop.prevent="handleStatClick(item, close)"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-blue-950 text-white' : 'text-blue-950'">
                  {{ item }}
                </button>
                </MenuItem>
              </template>

              <template v-else>
                <MenuItem v-for="sub in shotOptions[ShotCategory.OUTCOME]" :key="sub" v-slot="{ active, close }">
                <button @click="handleSecondSelect(sub, close)"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-blue-950 text-white' : 'text-blue-950'">
                  {{ sub }}
                </button>
                </MenuItem>

                <!-- Pulsante per tornare indietro -->
                <MenuItem v-slot="{ active }">
                <button @click.stop.prevent="resetSelection" class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-gray-200 text-blue-950' : 'text-gray-600'">
                  ← Indietro
                </button>
                </MenuItem>

              </template>

            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </div>

  <div v-else-if="props.type === ShotCategory.PENALTY">
    <div v-if="isCorrectionMode">
      <ActionButton :icon="MinusIcon" :color="'red'" @click="handleStatClick(props.type)" /> 
    </div>
    <div v-else>
      <Menu as="div">
        <MenuButton :as="'button'" class="flex items-center justify-center w-6 h-6 rounded-full
                transition text-white bg-blue-950 border border-blue-950
                disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200" :class="[
                  props.disabled ? 'cursor-not-allowed' : 'cursor-pointer']" :disabled="props.disabled">
          <PlusIcon class="size-4 stroke-3 text-white" />
        </MenuButton>

        <transition enter="transition ease-out duration-100" enter-from="transform opacity-0 scale-95"
          enter-to="transform opacity-100 scale-100" leave="transition ease-in duration-75"
          leave-from="transform opacity-100 scale-100" leave-to="transform opacity-0 scale-95">
          <MenuItems v-if="!props.disabled" class="absolute mt-1 bg-white border border-blue-950
                rounded-md shadow-lg z-50">
            <div class="p-1">
              <MenuItem v-for="sub in shotOptions[ShotCategory.PENALTY]" :key="sub" v-slot="{ active, close }">
              <button @click="handleSecondSelect(sub, close)"
                class="group flex w-full items-center rounded-md p-1 text-sm"
                :class="active ? 'bg-blue-950 text-white' : 'text-blue-950'">
                {{ sub }}
              </button>
              </MenuItem>

            </div>
          </MenuItems>
        </transition>
      </Menu>

    </div>

  </div>
</template>


<script lang="ts" setup>
import { ref } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { PlusIcon, MinusIcon } from '@heroicons/vue/24/outline';
import { EvenShot, MenUpShot, ShotOutcome, ShotCategory } from '@/enum/ShotDescription';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/gameStore';
import ActionButton from './ActionButton.vue';

const gameStore = useGameStore()
// Usiamo storeToRefs per mantenere la reattività
const { isCorrectionMode } = storeToRefs(gameStore)

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
  [ShotCategory.PENALTY]: [ShotOutcome.GOAL, ShotOutcome.SAVED, ShotOutcome.MISSED],
  [ShotCategory.OUTCOME]: Object.values(ShotOutcome)
};

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

</script>