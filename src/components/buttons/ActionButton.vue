<template>
  <div class="flex items-center" :class="alignmentClass">
    <button
        :type="type || 'button'"
        @click="handleClick"
        :disabled="disabled || loading"
        class="inline-flex items-center font-medium rounded-md cursor-pointer shadow-md transition-colors
            active:outline-none active:ring-2 
            disabled:border-gray-500 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        :class="[colorClass + ' ' + justifyClass + ' ' + sizeClass  + ' ', loading ? 'w-fit min-w-1/2' : widthClass ]"
    >
      <svg 
        v-if="loading" 
        class="animate-spin h-5 min-w-5 text-current" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <component :is="icon" :class="(iconSize ? iconSize : 'size-5')" v-if="icon" />
      <span :class="loading ? 'truncate' : ''">{{ label }}</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const props = defineProps<{
    icon?: any
    iconSize?: string
    label?: string
    to?: string
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
    color?: 'green' | 'blue' | 'red' | 'gray'
    position?: 'center' | 'left' | 'right'
    width?: 'full' | 'fit' | 'half'
    justify?: 'start' | 'center' | 'end'
    size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
    (e: 'click'): void
}>()

const router = useRouter()

const handleClick = () => {
    if (props.disabled) return
    if (props.to) {
        router.push(props.to)
    } else {
        emit('click')
    }
}

const colorClass = {
    green: 'bg-green-600 text-white hover:bg-green-500 active:bg-green-500 active:ring-green-300',
    blue: 'bg-blue-950 text-white hover:bg-blue-800 active:bg-blue-800 active:ring-blue-300',
    red: 'bg-red-800 text-white hover:bg-red-900 active:bg-red-900 active:ring-red-300',
    gray: 'bg-gray-300 text-white hover:bg-gray-400 active:bg-gray-500 active:ring-gray-200'
}[props.color || 'green']

const alignmentClass = {
  center: 'justify-center',
  left: 'justify-start',
  right: 'justify-end',
}[props.position || 'center']

const widthClass = {
  fit: '',
  full: 'w-full',
  half: 'w-1/2'
}[props.width || 'fit']

const justifyClass = {
  start: 'justify-start',
  center:'justify-center',
  end: 'justify-end',
}[props.justify || 'start']

const sizeClass = {
  sm: 'p-1 text-xs' + (props.label ? ' gap-1' : ''),
  md: 'p-1.5 text-regular' + (props.label ? ' gap-2' : ''),
  lg: 'p-2.5 text-lg' + (props.label ? ' gap-2' : ''),
}[props.size || 'md']

</script>