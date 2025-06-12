<template>
    <nav class="bg-blue-950 text-white p-4 h-13">
        <div class="w-full mx-auto flex justify-between items-center">
            <router-link to="/dashboard" class="flex items-center space-x-1"
                :class="{ 'font-bold': $route.path === '/' }">
                 <Icon name="dashboard" size="w-5 h-5" />
                <span class="hidden sm:inline">Match Live WP</span>
            </router-link>
            <div class="space-x-4 flex">
                <router-link v-if="auth.isLoggedIn" to="/game" class="flex items-center space-x-1"
                    :class="{ 'font-bold': $route.path.includes('/game') }">
                    <Icon name="water_polo" size="w-5 h-5" />
                    <span class="hidden sm:inline">Partita</span>
                </router-link>
                <router-link v-if="auth.isLoggedIn" to="/analysis" class="flex items-center space-x-1"
                    :class="{ 'font-bold': $route.path.includes('/analysis') }">
                    <Icon name="analisi" size="w-5 h-5" view-box="0 0 122.88 108.06" />
                    <span class="hidden sm:inline">Analisi</span>
                </router-link>
                <!-- <router-link v-if="auth.isLoggedIn" to="/settings" class="flex items-center space-x-1"
                    :class="{ 'font-bold': $route.path === '/settings' }">
                    <WrenchScrewdriverIcon class="size-5"></WrenchScrewdriverIcon>
                    <span class="hidden sm:inline">Impostazioni</span>
                </router-link> -->
                <router-link v-if="auth.isLoggedIn" to="/profile" class="flex items-center space-x-1"
                    :class="{ 'font-bold': $route.path === '/profile' }">
                    <UserCircleIcon class="size-5"></UserCircleIcon>
                    <span class="hidden sm:inline">Profilo</span>
                </router-link>
                <router-link v-else to="/login" class="flex items-center space-x-1"
                    :class="{ 'font-bold': $route.path === '/login' }">
                    <UserIcon class="size-5"></UserIcon>
                    <span class="hidden sm:inline">Login</span>
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { UserCircleIcon, WrenchScrewdriverIcon, UserIcon } from '@heroicons/vue/24/outline';
import Icon from './icons/Icon.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

</script>