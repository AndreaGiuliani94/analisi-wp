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

        <button
          @click="handleLogout"
          class="mt-6 min-w-30 bg-red-800 active:ring-2 active:ring-red-300 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Esci
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const user = auth.user;
const initials = user?.email?.charAt(0)?.toUpperCase() || "?";

// onMounted(async () => {
//   const res = await fetch(import.meta.env.VITE_BE_URL + "/profile", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//   });

//   console.log(res);

// });


const handleLogout = () => {
  auth.logout();
  router.push("/login");
};

</script>