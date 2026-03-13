<template>
  <div class="flex justify-center">
    <div class="bg-white p-8 rounded-2xl border-2 border-gray-300 shadow-lg w-2/3 text-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-inner">
          {{ initials }}
        </div>
        <h2 class="text-xl font-semibold text-gray-800">
          {{ user?.name }}
        </h2>
        <h2 class="text-xl font-semibold text-gray-800">
          {{ user?.email }}
        </h2>

        <SessionsItem></SessionsItem>

        <div class="flex items-center justify-center gap-3">
          <ActionButton @click="openCreateModal" :disabled="loading" color="green" label="Crea una nuova partita"
          >
          </ActionButton>
      
          <ActionButton @click="openJoinModal" :disabled="loading" color="blue" label="Unisciti a un partita">
          </ActionButton>
        </div>
        
        <ActionButton color="red" @click="handleLogout" label="Esci"></ActionButton>
        
        
      </div>
    </div>
  </div>
  <NewSessionModal :isOpen="showCreateSessionModal" @close="closeCreateModal"/>
  <JoinSessionModal :isOpen="showJoinSessionModal" @close="closeJoinModal"/>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import SessionsItem from "../components/SessionsItem.vue";
import ActionButton from "@/components/buttons/ActionButton.vue";
import NewSessionModal from "@/components/modals/NewSessionModal.vue";
import JoinSessionModal from "@/components/modals/JoinSessionModal.vue";
import { ref } from "vue";
import { useSessionStore } from "@/stores/sessionStore";

const auth = useAuthStore();
const sessionStore = useSessionStore()
const router = useRouter();
const showCreateSessionModal = ref(false);
const showJoinSessionModal = ref(false);
const loading = ref(false)


const user = auth.user;
const initials = user?.name?.split(' ')
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join('') || "?";

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};

const openCreateModal = async () => {
  loading.value = true
  showCreateSessionModal.value = true
}

const closeCreateModal = async () => {
  showCreateSessionModal.value = false
  loading.value = false
  sessionStore.getAllSessions()
}

const openJoinModal = async () => {
  loading.value = true
  showJoinSessionModal.value = true
}

const closeJoinModal = async () => {
  showJoinSessionModal.value = false
  loading.value = false
  sessionStore.getAllSessions()
}

</script>