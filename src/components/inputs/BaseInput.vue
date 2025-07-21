<template>
  <div :class="labelPosition">
    <label v-if="label" :for="id" class="text-sm font-medium text-gray-800">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="computedPlaceholder"
      :required="required"
      @input="updateValue"
      class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const updateValue = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const computedPlaceholder = props.placeholder || props.label || '';

const alignmentClass = {
  center: 'text-center',
  left: 'text-start',
  right: 'text-end',
}[props.labelPosition || 'center']

</script>

