<template>
  <div>
    <Combobox
      :model-value="modelValue"
      @update:model-value="handleSelect"
      :disabled="disabled"
      as="div"
      class="hidden lg:block relative"
    >
      <div class="relative text-blue-950">
        <ComboboxInput
          class="w-full px-3 py-1.5 text-sm font-medium leading-4 lg:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
          :class="{ 'uppercase': uppercase }"
          :placeholder="placeholder"
          :displayValue="(val) => val as string"
          @change="handleTyping"
          @focusout="emit('focusout')"
          @keyup.enter="emit('enter')" 
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
    
          <slot name="action"></slot>
          
          <ComboboxButton class="flex items-center outline-none">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>
        </div>
        
      </div>

      <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ComboboxOptions class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-blue-950 ring-opacity-5 focus:outline-none">
          <div v-if="filteredOptions.length === 0 && query !== ''" class="relative cursor-default select-none py-2 px-4 text-gray-500 italic">
            Nessuna squadra trovata.
          </div>
          <ComboboxOption v-for="option in filteredOptions" :key="option[optionValue] || option" :value="option" v-slot="{ active }" as="template">
            <li :class="['relative cursor-default select-none py-1.5 pl-3 pr-9 transition-colors', active ? 'bg-blue-50 rounded-lg mx-1 font-semibold' : 'font-normal']">
                <span :class="['block truncate', isOptionSelected(option) ? 'font-semibold' : '']">
                    {{ option[optionLabel] }}
                    <span v-if="optionDescription && option[optionDescription]" 
                      :class="['font-normal text-gray-500 ml-0.5', 
                        isOptionSelected(option) ? 'font-semibold' : '',
                        active ? 'font-semibold' : '']">
                    - {{ option[optionDescription] }}
                    </span>
                </span>
                <span v-if="isOptionSelected(option)" :class="['absolute inset-y-0 right-0 flex items-center pr-4 text-blue-950', active ? '' : '']">
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </transition>
    </Combobox>

    <div class="lg:hidden">
      <button
        type="button"
        @click="openMobileModal"
        :disabled="disabled"
        class="w-full text-left px-3 py-1.5 pr-14 relative text-sm font-medium border border-gray-300 rounded-md bg-white disabled:bg-gray-100 disabled:text-gray-400 flex justify-between items-center"
        :class="{ 'uppercase': uppercase, 'text-gray-400': !modelValue }"
      >
        <span class="truncate">{{ modelValue || placeholder }}</span>

        <div class="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          <div @click.stop class="flex items-center">
            <slot name="action"></slot>
          </div>
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
        </div>
      </button>

      <TransitionRoot appear :show="isMobileModalOpen" as="template">
        <Dialog as="div" @close="closeMobileModal" class="relative z-50 lg:hidden">
          
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
            <div class="fixed inset-0 bg-black/50" />
          </TransitionChild>

          <div class="fixed inset-0 flex flex-col justify-center items-center">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="translate-y-full" enter-to="translate-y-0" leave="duration-200 ease-in" leave-from="translate-y-0" leave-to="translate-y-full">
              <DialogPanel class="w-3/4 h-[90vh] bg-white rounded-t-xl shadow-xl flex flex-col">
                
                <div class="p-3 border-b border-gray-200 flex gap-2 items-center bg-gray-50 rounded-t-xl">
                  <div class="relative flex-1">
                    <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      ref="mobileSearchInput"
                      v-model="query"
                      type="text"
                      :placeholder="placeholder"
                      class="w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      :class="{ 'uppercase': uppercase }"
                      @keyup.enter="handleMobileEnter"
                    />
                  </div>
                  <button @click="closeMobileModal" class="p-2 text-gray-500 hover:text-gray-700 bg-gray-200 rounded-full">
                    <XMarkIcon class="h-5 w-5" />
                  </button>
                </div>

                <div class="flex-1 overflow-y-auto p-2">
                  <ul class="space-y-1">
                    <li v-if="filteredOptions.length === 0 && query !== ''">
                      <button @click="handleMobileEnter" class="w-full text-left px-3 rounded-lg flex items-center gap-3 hover:bg-gray-100">
                        <PlusCircleIcon class="h-6 w-6 text-blue-600" />
                        <div>
                          <p class="text-sm font-medium text-gray-900">Usa "{{ uppercase ? query.toUpperCase() : query }}"</p>
                          <p class="text-xs text-gray-500">Tocca per creare</p>
                        </div>
                      </button>
                    </li>
                    
                    <li v-for="option in filteredOptions" :key="option[optionValue] || option">
                      <button 
                            @click="handleSelect(option)"
                            class="w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 flex items-center justify-between"
                            >
                            <div class="truncate">
                                {{ option[optionLabel] }}
                                <span v-if="optionDescription && option[optionDescription]" class="text-gray-500 font-normal ml-1">
                                - {{ option[optionDescription] }}
                                </span>
                            </div>
                            <CheckIcon v-if="isOptionSelected(option)" class="h-5 w-5 text-blue-600 shrink-0" />
                        </button>
                    </li>
                  </ul>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { 
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption,
  Dialog, DialogPanel, TransitionRoot, TransitionChild 
} from '@headlessui/vue';
import { 
  CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon, XMarkIcon, PlusCircleIcon 
} from '@heroicons/vue/20/solid';

const props = defineProps({
  modelValue: { type: String, default: '' },
  selectedId: { type: [String, Number], default: '' },
  options: { type: Array as () => any[], default: () => [] },
  optionLabel: { type: String, default: 'name' },
  optionValue: { type: String, default: 'id' },
  optionDescription: { type: String, default: '' },
  placeholder: { type: String, default: 'Cerca...' },
  disabled: { type: Boolean, default: false },
  uppercase: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'focusout', 'enter', 'select']);

const query = ref('');

// NUOVA FUNZIONE: Controlla se l'opzione è quella selezionata basandosi sull'ID
const isOptionSelected = (option: any) => {
  // Se il genitore ci ha passato un ID, il controllo è infallibile (risolve le omonimie)
  if (props.selectedId && option[props.optionValue]) {
    return String(props.selectedId) === String(option[props.optionValue]);
  }
  // Fallback: se non c'è ID (es. nome squadra scritto a mano), controlliamo la stringa
  const label = option[props.optionLabel] ? String(option[props.optionLabel]) : '';
  return props.modelValue === label && props.modelValue !== '';
};

// Filtriamo i risultati unendo Testo Principale + Descrizione!
const filteredOptions = computed(() => {
  if (query.value === '') return props.options;
  return props.options.filter(opt => {
    const mainText = opt[props.optionLabel] ? String(opt[props.optionLabel]) : '';
    const descText = props.optionDescription && opt[props.optionDescription] ? String(opt[props.optionDescription]) : '';
    
    // Uniamo i due testi così l'utente può cercare sia per nome che per categoria
    const searchableText = `${mainText} ${descText}`.toLowerCase();
    
    return searchableText.includes(query.value.toLowerCase());
  });
});

// GESTIONE SELEZIONE (Da tendina o da Invio)
const handleSelect = (valOrObj: any) => {
  if (typeof valOrObj === 'object' && valOrObj !== null) {
    // 1. L'utente ha cliccato un'opzione (riceviamo l'OGGETTO ESATTO, niente più omonimie!)
    let finalName = String(valOrObj[props.optionLabel]);
    if (props.uppercase) finalName = finalName.toUpperCase();
    
    emit('update:modelValue', finalName);
    emit('select', valOrObj); // Inviamo l'oggetto corretto al genitore
  } else {
    // 2. L'utente ha digitato a mano una stringa nuova
    let finalName = String(valOrObj || '');
    if (props.uppercase) finalName = finalName.toUpperCase();
    
    emit('update:modelValue', finalName);
    emit('select', null); // Se è un nome nuovo, azzeriamo l'ID!
  }
  
  closeMobileModal();
  emit('enter');
};

// === LOGICA DESKTOP ===
const handleTyping = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let val = target.value;
  if (props.uppercase) val = val.toUpperCase();

  query.value = val;
  emit('update:modelValue', val);

  // FIX FONDAMENTALE: Se l'utente inizia a cancellare/modificare il nome, sganciamo l'ID
  emit('select', null);
};

// === LOGICA MOBILE ===
const isMobileModalOpen = ref(false);
const mobileSearchInput = ref<HTMLInputElement | null>(null);

const openMobileModal = () => {
  if (props.disabled) return;
  // Pre-compiliamo la ricerca con il valore attuale
  query.value = props.modelValue; 
  isMobileModalOpen.value = true;
  
  // Diamo il focus automatico all'input della modale così la tastiera sale da sola
  nextTick(() => {
    setTimeout(() => {
      mobileSearchInput.value?.focus();
    }, 100);
  });
};

const closeMobileModal = () => {
  isMobileModalOpen.value = false;
  query.value = '';
  // Quando la modale si chiude, simuliamo il focusout per scaricare le categorie come facevamo prima
  emit('focusout');
};

// Chiamato quando l'utente preme invio sulla tastiera mobile o clicca "Crea nuova squadra"
const handleMobileEnter = () => {
  handleSelect(query.value);
};
</script>