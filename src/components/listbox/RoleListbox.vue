<template>
  <Listbox :modelValue="modelValue" @update:modelValue="updateValue">
    <div class="relative">
      <!-- Pulsante "select" -->
        <ListboxButton v-slot="{ open }" class="relative cursor-pointer rounded bg-white flex justify-center items-center">
            <!-- Usa il badge qui -->
            <RoleBadge :role="modelValue" />
            <component
                :is="open ? ChevronUpIcon : ChevronDownIcon"
                class="w-4 h-4 text-gray-500"
            />
        </ListboxButton>

        <!-- Opzioni -->
        <ListboxOptions class="absolute overflow-auto rounded bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            <ListboxOption
                v-for="role in roles"
                :key="role"
                :value="role"
                class="cursor-pointer select-none p-1 hover:bg-gray-100"
            >
                <RoleBadge :role="role" />
            </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import RoleBadge, { type RoleType } from '../RoleBadge.vue';
import { ChevronDownIcon } from '@heroicons/vue/20/solid';
import { ChevronUpIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
  modelValue: 'owner' | 'editor' | 'viewer'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'owner' | 'editor' | 'viewer'): void
}>()

const roles: Array<'owner' | 'editor' | 'viewer'> = ['owner', 'editor', 'viewer']

function updateValue(newRole: 'owner' | 'editor' | 'viewer') {
  emit('update:modelValue', newRole)
}
</script>

