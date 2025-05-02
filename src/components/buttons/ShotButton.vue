<template>
  <div class="">

  </div>
  <div v-if="props.type === 'EVEN' || props.type === 'SUP'">
    <Menu as="div">
      <MenuButton
        :as="'button'"
        class="flex items-center justify-center w-6 h-6 rounded-full border
               text-sm font-bold transition cursor-pointer
               disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200"
        :class="props.disabled
          ? 'cursor-not-allowed'
          : 'text-white bg-sky-500 border border-sky-500'"
        :disabled="props.disabled"
      >
      {{ props.isGoal ? 'G' : 'T' }}
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
          class="absolute mt-1 bg-white border border-sky-200 
          rounded-md shadow-lg z-50"
        >
          <div class="p-1">
            <template v-if="activeStep === 'first'">
                <MenuItem
                  v-for="item in shotOptions[props.type]"
                  :key="item"
                  v-slot="{ active, close }"
                >
                  <button  v-if="!props.isGoal"
                    @click.stop.prevent="handleFirstSelect(item, close)"
                    class="group flex w-full items-center rounded-md p-1 text-sm"
                    :class="active ? 'bg-sky-500 text-white' : 'text-gray-900'"
                  >
                    {{ item }}
                  </button>

                  <button  v-else
                    @click="handleFirstSelect(item, close)"
                    class="group flex w-full items-center rounded-md p-1 text-sm"
                    :class="active ? 'bg-sky-500 text-white' : 'text-gray-900'"
                  >
                    {{ item }}
                  </button>
                </MenuItem>
            </template>

            <template v-else>
              <MenuItem
                v-for="sub in shotOptions['OUT']"
                :key="sub"
                v-slot="{ active, close }"
              >
                <button
                  @click="handleSecondSelect(sub, close)"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-sky-500 text-white' : 'text-gray-900'"
                >
                  {{ sub }}
                </button>
              </MenuItem>

              <!-- Pulsante per tornare indietro -->
              <MenuItem v-slot="{ active }">
                <button
                  @click.stop.prevent="resetSelection"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
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

  <div v-else-if="props.type==='PENALTY'">
    <div v-if="props.isGoal">
        <button class="flex items-center justify-center w-6 h-6 rounded-full border
          text-sm font-bold transition cursor-pointer
          disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200"
          :class="props.disabled
          ? 'cursor-not-allowed'
          : 'text-white bg-sky-500 border border-sky-500'"
          :disabled="props.disabled"
          @click="handleZeroSelect"
        >
            {{ 'G' }}
        </button>
    </div>
    <div v-else>
        <Menu as="div">
            <MenuButton
                :as="'button'"
                class="flex items-center justify-center w-6 h-6 rounded-full border
                    text-sm font-bold transition cursor-pointer
                    disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200"
                :class="props.disabled
                ? 'cursor-not-allowed'
                : 'text-white bg-sky-500 border border-sky-500'"
                :disabled="props.disabled"
            >
            {{ 'T' }}
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
                class="absolute mt-1 bg-white border border-sky-200
                rounded-md shadow-lg z-50"
                >
                    <div class="p-1">                    
                        <MenuItem
                            v-for="sub in shotOptions['OUT']"
                            :key="sub"
                            v-slot="{ active, close }"
                        >
                            <button
                            @click="handleSecondSelect(sub, close)"
                            class="group flex w-full items-center rounded-md p-1 text-sm"
                            :class="active ? 'bg-sky-500 text-white' : 'text-gray-900'"
                            >
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
import { defineProps, ref } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const props = defineProps<{
  disabled: boolean;
  type: string;
  isGoal: boolean;
}>()

const emit = defineEmits<{
  (e: 'handleShot', payload: { type: string, position: string, outcome: string }): void
}>()

const shotOptions: Record<string, string[]> = {
  'EVEN': ['1', '2', '3', '4', '5', 'CB', 'Ripartenza'],
  'SUP': ['1', '2', '3', '4', 'P5', 'P6', 'Ripartenza'],
  'OUT': ['Parato', 'Fuori']
}

const activeStep = ref<'first' | 'second'>('first')
const firstSelection = ref<string | null>(null)
const selectedOption = ref<string | null>(null)

const handleZeroSelect = () => {
  emit('handleShot', {
      type: props.type,
      position: '',
      outcome: 'GOAL'
    })
}

const handleFirstSelect = (item: string, close: () => void) => {
  firstSelection.value = item
  if(!props.isGoal){
    activeStep.value = 'second'
  } else {
    emit('handleShot', {
      type: props.type,
      position: item ? item : '',
      outcome: 'GOAL'
    })
    close();
  }
}

const handleSecondSelect = (item: string, close: () => void) => {
  selectedOption.value = `${firstSelection.value?.charAt(0)}-${item.charAt(0)}`
  emit('handleShot', {
      type: props.type,
      position: firstSelection.value ? firstSelection.value : '',
      outcome: item
    });
  resetSelection();
  close();
}

const resetSelection = () => {
  activeStep.value = 'first'
  firstSelection.value = null
}

</script>