<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="to"
    @click="onClick"
    :disabled="!isLink && disabled"
    class="flex items-center pr-1.5 justify-center
        font-medium rounded-full text-xs px-1 text-center shadow-lg cursor-pointer
        border-2 active:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    :class="colorClass + ' ' + iconPositionClass"
  >
    <component :is="icon" v-if="icon" class="size-4 mt-1 mb-1" :class="{'me-1': (label && (iconPosition == undefined || iconPosition == 'left')), 'ms-1': label && iconPosition == 'right'}"/>
    <div v-if="label">{{ label }}</div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label?: string
  onClick?: () => void
  icon?: any // componente icona opzionale
  iconPosition?: 'left' | 'right'
  to?: string // percorso per router-link
  disabled?: boolean
  color?: 'green' | 'blue' | 'red'
}>()

const isLink = computed(() => !!props.to)

const colorClass = {
    green: 'text-green-600 border-green-600 border-2 bg-white active:bg-green-500 active:text-white hover:bg-green-600 hover:text-white',
    blue: 'text-blue-950 border-blue-950 border-2 bg-white active:bg-blue-800 active:text-white hover:bg-blue-950 hover:text-white',
    red: 'text-red-800 border-red-800 border-2 bg-white active:bg-red-900 active:text-white hover:bg-red-800 hover:text-white'
}[props.color || 'blue']

const iconPositionClass = {
    left: 'flex-row',
    right: 'flex-row-reverse',
}[props.iconPosition || 'left']
</script>

