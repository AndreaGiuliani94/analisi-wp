<template>
  <span 
    class="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border"
    :class="badgeClasses"
  >
    {{ formattedCategoryGender }}
  </span>
</template>

<script setup lang="ts">
import { TournamentGender } from '@/interfaces/Tournament';
import { computed } from 'vue';

const props = defineProps<{
  category: string;
  gender: TournamentGender;
}>();

const formattedCategoryGender = computed(() => {
  const genderChar = props.gender === TournamentGender.MIXED ? 'MX' : props.gender;
  return `${props.category}${genderChar}`;
});

const badgeClasses = computed(() => {
  // Puoi personalizzare i colori in base alla categoria o al genere se necessario
  // Per ora, useremo uno stile fisso
  return 'bg-blue-600 text-white border-blue-700';
});
</script>
