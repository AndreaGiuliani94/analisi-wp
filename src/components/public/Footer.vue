<template>
    <footer class="bg-slate-900 text-slate-400 py-8 text-sm text-center">
        <div class="flex justify-center gap-6 mb-4">
            <router-link to="/about" class="hover:text-white transition-colors">Chi Siamo</router-link>
            <router-link to="/privacy" class="hover:text-white transition-colors">Privacy Policy</router-link>
            <router-link to="/cookies" class="hover:text-white transition-colors">Cookie Policy</router-link>
        </div>
        <p>&copy; {{ new Date().getFullYear() }} WPStudio. Tutti i diritti riservati.</p>
    </footer>
</template>