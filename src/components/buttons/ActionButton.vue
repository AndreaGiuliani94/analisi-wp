<template>
  <div class="flex items-center" :class="alignmentClass">
    <button
        :type="type || 'button'"
        @click="handleClick"
        :disabled="disabled"
        class="inline-flex items-center font-medium rounded-md cursor-pointer shadow-md active:outline-none active:ring-2 transition-colors
            disabled:border-gray-500 disabled:bg-gray-300 disabled:shadow-none"
        :class="colorClass + ' ' + widthClass + ' ' + justifyClass + ' ' + sizeClass"
    >
        <component :is="icon" :class="(iconSize ? iconSize : 'size-5')" v-if="icon" />
        {{ label }}
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
  sm: 'p-1 gap-1 text-xs',
  md: 'p-1.5 gap-2 text-regular',
  lg: 'p-2.5 gap-2 text-lg',
}[props.size || 'md']

</script>