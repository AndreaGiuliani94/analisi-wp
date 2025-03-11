<template>
    <div class="w-full rounded-md font-light mb-4">
        <div v-if="videoStore.selectedFile">
            <div class="rounded-md flex justify-between items-center bg-amber-200 border-amber-400 border-2 p-3">
                <span>{{ videoStore.selectedFile?.name }}</span>
                <div class="flex justify-between gap-2">
                    <button
                        class="bg-sky-500 text-white font-medium rounded-md cursor-pointer px-2 py-1 disabled:border-gray-500 disabled:bg-gray-300 "
                        @click="videoStore.loadVideo"
                        :disabled="!videoStore.selectedFile || videoStore.isUploading">Upload</button>
                    <button class="bg-red-500 text-white font-medium rounded-md cursor-pointer px-2 py-1"
                        @click="showConfirmModal = true">Remove</button>
                </div>

            </div>
        </div>
        <div v-else v-bind="getRootProps()">
            <div class="border-dashed border-2 rounded-md flex flex-col items-center justify-center p-10 transition-all cursor-pointer"
                :class="[isDragActive ? 'border-amber-400 bg-amber-100' : 'border-gray-400 bg-gray-50 hover:bg-gray-100']">
                <input v-bind="getInputProps()" />
                <ArrowUpTrayIcon class="size-18 mb-3 opacity-80" />
                <p v-if="isDragActive">Drop the file here...</p>
                <p v-else>Drag 'n' drop a file here, or click to select a file</p>
            </div>
        </div>
    </div>
    <div v-if="videoStore.isUploading" class="flex justify-center mt-4">
        <svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
    </div>
    <!-- Modale di conferma -->
    <ConfirmModal :isOpen="showConfirmModal" title="Conferma Rimozione"
        message="Rimuovendo il video verranno azzerati anche gli intervalli e si dovrà ricominciare da capo. Vuoi procedere?"
        @confirm="confirmCleanup" @close="showConfirmModal = false" />
</template>

<script setup lang="ts">
import { useVideoStore } from "@/stores/videoStore";
import { ref } from "vue";
import { useDropzone, type FileRejectReason } from "vue3-dropzone";
import ConfirmModal from "./ConfirmModal.vue";
import { ArrowUpTrayIcon } from "@heroicons/vue/24/solid";


const videoStore = useVideoStore();
function onDrop(acceptFiles: File[], rejectReasons: FileRejectReason[]) {
    console.log(acceptFiles);
    console.log(rejectReasons);
    acceptFiles.forEach(file => {
        videoStore.setFile(file);
    });
}

const { getRootProps, getInputProps, isDragActive, ...rest } = useDropzone({ onDrop, multiple: false });

const showConfirmModal = ref(false);

const confirmCleanup = async () => {
    showConfirmModal.value = false;
    await videoStore.cleanupVideos();
};

</script>