<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const stats = ref<any>(null)
const loading = ref(true)

async function fetchStats() {
  try {
    const res = await fetch('/api/predictions/stats', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (res.ok) stats.value = await res.json()
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
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

    <div v-if="stats && !loading" class="mt-8 bg-pitch-light border border-pitch-lighter rounded-xl p-6">
      <h3 class="text-lg font-semibold text-gold mb-4">Mis estadísticas</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{{ stats.totalPredictions }}</div>
          <div class="text-xs text-gray-400 mt-1">Pronósticos</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">{{ stats.exactPredictions }}</div>
          <div class="text-xs text-gray-400 mt-1">Exactos (6pts)</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-400">{{ stats.correctWinnerPredictions }}</div>
          <div class="text-xs text-gray-400 mt-1">Ganador (3pts)</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{{ stats.currentStreak }}</div>
          <div class="text-xs text-gray-400 mt-1">Racha actual</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gold">{{ stats.maxStreak }}</div>
          <div class="text-xs text-gray-400 mt-1">Mejor racha</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400">{{ stats.avgPoints }}</div>
          <div class="text-xs text-gray-400 mt-1">Promedio pts</div>
        </div>
      </div>
    </div>
  </div>
</template>
