<script setup lang="ts">
import { InformationCircleIcon, DocumentTextIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';

const lastUpdate = "15 Giugno 2026"; 
</script>

<template>
  <main class="flex-1 max-w-7xl mx-auto px-8 py-16">
    <header class="mb-12">
      <h1 class="text-4xl md:text-5xl font-black text-blue-950 mb-4">Cookie Policy</h1>
      <div class="h-2 w-20 bg-blue-600 rounded-full mb-4"></div>
      <p class="text-slate-500 font-medium italic text-sm">Ultimo aggiornamento: {{ lastUpdate }}</p>
    </header>

    <section class="mb-12">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <p class="text-lg text-slate-600 leading-relaxed">
          Il sito <span class="font-bold text-blue-900">waterpolostudio.com</span> utilizza i cookie per garantire il corretto funzionamento della piattaforma e per offrirti annunci pubblicitari personalizzati.
        </p>
      </div>
    </section>

    <!-- Cosa sono i cookie -->
    <section class="mb-16">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-blue-950">
        <InformationCircleIcon class="h-7 w-7 text-blue-600" />
        Cosa sono i cookie?
      </h2>
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <p class="text-lg text-slate-600 leading-relaxed">
          I cookie sono piccoli file di testo che i siti visitati inviano al tuo dispositivo, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva.
        </p>
      </div>
    </section>

    <!-- Tipologie -->
    <section class="mb-16">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-blue-950">
        <DocumentTextIcon class="h-7 w-7 text-blue-600" />
        Tipologie di Cookie utilizzati
      </h2>
      
      <div class="space-y-6">
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 class="text-xl font-bold text-blue-900 mb-4">1. Cookie Tecnici e di Navigazione</h3>
          <p class="text-slate-600 leading-relaxed">
            Sono fondamentali per il funzionamento di WPStudio. Ci permettono di mantenere la tua sessione di login attiva, salvare le tue preferenze di base e garantire la sicurezza del tuo account (gestiti tramite Supabase e Vercel). Senza questi cookie, l'app non potrebbe funzionare. Non richiedono il tuo consenso preventivo.
          </p>
        </div>

        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 class="text-xl font-bold text-blue-900 mb-4">2. Cookie Pubblicitari e di Profilazione</h3>
          <p class="text-slate-600 leading-relaxed mb-6">
            Utilizziamo <span class="font-semibold">Google AdSense</span> per mostrare pubblicità sul nostro sito e sostenere il progetto. I fornitori di terze parti, tra cui Google, utilizzano i cookie per pubblicare annunci in base alle tue precedenti visite su questo o su altri siti web.
          </p>
          <div class="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl">
            <p class="text-blue-800 leading-relaxed text-sm">
              L'utilizzo dei cookie per la pubblicità consente a Google e ai suoi partner di mostrare annunci pertinenti agli utenti basandosi sulla loro navigazione su waterpolostudio.com e/o su altri siti Internet.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Gestione Consenso -->
    <section class="mb-12">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-blue-950">
        <Cog6ToothIcon class="h-7 w-7 text-blue-600" />
        Gestione del consenso e browser
      </h2>
      <div class="bg-blue-950 text-white p-8 rounded-2xl shadow-xl">
        <p class="text-lg mb-6 leading-relaxed">
          Puoi scegliere di disattivare la pubblicità personalizzata visitando la pagina 
          <a href="https://adssettings.google.com" target="_blank" class="text-blue-400 font-bold hover:underline transition-colors">Impostazioni annunci di Google</a>.
        </p>
        <p class="text-lg mb-8 leading-relaxed">
          In alternativa, puoi gestire i cookie di terze parti visitando il sito 
          <a href="http://www.aboutads.info" target="_blank" class="text-blue-400 font-bold hover:underline transition-colors">www.aboutads.info</a>.
        </p>
        
        <div class="bg-white/10 border border-white/20 p-6 rounded-xl backdrop-blur-sm">
          <h4 class="text-sm font-bold uppercase tracking-widest text-blue-300 mb-2">Impostazioni Browser</h4>
          <p class="text-sm text-blue-100 leading-relaxed">Puoi sempre gestire, bloccare o eliminare i cookie modificando le impostazioni del tuo browser (Chrome, Firefox, Safari, Edge). Tuttavia, bloccare i cookie tecnici renderà impossibile l'utilizzo di WPStudio.</p>
        </div>
      </div>
    </section>
  </main>
</template>