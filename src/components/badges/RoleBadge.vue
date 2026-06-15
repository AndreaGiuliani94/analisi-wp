<template>
  <span
    class="inline-flex items-center gap-0.5 px-2 py-1 text-xs rounded-full shadow font-semibold transition-all duration-200"
    :class="badgeStyles"
  >
    {{ roleLabel }} 
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AppRole } from '@/enum/RoleType';

const props = defineProps<{
  role: AppRole;
}>()

const roleLabel = computed(() => {
  const labels: Record<AppRole, string> = {
    OWNER: 'Proprietario',
    ADMIN: 'Amministratore',
    EDITOR: 'Editor',
    TIMEKEEPER: 'Cronometrista',
    VIEWER: 'Visualizzatore',
    MEMBER: 'Membro'
  };
  return labels[props.role] || props.role;
});

const badgeStyles = computed(() => {
  const styles: Record<AppRole, string> = {
    OWNER: 'bg-green-100 text-green-700',
    ADMIN: 'bg-purple-100 text-purple-700 border border-purple-200',
    EDITOR: 'bg-blue-100 text-blue-700',
    TIMEKEEPER: 'bg-amber-100 text-amber-700',
    VIEWER: 'bg-slate-100 text-slate-600',
    MEMBER: 'bg-indigo-100 text-indigo-700'
  };
  return styles[props.role] || 'bg-gray-100 text-gray-700';
});
</script>
