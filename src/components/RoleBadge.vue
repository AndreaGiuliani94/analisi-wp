
<template>
  <span
    :class="[
      'inline-flex items-center gap-0.5 px-2 py-1 text-xs rounded-full font-semibold',
      {
        'bg-green-100 text-green-700': props.role === 'owner',
        'bg-blue-100 text-blue-700': props.role === 'editor',
        'bg-amber-100 text-amber-700': props.role === 'viewer'
      }
    ]"
  >
    {{ roleLabel }}
    <!-- Slot opzionale per icona o altro contenuto -->
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
export type RoleType = 'owner' | 'editor' | 'viewer'
const props = defineProps<{
  role: RoleType
}>()

const roleLabelMap = {
  owner: 'Proprietario',
  editor: 'Editor',
  viewer: 'Visualizzatore'
}

const roleLabel = roleLabelMap[props.role]
</script>
