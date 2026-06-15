<template>
  <div class="flex flex-col" :class="labelPosition">
    <label v-if="label" :for="id" class="text-sm font-medium text-blue-950">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="computedPlaceholder"
      :required="required"
      :disabled="disabled"
      @input="updateValue"
      class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
      :class="{ 'uppercase': uppercase }"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  id: string
  modelValue: string
  label?: string
  labelPosition?: 'center' | 'left' | 'right'
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  uppercase?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const updateValue = (e: Event) => {
  const target = e.target as HTMLInputElement
  const finalValue = props.uppercase ? target.value.toUpperCase() : target.value
  
  emit('update:modelValue', finalValue)
}

const computedPlaceholder = props.placeholder || props.label || '';

</script>

