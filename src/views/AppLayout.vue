<template>
  <div class="flex h-screen bg-slate-50 font-sans text-blue-950">
    
    <aside 
      class="bg-blue-950 text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out relative"
      :class="isCollapsed ? 'w-20' : 'w-64'"
    >
      <div class="h-16 flex items-center px-4 border-b border-blue-900" :class="isCollapsed ? 'justify-center' : 'justify-between'">
        <span v-if="!isCollapsed" class="text-lg font-bold tracking-wider whitespace-nowrap overflow-hidden">
          MATCH LIVE
        </span>
        
        <button @click="isCollapsed = !isCollapsed" class="p-2 rounded-lg hover:bg-blue-800 transition-colors text-blue-200 hover:text-white">
          <bars3-icon v-if="isCollapsed" class="size-6" />
          <chevron-double-left-icon v-else class="size-6" />
        </button>
      </div>

      <nav class="flex-1 px-3 py-6 space-y-2 overflow-hidden">
        
        <router-link to="/workspace/dashboard" class="flex items-center px-3 py-3 rounded-lg transition-colors hover:bg-blue-900" active-class="bg-blue-800 font-semibold border-l-4 border-white" :title="isCollapsed ? 'Dashboard' : ''">
          <squares2-x2-icon class="size-6 justify-self-center" />
          <span v-if="!isCollapsed" class="ml-4 whitespace-nowrap">Dashboard</span>
        </router-link>

        <router-link to="/workspace/analysis" class="flex items-center px-3 py-3 rounded-lg transition-colors hover:bg-blue-900" active-class="bg-blue-800 font-semibold border-l-4 border-white" :title="isCollapsed ? 'Analisi Video' : ''">
          <icon name="analisi" size="w-6 h-6" view-box="0 0 122.88 108.06" class="justify-self-center"/>
          <span v-if="!isCollapsed" class="ml-4 whitespace-nowrap">Analisi Video</span>
        </router-link>
        
      </nav>

      <div class="p-3 border-t border-blue-900 flex flex-col gap-2 overflow-hidden">
        <router-link v-if="user?.isSystemAdmin" to="/workspace/backoffice" class="flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-blue-900" active-class="bg-blue-800 font-semibold" :title="isCollapsed ? 'Impostazioni' : ''">
          <lifebuoy-icon class="size-6" />
          <span v-if="!isCollapsed" class="ml-4 whitespace-nowrap text-sm">Backoffice</span>
        </router-link>
        <router-link to="/workspace/dashboard" class="flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-blue-900" active-class="bg-blue-800 font-semibold" :title="isCollapsed ? 'Impostazioni' : ''">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span v-if="!isCollapsed" class="ml-4 whitespace-nowrap text-sm">Impostazioni</span>
        </router-link>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
        <h1 class="text-xl font-bold text-blue-950">{{ currentRouteName }}</h1>
        
        <div class="flex items-center gap-3">
          <router-link v-if="authStore.isLoggedIn" to="/workspace/profile" class="flex items-center space-x-1"
              :class="{ 'font-bold': $route.path === '/profile' }">
              <user-circle-icon class="size-5"/>
              <span class="hidden sm:inline">{{ initials }}</span>
          </router-link>
          <router-link v-else to="/login" class="flex items-center space-x-1"
              :class="{ 'font-bold': $route.path === '/login' }">
              <user-icon class="size-5"/>
              <span class="hidden sm:inline">Login</span>
          </router-link>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4">
        <router-view />
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/icons/Icon.vue';
import { useInitials } from '@/composables/useInitials';
import { useAuthStore } from '@/stores/authStore';
import { UserCircleIcon, UserIcon, Squares2X2Icon, LifebuoyIcon} from '@heroicons/vue/24/outline';
import { Bars3Icon, ChevronDoubleLeftIcon } from '@heroicons/vue/24/solid';
import { ref, computed, toRef } from 'vue';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const user = toRef(authStore, 'user');

const { initials } = useInitials(user)

const route = useRoute();
// Stato della sidebar. Di default aperta su schermi grandi, chiusa su piccoli.
// (In futuro potresti salvare questa preferenza nel localStorage)
const isCollapsed = ref(false);

const currentRouteName = computed(() => {
  return route.name || 'Dashboard';
});
</script>