<template>
    <div>
        <div v-bind="getRootProps()">
            <input v-bind="getInputProps()" />
            <p v-if="isDragActive">Drop the files here ...</p>
            <p v-else>Drag 'n' drop some files here, or click to select files</p>
        </div>
        <button @click="open">open</button>
    </div>
</template>

<script lang="ts">
import { useVideoStore } from "@/stores/videoStore";
import { useDropzone, type FileRejectReason } from "vue3-dropzone";

export default {
    name: "UseDropzoneDemo",
    setup() {
        const videoStore = useVideoStore();

        function onDrop(acceptFiles: File[], rejectReasons: FileRejectReason[]) {
            console.log(acceptFiles);
            console.log(rejectReasons);
            acceptFiles.forEach(file => videoStore.setFile(file));
        }

        const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop });

        return {
            getRootProps,
            getInputProps,
            ...rest,
        };
    },
};
</script>