<template>
    <div class="">
        <button @click="exportToExcel()"
            class="inline-flex items-center pr-1.5 text-sm
            font-medium rounded-md px-1 text-center shadow-lg cursor-pointer 
            bg-green-600 text-white 
            active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300 transition-colors">
            <DocumentArrowDownIcon class="size-5 me-1 mt-1 mb-1" /> Esporta
        </button>
    </div>
</template>

<script setup lang="ts">
import { DocumentArrowDownIcon } from "@heroicons/vue/24/outline";

const emit = defineEmits<{
  (e: 'exportToExcel'): void
}>();

const exportToExcel = () => {
    emit('exportToExcel');
}

</script>