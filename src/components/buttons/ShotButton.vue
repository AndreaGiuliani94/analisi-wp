<template>
  <div v-if="props.type === 'EVEN' || props.type === 'SUP'">
    <Menu as="div">
      <MenuButton
        :as="'button'"
        class="flex items-center justify-center w-6 h-6 rounded-full border
               transition cursor-pointer
               disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200"
        :class="props.disabled
          ? 'cursor-not-allowed'
          : 'text-white bg-blue-950 border border-blue-950'"
        :disabled="props.disabled"
      >
      <PlusIcon class="size-4 stroke-[2.5] text-white"></PlusIcon>
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
          class="absolute mt-1 bg-white border border-blue-950 
          rounded-md shadow-lg z-50"
        >
          <div class="p-1">
            <template v-if="activeStep === 'first'">
                <MenuItem
                  v-for="item in shotOptions[props.type]"
                  :key="item"
                  v-slot="{ active, close }"
                >
                  <button
                    @click.stop.prevent="handleFirstSelect(item, close)"
                    class="group flex w-full items-center rounded-md p-1 text-sm"
                    :class="active ? 'bg-blue-950 text-white' : 'text-blue-950'"
                  >
                    {{ item }}
                  </button>
                </MenuItem>
            </template>

            <template v-else>
              <MenuItem
                v-for="sub in shotOptions['OUTCOME']"
                :key="sub"
                v-slot="{ active, close }"
              >
                <button
                  @click="handleSecondSelect(sub, close)"
                  class="group flex w-full items-center rounded-md p-1 text-sm"
                  :class="active ? 'bg-blue-950 text-white' : 'text-blue-950'"
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

          </div>
        </MenuItems>
      </transition>
    </Menu>
  </div>

  <div v-else-if="props.type==='PENALTY'">
    <div>
        <Menu as="div">
            <MenuButton
                :as="'button'"
                class="flex items-center justify-center w-6 h-6 rounded-full border
                    transition cursor-pointer
                    disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200"
                :class="props.disabled
                ? 'cursor-not-allowed'
                : 'text-white bg-blue-950 border border-blue-950'"
                :disabled="props.disabled"
            >
            <PlusIcon class="size-4 stroke-[2.5] text-white"></PlusIcon>
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
                class="absolute mt-1 bg-white border border-blue-950
                rounded-md shadow-lg z-50"
                >
                    <div class="p-1">                    
                        <MenuItem
                            v-for="sub in shotOptions['OUTCOME']"
                            :key="sub"
                            v-slot="{ active, close }"
                        >
                            <button
                            @click="handleSecondSelect(sub, close)"
                            class="group flex w-full items-center rounded-md p-1 text-sm"
                            :class="active ? 'bg-blue-950 text-white' : 'text-blue-950'"
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
import { ref } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { PlusIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  disabled: boolean;
  type: string;
}>()

const emit = defineEmits<{
  (e: 'handleShot', payload: { type: string, position: string, outcome: string }): void
}>()

const shotOptions: Record<string, string[]> = {
  'EVEN': ['1', '2', '3', '4', '5', 'CB', 'Ripartenza'],
  'SUP': ['1', '2', '3', '4', 'P5', 'P6', 'Ripartenza'],
  'OUTCOME': ['Goal', 'Parato', 'Fuori', 'Stoppato']
}

const activeStep = ref<'first' | 'second'>('first')
const firstSelection = ref<string | null>(null)

const handleFirstSelect = (item: string, close: () => void) => {
  firstSelection.value = item
  if(item !== 'GOAL'){
    activeStep.value = 'second'
  } else {
    emit('handleShot', {
      type: props.type,
      position: '',
      outcome: item
    })
    close();
  }
}

const handleSecondSelect = (item: string, close: () => void) => {
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