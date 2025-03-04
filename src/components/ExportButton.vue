<template>
    <div class="flex justify-center items-center gap-10 m-5">
        <button @click="store.exportToExcel(elements)"
            class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300 transition-colors"><font-awesome-icon
                :icon="['far', 'file-excel']" class="w-3.5 h-3.5 text-white me-2" /> Esporta</button>
    </div>
</template>

<script lang="ts">
import { useElementStore } from "@/stores/gameStore";

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