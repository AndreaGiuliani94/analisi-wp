<template>
  <div class="flex flex-col w-full mx-auto">
    <Listbox :modelValue="modelValue" @update:modelValue="updateSelection" >
      <ListboxLabel class="text-sm font-medium">Categoria:</ListboxLabel>
      <div class="relative">
        <ListboxButton
          class="relative z-5 h-8 w-full rounded-md bg-white border-1 border-gray-300 pl-3 pr-10 text-left sm:text-sm active:ring-2 active:ring-sky-300">

          <span class="truncate">{{ modelValue || "Seleziona una categoria" }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              class="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>

        <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
          leave-to-class="opacity-0">
          <ListboxOptions
            class="absolute mt-1 max-h-80 w-full z-10 overflow-auto rounded-md bg-white py-1 text-base shadow-lg  sm:text-sm">
            
            <!-- Sezione Attacco -->
            <div v-if="tactics?.attacco.length" class="py-2 px-4 font-bold ">Attacco</div>
            <ListboxOption v-for="(tactic, index) in tactics?.attacco" :key="'attacco-' + index"
              v-slot="{ active, selected }" :value="tactic">
              <li :class="[
                'relative cursor-pointer select-none py-2 pl-10 pr-4 rounded',
                active ? 'bg-sky-300 text-white' : ''
              ]">
              <span
                  :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'truncate',
                  ]"
                  >{{ tactic }}</span
                >
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-500"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
                
              </li>
            </ListboxOption>

            <!-- Sezione Difesa -->
            <div v-if="tactics?.difesa.length" class="py-2 px-4 font-bold ">Difesa</div>
            <ListboxOption v-for="(tactic, index) in tactics?.difesa" :key="'difesa-' + index"
              v-slot="{ active, selected }" :value="tactic">
              <li :class="[
                'relative cursor-pointer select-none py-2 pl-10 pr-4 rounded',
                active ? 'bg-amber-400 text-white' : ''
              ]">
                <span
                  :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'truncate',
                  ]"
                  >{{ tactic }}</span
                >
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-500"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import { useVideoStore } from "@/stores/videoStore";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel } from "@headlessui/vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();


const updateSelection = (selectedTactic: string) => {
  emit("update:modelValue", selectedTactic);
};

const videoStore = useVideoStore();

const tactics = videoStore.tactics;

</script>