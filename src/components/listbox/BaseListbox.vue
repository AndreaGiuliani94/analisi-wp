<template>
  <Listbox
    as="div"
    :model-value="modelValue"
    @update:model-value="handleSelect"
    :disabled="disabled || loading"
  >
    <div class="relative">
      <ListboxButton
        @click="emit('open')"
        class="relative w-full rounded-md bg-white text-left border"
        :class="[
          sizeClasses, 
          themeClasses.button,
          disabled || loading ? 'opacity-60 cursor-not-allowed disabled:bg-gray-200 disabled:border-gray-400' : 'cursor-pointer shadow-sm hover:bg-gray-50 active:ring-2'
        ]"
      >
        <span class="block truncate font-normal">
          {{ displayLabel }}
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
        :class="themeClasses.options"
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <div v-if="loading" class="relative cursor-default select-none py-1.5 pl-3 pr-9 text-gray-500 italic">
            Caricamento...
          </div>
          <div v-else-if="options.length === 0" class="relative cursor-default text-xs select-none py-1.5 pl-3 pr-9 text-gray-500 italic">
            Nessun elemento
          </div>

          <ListboxOption
            v-for="option in options"
            :key="option[optionValue]"
            :value="option[optionValue]"
            v-slot="{ active, selected }"
            as="template"
          >
            <li
              :class="[
                active ? themeClasses.optionActive : themeClasses.optionInactive,
                'relative cursor-default select-none py-1.5 pl-3 pr-9 transition-colors'
              ]"
            >
              <span :class="[selected ? 'font-semibold' : '', 'block truncate text-xs']">
                {{ option[optionLabel] }}
              </span>

              <span
                v-if="selected"
                :class="[
                  active ? themeClasses.checkActive : themeClasses.checkInactive,
                  'absolute inset-y-0 right-0 flex items-center pr-4'
                ]"
              >
                <CheckIcon class="h-4 w-4" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const props = defineProps({
  // Il v-model
  modelValue: { type: [String, Number, Object], default: null },
  // L'array di dati
  options: { type: Array as () => any[], default: () => [] },
  // Quale proprietà dell'oggetto mostrare all'utente (default: 'name')
  optionLabel: { type: String, default: 'name' },
  // Quale proprietà usare come valore interno (default: 'id')
  optionValue: { type: String, default: 'id' },
  //Testo da mostrare se l'opzione non è ancora nell'array
  fallbackLabel: { type: String, default: '' },
  // Placeholder generico
  placeholder: { type: String, default: 'Seleziona...' },
  // Dimensioni: 'sm', 'md', 'lg'
  size: { type: String, default: 'md' },
  theme: { type: String, default: 'blue' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'open', 'select']);

// --- DIZIONARIO DEI TEMI ---
const themes: Record<string, any> = {
  blue: {
    button: 'text-blue-950 active:border-blue-950 hover:bg-blue-50 active:border-blue-400 active:ring-blue-300',
    optionActive: 'bg-blue-50 font-bold rounded rounded-xl mx-1',
    optionInactive: 'text-blue-950 font-normal',
    options: ' text-blue-950',
    checkActive: 'text-blue-950 ',
    checkInactive: 'text-blue-950'
  },
  red: {
    button: 'text-red-950 border border-red-950 hover:bg-red-50 focus:ring-2 focus:ring-red-300 focus:border-red-400 active:ring-2 active:ring-red-300',
    optionActive: 'bg-red-600 text-white',
    optionInactive: 'text-red-950',
    checkActive: 'text-white',
    checkInactive: 'text-red-600'
  },
  gray: {
    button: 'text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:border-gray-400 active:ring-2 active:ring-gray-300',
    optionActive: 'bg-gray-200 text-gray-900',
    optionInactive: 'text-gray-900',
    checkActive: 'text-gray-900',
    checkInactive: 'text-gray-600'
  }
};

// Seleziona le classi in base alla prop (fallback su blue se la stringa passata non esiste)
const themeClasses = computed(() => themes[props.theme] || themes.blue);

// Classi CSS in base alla dimensione richiesta
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'py-1 pl-2 pr-8 text-xs leading-5';
    case 'lg': return 'py-2 pl-4 pr-10 text-base leading-6';
    case 'md':
    default: return 'py-1.5 pl-3 pr-10 text-sm leading-6';
  }
});

// Mostra il testo corretto nel pulsante (Valore selezionato o Placeholder)
const displayLabel = computed(() => {
  // 1. Se sta caricando ed è vuoto
  if (props.loading && props.options.length === 0) return 'Caricamento...';
  
  // 2. Se non c'è nessun valore impostato
  if (props.modelValue == null || props.modelValue === '') return props.placeholder;
  
  // 3. Cerchiamo l'opzione nell'array (se è stato caricato)
  const selected = props.options.find(o => o[props.optionValue] === props.modelValue);
  if (selected) return selected[props.optionLabel];

  // 4. L'opzione non c'è ancora
  // Usiamo la fallbackLabel se fornita dal genitore, 
  // altrimenti mostriamo brutalmente il modelValue (perfetto se il valore è già una stringa come "Under 14")
  return props.fallbackLabel || String(props.modelValue);
});

const handleSelect = (val: string) => {
  let finalVal = val;
  
  // Aggiorna il testo dell'input
  emit('update:modelValue', finalVal);

  // CERCA L'OGGETTO ORIGINALE NELL'ARRAY
  const fullObject = props.options.find(
    opt => String(opt[props.optionLabel]).toLowerCase() === String(val).toLowerCase()
  );
  
  // Emette l'oggetto completo (o null se l'utente ha digitato una squadra nuova)
  emit('select', fullObject || null);
  
};
</script>