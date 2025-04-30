<template>
    <nav class="bg-blue-950 text-white p-4 h-13">
        <div class="container mx-auto flex justify-between items-center">
            <router-link to="/" class="flex items-center space-x-0.5"
                :class="{ 'font-bold': $route.path === '/' }">
                <!-- <span>🏠</span> -->
                 <Icon name="dashboard" size="w-5 h-5" />
                <span>Dashboard</span>
            </router-link>
            <div class="space-x-4 flex">
                <router-link to="/game" class="flex items-center space-x-0.5"
                    :class="{ 'font-bold': $route.path.includes('/game') }">
                    <Icon name="water_polo" size="w-5 h-5" />
                    <span>Partita</span>
                </router-link>
                <router-link to="/analysis" class="flex items-center space-x-0.5"
                    :class="{ 'font-bold': $route.path.includes('/analysis') }">
                    <span>📊</span>
                    <span>Analisi</span>
                </router-link>
                <router-link to="/settings" class="flex items-center space-x-0.5"
                    :class="{ 'font-bold': $route.path === '/settings' }">
                    <span>⚙️</span>
                    <span>Impostazioni</span>
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import Icon from './icons/Icon.vue';

</script>