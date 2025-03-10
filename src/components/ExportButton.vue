<template>
    <div class="flex justify-center items-center gap-10 m-5">
        <button @click="store.exportToExcel(elements)"
            class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300 transition-colors">
            <DocumentArrowDownIcon class="size-5 me-2" /> Esporta</button>
    </div>
</template>

<script lang="ts">
import { useElementStore } from "@/stores/gameStore";
import { DocumentArrowDownIcon } from "@heroicons/vue/24/outline";

export default {
    props: {
        elements: {
            type: Array,
            required: true,
        },
    },
    setup(props) {
        const store = useElementStore();
        return {
            store
        };
    }
}
</script>