<script setup lang="ts">
import { UserIcon, DocumentTextIcon, ServerStackIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline';

const lastUpdate = "15 Giugno 2026";
</script>

<template>
  <main class="flex-1 max-w-7xl mx-auto px-8 py-16">
    <header class="mb-12">
      <h1 class="text-4xl md:text-5xl font-black text-blue-950 mb-4">Privacy Policy</h1>
      <div class="h-2 w-20 bg-blue-600 rounded-full mb-4"></div>
      <p class="text-slate-500 font-medium italic text-sm">Ultimo aggiornamento: {{ lastUpdate }}</p>
    </header>

    <section class="mb-12">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <p class="text-lg text-slate-600 leading-relaxed">
          Benvenuto su <span class="font-bold text-blue-900">WPStudio</span> (waterpolostudio.com). La tua privacy è per noi di fondamentale importanza. Questa informativa descrive come raccogliamo, utilizziamo, proteggiamo e condividiamo i tuoi dati personali nel rispetto del <span class="font-semibold text-blue-600">GDPR (Regolamento UE 2016/679)</span>.
        </p>
      </div>
    </section>

    <!-- 1. Titolare -->
    <section class="mb-12">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-blue-950">
        <UserIcon class="h-7 w-7 text-blue-600" />
        1. Titolare del Trattamento
      </h2>
      <div class="bg-blue-950 text-white p-8 rounded-2xl shadow-xl">
        <p class="text-lg mb-4">Il titolare del trattamento dei dati è lo sviluppatore indipendente <span class="font-bold text-blue-400">Andrea Giuliani</span>.</p>
        <p class="text-blue-100 italic">Per qualsiasi domanda, puoi contattarci a: <a href="mailto:info@waterpolostudio.com" class="underline hover:text-white transition-colors">info@waterpolostudio.com</a></p>
      </div>
    </section>

    <!-- 2. Dati Raccolti -->
    <section class="mb-12">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-blue-950">
        <DocumentTextIcon class="h-7 w-7 text-blue-600" />
        2. Dati Raccolti
      </h2>
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <p class="text-slate-600 mb-4">Raccogliamo i seguenti dati forniti volontariamente durante la registrazione:</p>
        <ul class="space-y-3 font-bold text-blue-900">
          <li class="flex items-center gap-2"><span class="w-2 h-2 bg-blue-600 rounded-full"></span> Nome e Cognome</li>
          <li class="flex items-center gap-2"><span class="w-2 h-2 bg-blue-600 rounded-full"></span> Indirizzo Email</li>
        </ul>
      </div>
    </section>

    <!-- 4. Servizi Terzi -->
    <section class="mb-12">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-blue-950">
        <ServerStackIcon class="h-7 w-7 text-blue-600" />
        3. Servizi di Terze Parti
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 class="font-bold text-blue-900 mb-2">Supabase</h3>
          <p class="text-sm text-slate-500">Gestione del database e autenticazione sicura.</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 class="font-bold text-blue-900 mb-2">Vercel</h3>
          <p class="text-sm text-slate-500">Hosting del sito web e del frontend.</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 class="font-bold text-blue-900 mb-2">AWS & Google Cloud</h3>
          <p class="text-sm text-slate-500">Infrastruttura di backend ed elaborazione video.</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 class="font-bold text-blue-900 mb-2">Google AdSense</h3>
          <p class="text-sm text-slate-500">Cookie pubblicitari per sostenere il progetto.</p>
        </div>
      </div>
    </section>

    <!-- 5. Diritti -->
    <section class="mb-12">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-blue-950">
        <ShieldCheckIcon class="h-7 w-7 text-blue-600" />
        4. I tuoi Diritti (GDPR)
      </h2>
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <p class="text-slate-600 mb-6">Ai sensi del GDPR, hai il diritto di accedere, rettificare o richiedere la cancellazione dei tuoi dati ("Diritto all'oblio").</p>
        <div class="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p class="text-sm text-slate-600 leading-relaxed">
            Per esercitare i tuoi diritti o richiedere la portabilità dei dati, scrivici a <span class="font-bold text-blue-900">info@waterpolostudio.com</span>. Risponderemo entro 30 giorni.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>