<template>
  <div class="min-h-screen bg-slate-50 font-sans text-blue-950">
    <nav class="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
      <div class="text-2xl font-black tracking-tighter text-blue-900">
        MATCH LIVE <span class="text-blue-600">WP</span>
      </div>
      <router-link 
        to="/login" 
        class="bg-blue-950 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-900 transition-all shadow-md"
      >
        Accedi
      </router-link>
    </nav>

    <header class="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 class="text-5xl md:text-6xl font-black leading-tight mb-6">
          Il futuro della <br/>
          <span class="text-blue-600">Pallanuoto</span> è Live.
        </h1>
        <p class="text-lg text-slate-600 mb-8 leading-relaxed">
          Gestisci ogni azione, analizza i tiri in tempo reale e trasforma i dati della vasca in vantaggi tattici. La piattaforma completa per società, allenatori e cronometristi.
        </p>
        <div class="flex gap-4">
          <button class="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            Richiedi una Demo
          </button>
          <button class="border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all">
            Scopri di più
          </button>
        </div>
      </div>
      <div class="relative bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
        <div class="aspect-video bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden">
          <div class="text-blue-200 animate-pulse font-black text-4xl italic">SCOREBOARD PREVIEW</div>
        </div>
        <div class="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Ultimo Report</div>
            <div class="text-sm font-bold text-blue-900">SC Quinto vs Pro Recco</div>
          </div>
        </div>
      </div>
    </header>

    <section class="bg-white py-24">
      <div class="max-w-7xl mx-auto px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-black mb-4">Potenza e Precisione a bordo vasca</h2>
          <p class="text-slate-500">Tutto quello che serve per vincere la tua prossima partita.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="p-8 rounded-2xl hover:bg-slate-50 transition-all group">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Scoreboard Live</h3>
            <p class="text-slate-500 text-sm">Registra tiri in parità, superiorità e rigori con un tocco. Gestisci falli gravi ed espulsioni definitive con facilità.</p>
          </div>

          <div class="p-8 rounded-2xl hover:bg-slate-50 transition-all group border-2 border-transparent hover:border-blue-50">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Mappe di Calore</h3>
            <p class="text-slate-500 text-sm">Visualizza da dove tira la tua squadra e dove subisci. Filtra le zone d'attacco per quarto e categoria di tiro.</p>
          </div>

          <div class="p-8 rounded-2xl hover:bg-slate-50 transition-all group">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Analisi Video</h3>
            <p class="text-slate-500 text-sm">Carica i match, seleziona gli intervalli ed esporta clip mirate per migliorare le performance dei tuoi atleti.</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-slate-900 text-slate-400 py-12">
      <div class="max-w-7xl mx-auto px-8 flex justify-between items-center border-t border-slate-800 pt-8">
        <div class="font-bold text-white">MATCH LIVE WP</div>
        <div class="text-sm">© 2024 Waterpolo Match Management System.</div>
      </div>
    </footer>
  </div>
</template>