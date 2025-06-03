<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="to"
    @click="onClick"
    :disabled="!isLink && disabled"
    class="inline-flex items-center pr-1.5
        font-medium rounded-full text-xs px-1 text-center shadow-lg cursor-pointer
        text-blue-950 border-blue-950 border-2 bg-white
        active:bg-blue-950 active:outline-none active:text-white 
        disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <component :is="icon" v-if="icon" class="size-4 me-1 mt-1 mb-1" />
    {{ label }}
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  onClick?: () => void
  icon?: any // componente icona opzionale
  to?: string // percorso per router-link
  disabled?: boolean
}>()

const isLink = computed(() => !!props.to)
</script>

