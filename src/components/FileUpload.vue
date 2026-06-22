<template>
    <div class="flex flex-col lg:flex-row gap-6 items-stretch w-full h-full min-h-[300px]">
        <!-- Lato Upload -->
        <div class="flex-1 rounded-md font-light pr-6 border-r-2 border-slate-200">
            <div v-if="videoStore.selectedFile" >
                <div class="rounded-md flex justify-between items-center bg-blue-50 border-blue-950 border-2 p-3 text-blue-950">
                    <span class="truncate pr-2">{{ videoStore.selectedFile?.name }}</span>
                    <div class="flex justify-between gap-2 shrink-0">
                        <ActionButton type="button" color="blue" label="Upload" @click="videoStore.loadVideo"
                        :disabled="!videoStore.selectedFile || videoStore.isUploading || videoStore.videoUploaded"
                        :loading="videoStore.videoUploaded" />
                        <ActionButton type="button" color="red" label="Remove" @click="videoStore.resetStore()"
                        :disabled="videoStore.isUploading" :loading="videoStore.isUploading" />
                    </div>
                </div>

                <div v-if="videoStore.clipJobStatusMessage" class="border-blue-200 border-2 bg-blue-50 text-blue-950 p-3 rounded-md mt-2">
                    <span>{{ videoStore.clipJobStatusMessage }}</span>
                </div>
            </div>
            <div v-else v-bind="getRootProps()" class="h-3/4">
                <h2 class="text-xl font-black text-blue-950 mb-4 text-center">Carica un file video per iniziare</h2>
                <div class="border-dashed border-2 h-full min-h-[160px] rounded-md flex flex-col items-center justify-center p-6 transition-all cursor-pointer"
                    :class="[isDragActive ? 'border-blue-950 bg-blue-50' : 'border-gray-400 bg-gray-50 hover:bg-gray-100']">
                    <input v-bind="getInputProps()" />
                    <CloudArrowUpIcon class="size-12 mb-3 opacity-80" />
                    <p v-if="isDragActive" class="text-sm text-center">Drop the file here...</p>
                    <p v-else class="text-sm text-center">Drag 'n' drop a file here, or click to select a file</p>
                </div>
            </div>
        </div>

        <!-- Sezione per selezionare video esistenti -->
        <div v-if="!videoStore.selectedFile && !videoStore.isUploading && !videoStore.videoUploaded" class="flex-1 flex flex-col justify-start rounded-md">
            <h3 class="text-xl font-bold text-blue-950 mb-4 text-center">Oppure seleziona un video già caricato:</h3>
            <div class="flex flex-col xl:flex-row gap-3 items-center">
                <BaseListbox 
                    v-model="selectedExistingVideo" 
                    :options="videoStore.videoList" 
                    optionLabel="name" 
                    optionValue="id" 
                    placeholder="Seleziona un video..."
                    :loading="videoStore.isFetchingVideos"
                    class="w-full text-left"
                />
                <ActionButton 
                    color="blue" 
                    label="Carica" 
                    :disabled="!selectedExistingVideo || videoStore.isUploading" 
                    :loading="videoStore.isUploading"
                    @click="loadSelectedExistingVideo"
                    class="w-full xl:w-auto"
                />
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { useVideoStore } from "@/stores/videoStore";
import { ref, onMounted } from "vue";
import BaseListbox from "./listbox/BaseListbox.vue";
import { useDropzone, type FileRejectReason } from "vue3-dropzone";
import { CloudArrowUpIcon } from "@heroicons/vue/24/outline";
import ActionButton from "./buttons/ActionButton.vue";


const videoStore = useVideoStore();
function onDrop(acceptFiles: File[], rejectReasons: FileRejectReason[]) {
    console.log(acceptFiles);
    console.log(rejectReasons);
    acceptFiles.forEach(file => {
        videoStore.setFile(file);
    });
}

const { getRootProps, getInputProps, isDragActive, ...rest } = useDropzone({ onDrop, multiple: false, accept: "video/*,.mts" });

const selectedExistingVideo = ref<string | undefined>(undefined);

onMounted(() => {
    videoStore.fetchVideoList();
});

const loadSelectedExistingVideo = async () => {
    if (selectedExistingVideo.value) {
        await videoStore.loadExistingVideo(selectedExistingVideo.value);
    }
};

</script>