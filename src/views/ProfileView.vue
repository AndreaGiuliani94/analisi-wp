<template>
  <div class="flex justify-center">
    <div class="bg-white p-8 rounded-2xl border-2 border-gray-300 shadow-lg w-2/3 text-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-inner">
          {{ initials }}
        </div>
        <h2 class="text-xl font-semibold text-gray-800">
          {{ user?.name }}
        </h2>
        <h2 class="text-xl font-semibold text-gray-800">
          {{ user?.email }}
        </h2>

        <SessionsItem></SessionsItem>

        <div>
          <ActionButton color="red" @click="handleLogout" label="Esci"></ActionButton>
        </div>
      
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import SessionsItem from "../components/SessionsItem.vue";
import ActionButton from "@/components/buttons/ActionButton.vue";

const auth = useAuthStore();
const router = useRouter();

const user = auth.user;
const initials = user?.name?.split(' ')
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join('') || "?";

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};

</script>