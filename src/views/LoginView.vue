<template>
  <div class="flex justify-center">
    <div class="bg-white shadow-lg rounded-2xl border-2 border-gray-300 p-8 w-full max-w-sm text-center">
      <h1 class="text-2xl font-bold text-blue-950 mb-6">Accedi</h1>
        <button @click="loginWithGoogle"
          class="w-full flex items-center justify-center gap-2 bg-blue-950 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
        <Icon name="google" size="w-5 h-5" viewBox="0 0 48 48"></Icon>
          Accedi con Google
        </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import Icon from "@/components/icons/Icon.vue";

const router = useRouter();

const loginWithGoogle = () => {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", import.meta.env.VITE_GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline"); // per refresh token
  url.searchParams.set("prompt", "consent"); // forza richiesta consenso per refresh token sempre

  window.location.href = url.toString();
};

</script>