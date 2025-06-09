<template>
    <input
      type="text"
      :value="modelValue"
      @input="handleInput"
    @keydown="handleKeydown"
      maxlength="5"
      placeholder="mm:ss"
      class="p-2 h-8 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
      :class="{ 'border-red-500': error }"
    />
  </template>
  
  <script setup lang="ts">
  
  const props = defineProps<{
    modelValue: string,
    error: string
  }>();
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();
  
  function handleKeydown(event: KeyboardEvent) {
  // Prevenzione di inserimenti non numerici tranne backspace e delete
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  if (!/^\d$/.test(event.key) && !allowed.includes(event.key)) {
    event.preventDefault();
  }
}

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  let raw = input.value.replace(/\D/g, ''); // Solo numeri

  // Inserisce ":" dopo due cifre
  if (raw.length >= 3) {
    raw = raw.slice(0, 4); // max mmss
    const formatted = `${raw.slice(0, 2)}:${raw.slice(2)}`;
    emit('update:modelValue', formatted);
  } else {
    emit('update:modelValue', raw);
  }
}
  </script>

  