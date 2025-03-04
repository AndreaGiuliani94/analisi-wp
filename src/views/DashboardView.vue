<template>
    <div class="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <router-link to="/game" class="px-6 py-2 bg-blue-500 text-white rounded">Gestione Partita Live</router-link>
      <router-link to="/analysis" class="px-6 py-2 bg-green-500 text-white rounded">Analisi Video</router-link>
      <router-link to="/settings" class="px-6 py-2 bg-gray-500 text-white rounded">Impostazioni</router-link>
    </div>
  </template>