<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Swords, Trophy, ChartLine, Target, Zap, TrendingUp, Medal, Star } from '@lucide/vue'
import { Card, CardContent } from '@/components/ui'

const auth = useAuthStore()
const router = useRouter()
const stats = ref<any>(null)
const loading = ref(true)

async function fetchStats() {
  try {
    const res = await fetch('/api/predictions/stats', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (res.ok) stats.value = await res.json()
  } catch { /* silent */ }
  finally { loading.value = false }
}

onMounted(fetchStats)

const quickLinks = [
  { to: '/matches', icon: Swords, title: 'Partidos', desc: 'Resultados y próximos encuentros', gradient: 'from-gold/20 to-gold/5', delay: 0 },
  { to: '/predictions', icon: ChartLine, title: 'Mis Pronósticos', desc: 'Hacé tus predicciones y seguí tus puntos', gradient: 'from-grass/20 to-grass/5', delay: 100 },
  { to: '/standings', icon: Trophy, title: 'Posiciones', desc: 'Ranking de usuarios por puntos acumulados', gradient: 'from-purple-500/20 to-purple-500/5', delay: 200 },
]

const statCards = [
  { key: 'totalPredictions', label: 'Pronósticos', icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { key: 'exactPredictions', label: 'Exactos (6pts)', icon: Star, color: 'text-grass', bg: 'bg-grass/10' },
  { key: 'correctWinnerPredictions', label: 'Ganador (3pts)', icon: Medal, color: 'text-gold', bg: 'bg-gold/10' },
  { key: 'currentStreak', label: 'Racha actual', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { key: 'maxStreak', label: 'Mejor racha', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
  { key: 'avgPoints', label: 'Promedio pts', icon: ChartLine, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
]
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-3xl font-bold text-foreground tracking-tight">
        Bienvenido, <span class="text-gold">{{ auth.user?.firstName || auth.user?.username }}</span>
      </h1>
      <p class="text-muted-foreground mt-1">Panel de control del Mundial 2026</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <RouterLink
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
        :style="{ animationDelay: link.delay + 'ms' }"
        class="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-gold/5 animate-slide-up"
        :class="link.gradient"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <component :is="link.icon" class="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
        <h3 class="font-semibold text-foreground mb-1">{{ link.title }}</h3>
        <p class="text-sm text-muted-foreground">{{ link.desc }}</p>
      </RouterLink>
    </div>

    <Card class="overflow-hidden">
      <div class="border-b border-border bg-gradient-to-r from-gold/5 to-transparent px-6 py-4">
        <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <ChartLine class="w-5 h-5 text-gold" />
          Mis estadísticas
        </h3>
      </div>
      <CardContent class="p-6">
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="h-24 rounded-xl bg-muted animate-pulse" />
        </div>

        <div v-else-if="!stats" class="text-center py-8 text-muted-foreground">
          No hay estadísticas disponibles
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div
            v-for="s in statCards"
            :key="s.key"
            class="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-gold/30 hover:shadow-sm hover:shadow-gold/5"
          >
            <div class="flex items-center gap-2 mb-3">
              <div :class="s.bg + ' w-8 h-8 rounded-lg flex items-center justify-center'">
                <component :is="s.icon" :class="s.color + ' w-4 h-4'" />
              </div>
            </div>
            <div :class="'text-2xl font-bold ' + s.color">{{ stats[s.key] }}</div>
            <div class="text-xs text-muted-foreground mt-0.5">{{ s.label }}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
