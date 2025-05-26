<template>
  <button class=" w-6 h-6 rounded-full border
    text-sm font-bold transition cursor-pointer
    disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200"
    :class="props.used ? 'bg-red-800 border-red-800' : 'border-red-800'"
    @click="toggleTimeOut"
    >
  </button>
</template>

<script lang="ts" setup>

const props = defineProps<{
  used?: boolean,
  teamName: string,
  number: number,
}>()

const emit = defineEmits<{
  (e: 'toggleTimeOut', payload: { number: number, teamName: string }): void
}>()

const toggleTimeOut = () => {
  emit('toggleTimeOut', {
    number: props.number,
    teamName: props.teamName
  })
}

</script>
