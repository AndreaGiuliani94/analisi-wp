<template>
  <div class="flex justify-center">
    <div class="bg-white shadow-lg rounded-2xl border-2 border-gray-300 p-8 w-full max-w-sm text-center text-blue-950">
      <h1 class="text-2xl font-bold  mb-6">Accedi</h1>
      
      <form @submit.prevent="login" class="space-y-4">
        <BaseInput 
          id="email"
          placeholder="Email"
          v-model="email"
          type="email"
          required></BaseInput>

        <BaseInput 
          id="password"
          placeholder="Password"
          v-model="password"
          type="password"
          required></BaseInput>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <ActionButton 
          type="submit"
          :label="loading ? 'Accesso in corso...' : 'Accedi'"
          color="blue"
          size="half"
          justify="center"
          :disabled="loading"
        ></ActionButton>

        <ActionButton 
          :label="'Registrati'"
          color="blue"
          size="half"
          justify="center"
          :disabled="loading"
          @click="showRegisterModal = true"
        ></ActionButton>

      </form>

      <div class="my-4 text-center text-gray-500">oppure</div>

      <div class="flex justify-center">
        <button @click="loginWithGoogle"
          class="flex items-center justify-center gap-2 bg-blue-950 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
        <Icon name="google" size="w-5 h-5" viewBox="0 0 48 48"></Icon>
          Accedi con Google
        </button>
      </div>

      <RegisterModal :isOpen="showRegisterModal" @close="showRegisterModal = false"/>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import Icon from "@/components/icons/Icon.vue";
import ActionButton from "@/components/buttons/ActionButton.vue";
import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";
import RegisterModal from "@/components/modals/RegisterModal.vue";
import { loginWithCredentials } from "@/services/authService";
import BaseInput from "@/components/inputs/BaseInput.vue";

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const auth = useAuthStore()
const showRegisterModal = ref(false);

const login = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await loginWithCredentials(email.value, password.value);

    if (!res.ok) {
      throw new Error('Credenziali errate o utente non trovato')
    }

    const data = await res.json()
    auth.setAuth(data.access_token, { email: data.email, name: data.name })
    router.push('/profile')
  } catch (e: any) {
    error.value = e.message || 'Errore di autenticazione'
  } finally {
    loading.value = false
  }
}

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