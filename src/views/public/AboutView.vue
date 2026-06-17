<script setup lang="ts">
import { InformationCircleIcon, EnvelopeIcon } from '@heroicons/vue/24/outline';

</script>

<template>

  <main class="flex-1 max-w-7xl mx-auto px-8 py-16">
      <header class="mb-12">
        <h1 class="text-4xl md:text-5xl font-black text-blue-950 mb-4">Chi Siamo / Contatti</h1>
        <div class="h-2 w-20 bg-blue-600 rounded-full"></div>
      </header>

      <!-- Sezione Chi Siamo -->
      <section class="mb-16">
        <h2 class="text-2xl font-black mb-6 flex items-center gap-3">
          <InformationCircleIcon class="h-7 w-7 text-blue-600" />
          Chi Siamo
        </h2>
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p class="text-lg text-slate-600 mb-6 leading-relaxed">
            Benvenuti su <span class="font-bold text-blue-900">WPStudio</span>.
          </p>
          <p class="text-lg text-slate-600 mb-6 leading-relaxed">
            Questo progetto nasce dalla passione di un allenatore di pallanuoto part-time e sviluppatore indipendente full-time, <span class="text-blue-600 font-semibold">Andrea Giuliani</span>, con una missione chiara: creare una piattaforma unica e accessibile in cui le società di pallanuoto possano gestire i live delle partite, trasmetterle pubblicamente a tutti gli appassionati o privatamente all'interno della propria organizzazione, tracciare le statistiche dei giocatori ed effettuare analisi video in maniera semplice, veloce e automatizzata.
          </p>
          <p class="text-lg text-slate-600 leading-relaxed font-medium">
            L'obiettivo è portare la tecnologia di livello professionale a bordo vasca, rendendola intuitiva per chiunque.
          </p>
        </div>
      </section>

      <!-- Sezione Contatti -->
      <section class="mb-12">
        <h2 class="text-2xl font-black mb-6 flex items-center gap-3">
          <EnvelopeIcon class="h-7 w-7 text-blue-600" />
          Contattaci
        </h2>
        <div class="bg-blue-950 text-white p-8 rounded-2xl shadow-xl">
          <p class="text-lg mb-6 leading-relaxed">
            Hai domande, suggerimenti, problemi tecnici con la piattaforma o vuoi discutere di una partnership commerciale?
          </p>
          <p class="text-lg mb-8 leading-relaxed text-blue-100">
            Siamo sempre felici di ascoltarti. Puoi metterti in contatto con noi scrivendo a:
          </p>
          
          <div class="bg-white/10 border border-white/20 p-6 rounded-xl backdrop-blur-sm transition-all hover:bg-white/20 group">
            <div class="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Email Ufficiale</div>
            <a 
              href="mailto:info@waterpolostudio.com" 
              class="text-2xl font-black text-white group-hover:text-blue-200 transition-colors break-all"
            >
              info@waterpolostudio.com
            </a>
          </div>

          <p class="mt-8 text-blue-300 text-sm italic">
            Faremo il possibile per risponderti nel minor tempo possibile!
          </p>
        </div>
      </section>
    </main>
</template>