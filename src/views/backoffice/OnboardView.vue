<template>
  <div class="w-full h-full">
    
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-950">Onboarding Nuova Società</h1>
      <p class="text-gray-500 text-sm mt-1">
        Crea un nuovo tenant e assegna il primo utente amministratore.
      </p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <form @submit.prevent="submitForm" class="space-y-4">
        
        <div class="space-y-2 pb-4">
          <h2 class="text-lg font-semibold text-blue-900 border-b pb-2">Dati Organizzazione</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput
              v-model="formData.org_name" 
              label="Nome Società" 
              id="name"
              placeholder="es. Pro Recco Waterpolo" 
              required 
            />
            
            <BaseInput 
              v-model="formData.contact_email" 
              type="email"
              id="contactEmail"
              label="Email di Contatto" 
              placeholder="es. info@prorecco.it" 
              required 
            />
            <BaseSelect
              v-model="formData.plan_type"
              label="Piano di Abbonamento"
              :options="planOptions"
            />
            <div class="flex flex-col justify-center py-2">
              <p class="text-sm font-semibold text-blue-950 mb-1">Logo Società</p>
              <DropZone
                v-model="formData.logo_url"
                :upload-function="uploadLogo"
                class="w-40 h-40"
                accept="image/*"
              />
            </div>
          </div>

        </div>

        <div class="space-y-4 pt-4 border-t border-gray-200">
          <h2 class="text-lg font-semibold text-blue-900">Primo Amministratore</h2>
          <p class="text-xs text-gray-500 mb-2">
            Inserisci l'ID (UUID) dell'utente che diventerà il gestore principale di questa società.
          </p>
          
          <BaseInput 
            v-model="formData.admin_user_id" 
            id="adminUserId"
            label="ID Utente (UUID)" 
            placeholder="es. 123e4567-e89b-12d3-a456-426614174000" 
            required 
          />
        </div>

        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          {{ successMessage }}
        </div>

        <div class="flex justify-end pt-4">
          <ActionButton
            type="submit" 
            :loading="isLoading"
            :color="'blue'"
            label="Crea Organizzazione"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue';
import BaseInput from '@/components/inputs/BaseInput.vue';
import BaseSelect from '@/components/selects/BaseSelect.vue';
import DropZone from '@/components/DropZone.vue';
import { planOptions } from '@/const/consts';
import { onboardNewTenant, uploadLogoFile } from '@/services/adminService';
import { ref, reactive } from 'vue';

// Mock upload function for demonstration. Replace with actual API call to adminService.
const uploadLogo = async (file: File): Promise<string> => {
  console.log('Uploading logo file:', file.name);
  const formData = new FormData();
  formData.append('file', file);
  const response = await uploadLogoFile(formData);
  formData.set('logo_url', response.url)
  return response.url;
};

const formData = reactive({
  org_name: '',
  contact_email: '',
  plan_type: 'FREE', // default
  logo_url: '',
  admin_user_id: ''
});

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const submitForm = async () => {
  // Reset dei messaggi
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    const response = await onboardNewTenant(formData);
    console.log(response);

    successMessage.value = `Organizzazione "${formData.org_name}" creata con successo!`;
    
    // Resettiamo il form dopo il successo
    formData.org_name = '';
    formData.contact_email = '';
    formData.plan_type = 'TRIAL';
    formData.logo_url = '';
    formData.admin_user_id = '';
    
  } catch (error: any) {
    // Intercettiamo l'errore generato dal tuo FastAPI (HTTPException)
    errorMessage.value = error.response?.detail || "Si è verificato un errore durante l'onboarding.";
  } finally {
    isLoading.value = false;
  }
};
</script>