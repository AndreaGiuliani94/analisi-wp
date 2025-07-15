<template>
  <SwitchGroup>
    <div class="flex items-center">
      <SwitchLabel class="block text-sm font-medium mr-2">{{ props.label }}</SwitchLabel>
      <Switch
        :checked="modelValue"
        @click="toggle"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition "
        :class="modelValue ? 'bg-blue-950' : 'bg-gray-300'"
      >
        <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition"
            :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
        ></span>
      </Switch>
    </div>
  </SwitchGroup>
</template>


<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'

const props = defineProps<{
    modelValue: boolean
    label: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}

</script>