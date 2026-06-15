<template>
  <div v-if="organization" class="">
    <div v-if="user?.isSystemAdmin" class="w-fit mb-4">
        <NavButton 
            to="/workspace/backoffice"
            :color="'blue'"
            :icon="ArrowLeftIcon"
            :label="'Torna all\'elenco'"
        />
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="h-18 bg-linear-to-r from-blue-950 to-blue-800"></div>
        <div class="px-8 pb-8">
            <div class="relative flex justify-between items-end -mt-12 mb-6">
                <div class="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    <img v-if="organization.logo_url" :src="organization.logo_url" :alt="organization.name" class="w-full h-full object-contain" />
                    <BuildingOffice2Icon v-else class="size-12 text-blue-900" />
                </div>
                <div v-if="user?.isSystemAdmin || user?.orgRole === 'ADMIN'" class="flex gap-3">
                    <ActionButton label="Modifica Società" color="blue" />
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-8">
                    <div>
                        <h1 class="text-3xl font-bold text-blue-950">{{ organization.name }}</h1>
                        <p v-if="user?.isSystemAdmin" class="text-gray-500 mt-1">ID Organizzazione: {{ organization.id }}</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email di Contatto</p>
                            <p class="text-blue-950 font-medium">{{ organization.contact_email || 'Non specificata' }}</p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Piano Attivo</p>
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-widest">
                                {{ organization.plan_type || 'TRIAL' }}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
            <!-- Sezione Utenti della Società -->
            <div class="mt-4 pt-2 border-t border-slate-200">
                <h2 class="text-xl font-bold text-blue-950 mb-6 flex items-center gap-2">
                    <UserIcon class="size-6 text-blue-600" />
                    Utenti Associati
                </h2>
                
                <div v-if="orgUsers.length === 0" class="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <p class="text-slate-500 text-sm">Nessun utente associato a questa società.</p>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div v-for="orgUser in orgUsers" :key="orgUser.id" class="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
                        <div class="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <UserIcon class="size-5" />
                        </div>
                        <div class="min-w-0">
                            <p class="text-sm font-bold text-blue-950 truncate">{{ orgUser.name || 'Utente senza nome' }}</p>
                            <p class="text-xs text-gray-500 truncate">{{ orgUser.email }}</p>
                        </div>
                        <div class="flex ml-auto">
                            <p class="text-sm font-semibold text-blue-950 truncate">{{ orgUser.organization_role }}</p>
                        </div>
                        <div class="flex flex-row gap-2">
                            <ActionButton v-if="user?.isSystemAdmin || user?.orgRole === 'ADMIN'"
                                :icon="TrashIcon"
                                color="red"
                                :solid="false"
                                @click="showRemoveUserModal = true; selectedUser = orgUser"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
  <ConfirmModal 
    :isOpen="showRemoveUserModal" 
    title="Rimuovi utente"
    message="Vuoi davvero rimuovere questo utente dalla società?"
    @close="showRemoveUserModal = false" 
    @confirm="removeUser"
  />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref, toRef } from 'vue';
import { useBackofficeStore } from '@/stores/backofficeStore';
import { BuildingOffice2Icon, ArrowLeftIcon, UserIcon, TrashIcon } from '@heroicons/vue/24/outline';
import ActionButton from '@/components/buttons/ActionButton.vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

const route = useRoute();
const authStore = useAuthStore();
const user = toRef(authStore, 'user');
const backofficeStore = useBackofficeStore();

const showRemoveUserModal = ref(false);
const selectedUser = ref<any>(null);

const organization = computed(() => 
  backofficeStore.organizations.find(o => o.id === route.params.id)
);

const orgUsers = computed(() => 
  backofficeStore.users.filter(u => u.organization_id === route.params.id)
);

const removeUser = async () => {
  await backofficeStore.removeUser(selectedUser.value.id, organization.value.id);
  showRemoveUserModal.value = false;
  selectedUser.value = null;
};

onMounted(async () => {
  if (user.value?.isSystemAdmin && backofficeStore.organizations.length === 0) {
    await backofficeStore.getAdminDashboard();
  }
  else {
    await backofficeStore.getOrganization(route.params.id as string);
  }
});
</script>
