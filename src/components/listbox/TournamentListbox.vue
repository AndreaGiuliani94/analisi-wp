<template>
  <div class="flex flex-col">
    <label v-if="label" class="text-sm font-semibold text-blue-950 mb-1">
      {{ label }}
    </label>
    <BaseListbox
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
      option-label="label"
      option-value="value"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTournamentStore } from '@/stores/tournamentStore';
import BaseListbox from '../listbox/BaseListbox.vue';

const props = defineProps<{
  modelValue: string | number;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const tournamentStore = useTournamentStore();

const options = computed(() => [
  { label: props.placeholder || 'Seleziona torneo', value: '' },
  ...tournamentStore.tournaments.map(t => ({
    label: t.name + (t.category ? ` - ${t.category}` : '') + (t.gender ? ` ${t.gender}` : '') + (t.season ? ` (${t.season})` : ''),
    value: t.id || t.tournament_id
  }))
]);

onMounted(async () => {
  if (tournamentStore.tournaments.length === 0) {
    await tournamentStore.getAllTournaments();
  }
});
</script>
