<template>
    <div class="w-full mx-auto">
    <Listbox :modelValue="modelValue" @update:modelValue="updateSelection">
      <div class="relative mt-1">
        <ListboxButton class="relative w-full rounded-lg bg-white border-2 border-gray-300 py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          
          <span class="block truncate">{{ modelValue  || "Seleziona una categoria" }}</span>
          <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <!-- <ChevronUpDownIcon
              class="h-5 w-5 text-gray-400"
              aria-hidden="true"
            /> -->
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions class="absolute mt-1 max-h-20 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            <!-- Sezione Attacco -->
            <div v-if="tactics.attacco.length" class="p-2 font-bold text-gray-700">Attacco</div>
            <ListboxOption 
              v-for="(tactic, index) in tactics.attacco" 
              :key="'attacco-' + index" 
              v-slot="{ active, selected }"
              :value="tactic"
            >
              <li 
                :class="[
                  'cursor-pointer p-2 rounded',
                  active ? 'bg-blue-500 text-white' : 'text-gray-900'
                ]"
              >
                {{ tactic }}
              </li>
            </ListboxOption>

            <!-- Sezione Difesa -->
            <div v-if="tactics.difesa.length" class="p-2 font-bold text-gray-700">Difesa</div>
            <ListboxOption 
              v-for="(tactic, index) in tactics.difesa" 
              :key="'difesa-' + index" 
              v-slot="{ active, selected }"
              :value="tactic"
            >
              <li 
                :class="[
                  'cursor-pointer p-2 rounded',
                  active ? 'bg-red-500 text-white' : 'text-gray-900'
                ]"
              >
                {{ tactic }}
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
</div>
</template>

<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import axios from 'axios';
import { onMounted, ref } from 'vue';

interface TacticsData {
  attacco: string[];
  difesa: string[];
}

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const tactics = ref<TacticsData>({ attacco: [], difesa: [] });

const fetchTactics = async () => {
  try {
    const response = await axios.get<TacticsData>("http://127.0.0.1:8000/categories/");
    tactics.value = response.data;
  } catch (error) {
    console.error("Errore nel recupero delle tattiche:", error);
  }
};

onMounted(fetchTactics);

const updateSelection = (selectedTactic: string) => {
  emit("update:modelValue", selectedTactic);
};

</script>