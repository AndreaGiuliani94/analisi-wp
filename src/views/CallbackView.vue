<template>
  <div v-if="loading">Sto effettuando il login...</div>
</template>

<script setup lang="ts">
import { loginWithGoogle } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const loading = ref(true);

onMounted(async () => {
  const code = route.query.code as string | undefined;
  if (!code) {
    alert("Nessun codice OAuth ricevuto");
    router.push("/login");
    return;
  }

  const res = await loginWithGoogle(code);

  if (res.ok) {
    const data = await res.json();
    auth.setAuth(data.access_token, { email: data.email, name: data.name });
    router.push("/profile");
  } else {
    alert("Login fallito");
    router.push("/login");
  }

  loading.value = false;
});
</script>
