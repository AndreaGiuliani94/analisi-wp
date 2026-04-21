<template>
  <Listbox :modelValue="modelValue" @update:modelValue="updateValue" :disabled="userRole !== 'owner' || modelValue === 'owner'">
    <div class="relative">
      <!-- Pulsante "select" -->
        <ListboxButton 
          v-slot="{ open }" 
          class="relative z-5 cursor-pointer rounded bg-gray-200 
            flex justify-center items-center disabled:cursor-default"
            >
            <!-- Usa il badge qui -->
            <RoleBadge :role="modelValue" >
              <component v-if="userRole == 'owner' && modelValue != 'owner'"
                  :is="open ? ChevronUpIcon : ChevronDownIcon"
                  class="w-5 h-5"
              />
            </RoleBadge>
        </ListboxButton>

        <!-- Opzioni -->
        <ListboxOptions 
          class="absolute z-10 overflow-auto rounded bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <ListboxOption
                v-for="role in roles"
                :key="role"
                :value="role"
                :disabled="role === 'timekeeper' && hasTimekeeper && modelValue !== 'timekeeper'"
                class="select-none p-1"
                :class="[
                  role === 'timekeeper' && hasTimekeeper && modelValue !== 'timekeeper'
                    ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                    : 'cursor-pointer hover:bg-gray-100'
                ]"
            >
                <RoleBadge :role="role" />
            </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import RoleBadge from '../badges/RoleBadge.vue';
import { ChevronDownIcon } from '@heroicons/vue/20/solid';
import { ChevronUpIcon } from '@heroicons/vue/20/solid';

const props = defineProps<{
  modelValue: 'owner' | 'editor' | 'viewer' | 'timekeeper'
  userRole: string | undefined
  hasTimekeeper: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'editor' | 'viewer' | 'timekeeper'): void
}>()

const roles: Array< 'editor' | 'viewer' | 'timekeeper'> = [ 'editor', 'viewer', 'timekeeper']

function updateValue(newRole: 'editor' | 'viewer' | 'timekeeper') {
  emit('update:modelValue', newRole)
}
</script>

