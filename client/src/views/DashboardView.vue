<script setup lang="ts">
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gold mb-6">Dashboard</h1>

    <div class="grid md:grid-cols-2 gap-5">
      <router-link to="/matches" class="block bg-pitch-light border border-pitch-lighter rounded-xl p-6 hover:border-gold/40 transition group">
        <div class="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition">
          <span class="text-2xl">⚽</span>
        </div>
        <h2 class="text-lg font-semibold text-gold mb-2">Partidos</h2>
        <p class="text-sm text-gray-500 leading-relaxed">Consultá los resultados en vivo, los próximos encuentros y el historial de cada fase del Mundial.</p>
      </router-link>

      <router-link to="/predictions" class="block bg-pitch-light border border-pitch-lighter rounded-xl p-6 hover:border-gold/40 transition group">
        <div class="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition">
          <span class="text-2xl">📊</span>
        </div>
        <h2 class="text-lg font-semibold text-gold mb-2">Mis Pronósticos</h2>
        <p class="text-sm text-gray-500 leading-relaxed">Hacé tus predicciones para los próximos partidos y revisá los resultados de las que ya jugaste.</p>
      </router-link>

      <router-link to="/standings" class="block bg-pitch-light border border-pitch-lighter rounded-xl p-6 hover:border-gold/40 transition group">
        <div class="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition">
          <span class="text-2xl">🏆</span>
        </div>
        <h2 class="text-lg font-semibold text-gold mb-2">Tabla de posiciones</h2>
        <p class="text-sm text-gray-500 leading-relaxed">Seguí el ranking de usuarios por puntos acumulados en los pronósticos.</p>
      </router-link>
    </div>
  </div>
</template>
