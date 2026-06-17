<script setup lang="ts">
import { BoltIcon, MapIcon, VideoCameraIcon, SignalIcon } from '@heroicons/vue/24/outline';
</script>

<template>
  <!-- Hero Section Migliorata -->
  <header class="max-w-7xl mx-auto px-8 py-24 text-center">
    <h1 class="text-5xl md:text-7xl font-black leading-tight mb-8">
      Il futuro della <br/>
      <span class="text-blue-600 text-glow">Pallanuoto</span> è Live.
    </h1>
    <p class="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
      Gestisci ogni azione, analizza i tiri in tempo reale e trasforma i dati della vasca in vantaggi tattici. 
      La piattaforma completa per società, allenatori e cronometristi.
    </p>
    <div class="flex flex-col sm:flex-row justify-center gap-6">
      <a href="mailto:info@waterpolostudio.com" 
         class="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1">
        Richiedi una Demo
      </a>
    </div>
  </header>

  <!-- Feature 1: Scoreboard (Testo a Sinistra) - Tema Scuro -->
  <section class="bg-blue-950 py-24 text-white">
    <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div class="order-2 lg:order-1">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-300 font-bold text-sm mb-6">
          <BoltIcon class="h-5 w-5" />
          DYNAMICSCORE
        </div>
        <h2 class="text-4xl font-black mb-6">Scoreboard Live Intelligente</h2>
        <p class="text-lg text-blue-100/80 mb-6 leading-relaxed">
          Non un semplice tabellino, ma un centro di controllo. Registra tiri in parità, superiorità numerica e rigori con un solo tocco. 
          Gestisci i falli gravi e le espulsioni definitive con un'interfaccia ottimizzata per la velocità a bordo vasca.
        </p>
        <ul class="space-y-4 text-blue-100 font-medium">
          <li class="flex items-center gap-3"><span class="h-2 w-2 bg-blue-500 rounded-full"></span> Tracking falli istantaneo</li>
          <li class="flex items-center gap-3"><span class="h-2 w-2 bg-blue-500 rounded-full"></span> Gestione tempi e timeout</li>
          <li class="flex items-center gap-3"><span class="h-2 w-2 bg-blue-500 rounded-full"></span> Log eventi in tempo reale</li>
          <li class="flex items-center gap-3"><span class="h-2 w-2 bg-blue-500 rounded-full"></span> Possibilità di gestione delle sostituzioni</li>
        </ul>
      </div>
      <div class="order-1 lg:order-2 bg-white/5 rounded-3xl p-4 shadow-inner border border-white/10 backdrop-blur-sm">
        <div class="aspect-video bg-blue-950 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
          <span class="text-blue-400 font-bold italic">SNAPSHOT: SCOREBOARD INTERFACE</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Feature 2: Mappe di Calore (Testo a Destra) -->
  <section class="bg-slate-50 py-24">
    <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div class="bg-white rounded-3xl p-4 shadow-xl border border-slate-200">
        <div class="aspect-video bg-blue-100 rounded-2xl flex items-center justify-center overflow-hidden">
          <span class="text-blue-600 font-bold italic">SNAPSHOT: HEATMAP ANALYTICS</span>
        </div>
      </div>
      <div>
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-6">
          <MapIcon class="h-5 w-5" />
          VISUAL INSIGHTS
        </div>
        <h2 class="text-4xl font-black mb-6 text-blue-950">Mappe di Calore e Report</h2>
        <p class="text-lg text-slate-600 mb-6 leading-relaxed">
          Visualizza visivamente l'efficacia offensiva. Scopri da dove tira la tua squadra e, soprattutto, dove subisci i gol. 
          Filtra le zone d'attacco per tempo di gioco o categoria di tiro per adattare la tua difesa durante l'intervallo. 
        </p>
        <ul class="space-y-4 text-slate-700 font-medium">
          <li class="flex items-center gap-3"><span class="h-2 w-2 bg-blue-600 rounded-full"></span> Analisi precisione al tiro per zona</li>
          <li class="flex items-center gap-3"><span class="h-2 w-2 bg-blue-600 rounded-full"></span> Valuta l'efficacia della tua difesa</li>
          <li class="flex items-center gap-3"><span class="h-2 w-2 bg-blue-600 rounded-full"></span> Confronta ogni periodo di gioco</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Feature 3: Analisi Video (Testo a Sinistra) - Tema Scuro -->
  <section class="bg-blue-950 py-24 text-white">
    <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div>
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-300 font-bold text-sm mb-6">
          <VideoCameraIcon class="h-5 w-5" />
          VIDEO CLIPPING
        </div>
        <h2 class="text-4xl font-black mb-6">Analisi Video Integrata</h2>
        <p class="text-lg text-blue-100/80 mb-6 leading-relaxed">
          Collega i dati statistici alle immagini. Carica i match registrati e naviga istantaneamente tra le azioni salienti. 
          Crea clip personalizzate per i tuoi atleti per mostrare errori posizionali o giocate spettacolari.
        </p>
        <div class="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/10">
          <div class="p-2 bg-blue-500 rounded-lg text-white">
            <VideoCameraIcon class="h-6 w-6" />
          </div>
          <p class="text-sm font-semibold text-blue-100">Tagging automatico degli eventi video tramite scoreboard live.</p>
        </div>
      </div>
      <div class="bg-blue-900 rounded-3xl p-2 shadow-2xl relative overflow-hidden border border-white/10">
        <div class="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center">
          <span class="text-slate-500 font-bold italic uppercase tracking-widest text-sm">Video Player & Event Timeline</span>
        </div>
        <div class="absolute bottom-4 left-4 right-4 h-1 bg-blue-500/30 rounded-full overflow-hidden">
          <div class="w-1/3 h-full bg-blue-500"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Feature 4: Broadcast (Testo a Destra) - Tema Chiaro -->
  <section class="bg-slate-50 py-24 text-blue-950 overflow-hidden">
    <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div class="relative">
        <div class="absolute -inset-10 bg-blue-400/10 blur-3xl rounded-full"></div>
        <div class="relative bg-white rounded-3xl p-4 border border-slate-200 shadow-2xl">
          <div class="aspect-video bg-blue-50 rounded-2xl flex items-center justify-center">
            <span class="text-blue-600 font-bold italic">SNAPSHOT: PUBLIC LIVE HUB</span>
          </div>
        </div>
      </div>
      <div>
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-6">
          <SignalIcon class="h-5 w-5" />
          LIVE STREAMING DATA
        </div>
        <h2 class="text-4xl font-black mb-6">Coinvolgi i tuoi Tifosi</h2>
        <p class="text-lg text-slate-600 mb-6 leading-relaxed">
          Porta la passione della vasca ovunque. Condividi un link pubblico dove i tifosi possono seguire il punteggio, 
          i tempi di gioco e le statistiche dei propri beniamini in tempo reale su qualsiasi dispositivo.
        </p>
        <div class="grid grid-cols-2 gap-6">
          <div class="border-l-4 border-blue-500 pl-4">
            <div class="text-2xl font-black text-blue-950">100%</div>
            <div class="text-sm text-slate-500 uppercase tracking-tighter">Mobile Friendly</div>
          </div>
          <div class="border-l-4 border-blue-500 pl-4">
            <div class="text-2xl font-black text-blue-950">&lt; 1s</div>
            <div class="text-sm text-slate-500 uppercase tracking-tighter">Latenza Dati</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-glow {
  text-shadow: 0 0 30px rgba(37, 99, 235, 0.2);
}
</style>