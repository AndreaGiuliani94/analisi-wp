
<template>
  <span
    :class="[
      'px-2 py-0.5 text-xs rounded-full font-semibold',
      {
        'bg-green-100 text-green-700': props.role === 'owner',
        'bg-blue-100 text-blue-700': props.role === 'editor',
        'bg-gray-100 text-gray-700': props.role === 'viewer'
      }
    ]"
  >
    {{ roleLabel }}
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
