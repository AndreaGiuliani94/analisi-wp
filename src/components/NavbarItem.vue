<template>
    <nav class="bg-blue-950 text-white p-2 h-12 flex items-center">
        <div class="w-full mx-auto flex justify-between items-center">
            <router-link to="/workspace/dashboard" class="flex items-center space-x-1"
                :class="{ 'font-bold': $route.path === '/' }">
                 <!-- <Icon name="dashboard" size="w-5 h-5" /> -->
                  <ArrowLeftIcon class="size-5"></ArrowLeftIcon>
                <span class="hidden sm:inline">Dashboard</span>
            </router-link>
            <div class="space-x-2 flex bg-blue-900/50 p-1 rounded-lg">
                <router-link to="setup" class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors"
                    active-class="font-bold bg-blue-600 text-white">
                    <!-- <Icon name="water_polo" size="w-5 h-5" /> -->
                    <span class="hidden sm:inline">Distinta</span>
                </router-link>
                <router-link to="live" class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors"
                    active-class="font-bold bg-blue-600 text-white">
                    <!-- <Icon name="analisi" size="w-5 h-5" view-box="0 0 122.88 108.06" /> -->
                    <span class="hidden sm:inline">Live</span>
                </router-link>
                <router-link to="events" class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors"
                    active-class="font-bold bg-blue-600 text-white">
                    <!-- <WrenchScrewdriverIcon class="size-5"></WrenchScrewdriverIcon> -->
                    <span class="hidden sm:inline">Cronaca</span>
                </router-link>
                <router-link to="report" class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors"
                    active-class="font-bold bg-blue-600 text-white">
                    <!-- <WrenchScrewdriverIcon class="size-5"></WrenchScrewdriverIcon> -->
                    <span class="hidden sm:inline">Report</span>
                </router-link>
            </div>
            <div>
                <router-link to="settings" class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors"
                    active-class="font-bold bg-blue-600 text-white">
                    <WrenchScrewdriverIcon class="size-5"></WrenchScrewdriverIcon>
                    <span class="hidden sm:inline">Impostazioni</span>
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { UserCircleIcon, WrenchScrewdriverIcon, UserIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline';
import Icon from './icons/Icon.vue';
import { useAuthStore } from '@/stores/authStore';
import { useInitials } from '@/composables/useInitials';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserRole } from '@/composables/useUserRole';
import { useGameStore } from '@/stores/gameStore';
import { toRef } from 'vue';

const authStore = useAuthStore();
const sessionStore = useSessionStore();
const gameStore = useGameStore()

const user = toRef(authStore, 'user');

const { initials } = useInitials(user)

const { role: userRole } = useUserRole(sessionStore.currentSession.participants)
</script>