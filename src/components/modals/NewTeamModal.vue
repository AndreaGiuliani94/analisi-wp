<template>
  <BaseModal
    :is-open="isOpen" 
    title="Nuova Squadra" 
    @close="$emit('close')"
  >
    <div class="flex flex-col gap-4 mt-4">
        <BaseInput
            id="name"
            v-model="formData.club_name"
            label="Nome"
            placeholder="Nome della squadra"
            required
        />
        <BaseSelect
            id="category"
            v-model="formData.category" label="Categoria" :options="categories" required />

    </div>
    <template #footer>
        <ActionButton
          color="blue"
          @click="handleCreate"
          :loading="loading"
          :label="loading ? 'Creazione...' : 'Crea Squadra'"
          :disabled="loading"
          />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseInput from '../inputs/BaseInput.vue';
import ActionButton from '../buttons/ActionButton.vue';
import BaseModal from './BaseModal.vue';
import { useToast } from 'vue-toastification';
import { createNewTeam } from '@/services/matchService';
import { categoryEnumOptions } from '@/enum/TeamCategory';
import BaseSelect from '../selects/BaseSelect.vue';
import BaseListbox from '../listbox/BaseListbox.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const categories = [
  { value: 'Prima_Squadra', label: 'Prima Squadra' },
  { value: 'U20', label: 'Under 20' },
  { value: 'U18', label: 'Under 18' },
  { value: 'U16', label: 'Under 16' },
  { value: 'U14', label: 'Under 14' },
  { value: 'U12', label: 'Under 12' },
];

const emit = defineEmits(['close', 'created']);
const toast = useToast();
const loading = ref(false);

const formData = reactive({
  club_name: '',
  category: ''
});

const handleCreate = async () => {
  if (!formData.club_name) return;
  loading.value = true;
  try {
    await createNewTeam(formData);
    toast.success('Squadra creata con successo!');
    emit('created');
    emit('close');
    formData.club_name = '';
    formData.category = '';
  } catch (error) {
    toast.error('Errore durante la creazione della squadra');
  } finally {
    loading.value = false;
  }
};

</script>
