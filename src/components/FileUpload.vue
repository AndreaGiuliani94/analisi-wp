<template>
    <div class="w-full rounded-md font-light mb-4">
        <div v-if="videoStore.selectedFile">
            <div class="rounded-md flex justify-between items-center bg-blue-50 border-blue-950 border-2 p-3 text-blue-950">
                <span>{{ videoStore.selectedFile?.name }}</span>
                <div class="flex justify-between gap-2">
                    <button
                        class="bg-blue-950 text-white font-medium rounded-md cursor-pointer px-2 py-1 disabled:border-gray-500 disabled:bg-gray-300 "
                        @click="videoStore.loadVideo"
                        :disabled="!videoStore.selectedFile || videoStore.isUploading">Upload</button>
                    <button class="bg-red-800 text-white font-medium rounded-md cursor-pointer px-2 py-1 disabled:border-gray-500 disabled:bg-gray-300"
                        @click="showConfirmModal = true"
                        :disabled="videoStore.isUploading">Remove</button>
                    <!-- <button class="bg-amber-500 text-white font-medium rounded-md cursor-pointer px-2 py-1" @click="videoStore.testS3Connection">
                        Test S3
                    </button> -->
                </div>

            </div>
        </div>
        <div v-else v-bind="getRootProps()">
            <div class="border-dashed border-2 rounded-md flex flex-col items-center justify-center p-10 transition-all cursor-pointer"
                :class="[isDragActive ? 'border-blue-950 bg-blue-50' : 'border-gray-400 bg-gray-50 hover:bg-gray-100']">
                <input v-bind="getInputProps()" />
                <CloudArrowUpIcon class="size-20 mb-3 opacity-80" />
                <p v-if="isDragActive">Drop the file here...</p>
                <p v-else>Drag 'n' drop a file here, or click to select a file</p>
            </div>
        </div>
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
import ConfirmModal from "./modals/ConfirmModal.vue";
import { CloudArrowUpIcon } from "@heroicons/vue/24/outline";


const videoStore = useVideoStore();
function onDrop(acceptFiles: File[], rejectReasons: FileRejectReason[]) {
    console.log(acceptFiles);
    console.log(rejectReasons);
    acceptFiles.forEach(file => {
        videoStore.setFile(file);
    });
}

const { getRootProps, getInputProps, isDragActive, ...rest } = useDropzone({ onDrop, multiple: false, accept: "video/*,.mts" });

const showConfirmModal = ref(false);

const confirmCleanup = async () => {
    showConfirmModal.value = false;
    await videoStore.cleanupVideos();
};

</script>