<template>
  <div class="flex gap-2 items-center">
    <!-- Bottone share nativo (solo se supportato) -->
    <ActionButton
      v-if="canShare"
      @click="shareNative"
      color="blue"
      label="Invita"
      :icon="ShareIcon"
    />

    <!-- Bottone copia link -->
    <ActionButton
        v-else
        @click="copyLink"
        color="blue"
        :label="copied ? 'Copiato!' : 'Copia link'"
        :icon="ClipboardIcon"
    >
    </ActionButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ClipboardIcon } from '@heroicons/vue/24/outline'
import ActionButton from './ActionButton.vue';
import { ShareIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
  sessionId: string
  shareTitle?: string
}>()

const copied = ref(false)
const canShare = !!navigator.share // controlla se la Web Share API è disponibile
const frontendBaseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'
const shareUrl = frontendBaseUrl + '/session/join/' + props.sessionId;

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    console.error('Errore durante la copia', e)
  }
}

const shareNative = async () => {
  try {
    await navigator.share({
      title: props.shareTitle ?? 'Guarda questa sessione!',
      text: 'Ecco il link per accedere:',
      url: shareUrl
    })
  } catch (err) {
    console.warn('Condivisione annullata o non riuscita', err)
  }
}
</script>
