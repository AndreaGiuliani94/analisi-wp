<template>
  <div class="flex justify-center">
    <div class="bg-white shadow-lg rounded-2xl border-2 border-gray-300 p-8 w-full max-w-sm text-center">
      <h1 class="text-2xl font-bold text-blue-950 mb-6">Accedi</h1>

      <button
        @click="handleLogin"
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
import { loginWithGoogle, loginWithGoogleMock } from "@/services/authService";
import { googleTokenLogin } from "vue3-google-login";
import Icon from "@/components/icons/Icon.vue";

const router = useRouter();

const handleLogin = async () => {
  // const google = await googleTokenLogin({
  //   clientId: "TUO_CLIENT_ID",
  // });
  // await loginWithGoogle(google.access_token);
  await loginWithGoogleMock("mock");
  router.push("/profile");
};
</script>