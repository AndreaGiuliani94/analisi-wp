<template>
  <div class="flex flex-col">
    <label v-if="label" class="text-sm font-semibold text-blue-950">
      {{ label }}
    </label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-blue-950 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
      :disabled="disabled"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  modelValue: string | number;
  options: { label: string; value: string | number }[];
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();
</script>