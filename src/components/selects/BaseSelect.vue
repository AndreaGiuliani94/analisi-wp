<template>
  <div class="flex flex-col">
    <label v-if="label" class="text-sm font-semibold text-blue-950">
      {{ label }}
    </label>
    <select 
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full bg-white px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
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