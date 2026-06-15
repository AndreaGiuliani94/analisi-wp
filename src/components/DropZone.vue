<template>
  <div class="w-full rounded-md font-light mb-4" :class="$attrs.class">
    <div v-if="currentPreviewUrl">
      <div class="rounded-md flex justify-between items-center bg-blue-50 border-blue-950 border-2 p-3 text-blue-950">
        <img v-if="isImage(currentPreviewUrl)" :src="currentPreviewUrl" alt="Preview" class="h-10 w-10 object-contain mr-2" />
        <span class="flex-1 truncate">{{ selectedFile?.name || 'File caricato' }}</span>
        <div class="flex justify-between gap-2">
          <ActionButton type="button" color="red" label="Rimuovi" @click="openConfirmRemove" :disabled="isUploading" />
        </div>
      </div>
    </div>
    <div v-else-if="selectedFile">
      <div class="rounded-md flex justify-between items-center bg-blue-50 border-blue-950 border-2 p-3 text-blue-950">
        <span class="flex-1 truncate">{{ selectedFile.name }}</span>
        <div class="flex justify-between gap-2">
          <ActionButton
            v-if="uploadFunction"
            type="button"
            color="blue"
            label="Carica"
            @click="handleUpload"
            :disabled="isUploading"
            :loading="isUploading"
          />
          <ActionButton type="button" color="red" label="Rimuovi" @click="openConfirmRemove" :disabled="isUploading" />
        </div>
      </div>
    </div>
    <div v-else v-bind="getRootProps()">
      <div
        class="border-dashed border-2 rounded-md flex flex-col items-center justify-center p-6 transition-all cursor-pointer"
        :class="[isDragActive ? 'border-blue-950 bg-blue-50' : 'border-gray-400 bg-gray-50 hover:bg-gray-100']"
      >
        <input v-bind="getInputProps()" />
        <CloudArrowUpIcon class="size-20 mb-3 opacity-80" />
        <p v-if="isDragActive" class="text-center">Rilascia il file qui...</p>
        <span v-else class="text-center">{{ label }}</span>
      </div>
    </div>
    <div v-if="uploadError" class="text-red-500 text-sm mt-2">{{ uploadError }}</div>

    <!-- Modale di conferma -->
    <ConfirmModal
      :isOpen="showConfirmModal"
      title="Conferma Rimozione"
      :message="confirmMessage"
      @confirm="confirmRemove"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, type PropType, useAttrs } from 'vue';
import { useDropzone, type FileRejectReason } from 'vue3-dropzone';
import ConfirmModal from './modals/ConfirmModal.vue';
import { CloudArrowUpIcon } from '@heroicons/vue/24/outline';
import ActionButton from './buttons/ActionButton.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: 'Trascina qui un file, o clicca per selezionarlo',
  },
  accept: {
    type: String,
    default: 'image/*',
  },
  uploadFunction: {
    type: Function as PropType<(file: File) => Promise<string>>,
    required: false,
  },
  confirmRemoveMessage: {
    type: String,
    default: 'Sei sicuro di voler rimuovere questo file?',
  },
});

const emit = defineEmits(['update:modelValue', 'uploaded', 'removed', 'error']);

const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const uploadError = ref<string | null>(null);
const showConfirmModal = ref(false);

const attrs = useAttrs(); // To pass class attribute to the root div

const currentPreviewUrl = computed(() => {
  if (props.modelValue) return props.modelValue;
  if (selectedFile.value && isImage(selectedFile.value.type)) {
    return URL.createObjectURL(selectedFile.value);
  }
  return null;
});

const confirmMessage = computed(() => props.confirmRemoveMessage);

const isImage = (mimeType: string) => mimeType.startsWith('image/');

function onDrop(acceptedFiles: File[], rejectedReasons: FileRejectReason[]) {
  uploadError.value = null;
  if (rejectedReasons.length > 0) {
    uploadError.value = `File non accettato`;  //: ${rejectedReasons[0].file.name}. Tipo: ${rejectedReasons[0].errors[0].code}
    emit('error', uploadError.value);
    return;
  }
  if (acceptedFiles.length > 0) {
    selectedFile.value = acceptedFiles[0];
    // If an upload function is provided and there's no existing modelValue,
    // or if we're replacing an existing file, attempt to upload immediately.
    if (props.uploadFunction && (!props.modelValue || selectedFile.value)) {
      handleUpload();
    }
  }
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  multiple: false,
  accept: props.accept,
});

const handleUpload = async () => {
  if (!selectedFile.value || !props.uploadFunction) {
    uploadError.value = 'Nessun file selezionato o funzione di upload non fornita.';
    emit('error', uploadError.value);
    return;
  }

  isUploading.value = true;
  uploadError.value = null;
  try {
    const url = await props.uploadFunction(selectedFile.value);
    emit('update:modelValue', url);
    emit('uploaded', url);
  } catch (error: any) {
    uploadError.value = error.message || 'Errore durante il caricamento del file.';
    emit('error', uploadError.value);
  } finally {
    isUploading.value = false;
  }
};

const openConfirmRemove = () => {
  showConfirmModal.value = true;
};

const confirmRemove = () => {
  selectedFile.value = null;
  uploadError.value = null;
  emit('update:modelValue', null); // Clear the modelValue
  emit('removed');
  showConfirmModal.value = false;
};

// Watch for external modelValue changes to clear selectedFile if modelValue becomes null
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    selectedFile.value = null;
  }
});
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
