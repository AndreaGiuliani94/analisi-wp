<template>
    <nav class="bg-blue-600 text-white p-4">
        <div class="container mx-auto flex justify-between items-center">
            <router-link to="/" class="flex items-center space-x-2"
                :class="{ 'font-bold': $route.path === '/' }">
                <span>🏠</span>
                <span>Dashboard</span>
            </router-link>
            <div class="space-x-4 flex">
                <router-link to="/game" class="flex items-center space-x-0.5"
                    :class="{ 'font-bold': $route.path === '/game' }">
                    <span>⚙️</span>
                    <span>Partita</span>
                </router-link>
                <router-link to="/analysis" class="flex items-center space-x-0.5"
                    :class="{ 'font-bold': $route.path === '/analysis' }">
                    <span>📊</span>
                    <span>Report</span>
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