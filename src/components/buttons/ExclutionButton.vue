<template>
  <div class="">
    <Menu as="div">
      <MenuButton
        :as="'button'"
        class="flex items-center justify-center min-w-6 h-6 border rounded-full text-xs font-bold
               transition disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200
               cursor-pointer
               "
        :class=" (state === 'selected' || props.exclutionState) ?
          'bg-red-600 text-white border-red-600': 'bg-white text-red-600 border-red-600'
        "
        :disabled="props.disabled"
      >
      {{ props.exclutionState ? props.exclutionState : selectedOption || '' }}

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
          class=" mt-1 absolute bg-white border border-red-200 divide-x divide-gray-100 rounded-md shadow-lg focus:outline-none z-50"
        >
          <div class="px-1 py-1">

            <template v-if="activeStep === 'first'">
              <MenuItem
                v-for="item in Object.keys(secondLevelOptions)"
                :key="item"
                v-slot="{ active }"
              >
                <button
                  @click.stop.prevent="handleFirstSelect(item)"
                  class="group flex w-full items-center rounded-md px-2 py-2 text-sm"
                  :class="active ? 'bg-red-500 text-white' : 'text-gray-900'"
                >
                  {{ item }}
                </button>
              </MenuItem>
            </template>

            <template v-else>
              <MenuItem
                v-for="sub in availableSecondOptions"
                :key="sub"
                v-slot="{ active }"
              >
                <button
                  @click="handleSecondSelect(sub)"
                  class="group flex w-full items-center rounded-md px-2 py-2 text-sm"
                  :class="active ? 'bg-red-500 text-white' : 'text-gray-900'"
                >
                  {{ sub }}
                </button>
              </MenuItem>

              <!-- Pulsante per tornare indietro -->
              <MenuItem v-slot="{ active }">
                <button
                  @click.stop.prevent="resetSelection"
                  class="group flex w-full items-center rounded-md px-2 py-2 text-sm"
                  :class="active ? 'bg-gray-200 text-gray-900' : 'text-gray-600'"
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

const props = defineProps<{
  disabled?: boolean,
  exclutionState: string
}>()

const emit = defineEmits<{
  (e: 'handleExclution', payload: { type: string, position: string }): void
}>()

// Stati possibili: 'idle', 'selected'
const state = ref<'idle' | 'selected'>('idle')
const activeStep = ref<'first' | 'second'>('first')
const firstSelection = ref<string | null>(null)
const selectedOption = ref<string | null>(null)

const secondLevelOptions: Record<string, string[]> = {
  'Espulsione': ['1', '2', '3', '4', '5', 'CB', 'Ripartenza'],
  'Rigore': ['1', '2', '3', '4', '5', 'CB', 'Ripartenza'],
  'EDCS': ['Brutalità', 'Gioco Violento', 'Proteste']
}

const handleFirstSelect = (item: string) => {
  firstSelection.value = item
  activeStep.value = 'second'
}

const handleSecondSelect = (item: string) => {
  selectedOption.value = `${firstSelection.value?.charAt(0)}-${item.charAt(0)}`
  state.value = 'selected'
  close();
  if(firstSelection.value) {
    emit('handleExclution', {
      type: firstSelection.value,
      position: item
    })
  }
}

const availableSecondOptions = computed(() => {
  return firstSelection.value ? secondLevelOptions[firstSelection.value] || [] : []
})

const resetSelection = () => {
  activeStep.value = 'first'
  firstSelection.value = null
}

</script>
