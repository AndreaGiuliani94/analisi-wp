<template>
  <div class="flex gap-2 items-center">
    <ActionButton
        @click="copyCode"
        color="blue"
        :label="copied ? 'Copiato!' : 'Copia codice'"
        :icon="ClipboardIcon"
    >
    </ActionButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ClipboardIcon } from '@heroicons/vue/24/outline'
import ActionButton from './ActionButton.vue';

const props = defineProps<{
  sessionId: string
  shareTitle?: string
}>()

const copied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.sessionId)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    console.error('Errore durante la copia', e)
  }
}

</script>
