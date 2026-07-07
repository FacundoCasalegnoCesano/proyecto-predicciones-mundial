<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Swords, Trophy, ChartLine, Target, Star, Zap, TrendingUp, Medal, ChevronRight } from '@lucide/vue'
import { Card, CardContent, Skeleton, EmptyState } from '@/components/ui'

const auth = useAuthStore()
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
  { to: '/matches', icon: Swords, title: 'Partidos', desc: 'Resultados y próximos encuentros' },
  { to: '/predictions', icon: ChartLine, title: 'Mis Pronósticos', desc: 'Actualizá tus pronósticos' },
  { to: '/standings', icon: Trophy, title: 'Posiciones', desc: 'Ranking de puntos acumulados' },
]

const statCards = [
  { key: 'totalPredictions', label: 'Pronósticos', icon: Target },
  { key: 'exactPredictions', label: 'Exactos', icon: Star, sub: '6 pts' },
  { key: 'correctWinnerPredictions', label: 'Ganador', icon: Medal, sub: '3 pts' },
  { key: 'currentStreak', label: 'Racha actual', icon: Zap },
  { key: 'maxStreak', label: 'Mejor racha', icon: TrendingUp },
  { key: 'avgPoints', label: 'Promedio pts', icon: ChartLine },
]

function statValue(key: string) {
  const v = stats.value?.[key]
  if (key === 'avgPoints') return Number(v).toFixed(1)
  return v ?? '-'
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
        Bienvenido de vuelta
        <span class="text-gold">{{ auth.user?.firstName || auth.user?.username }}</span>
      </h1>
      <p class="text-muted-foreground mt-1.5 text-sm sm:text-base">
        Seguí los partidos, pronosticá resultados y subí en la tabla de posiciones
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <RouterLink
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
        class="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-pitch-light to-pitch p-5 transition-[border-color,box-shadow,transform] duration-200 hover:border-gold/30 hover:shadow-sm hover:shadow-gold/5 hover:-translate-y-0.5"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        <div class="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <component :is="link.icon" class="w-5 h-5 text-gold" />
        </div>
        <h3 class="font-semibold text-foreground mb-0.5">{{ link.title }}</h3>
        <p class="text-sm text-muted-foreground">{{ link.desc }}</p>
      </RouterLink>
    </div>

    <Card>
      <div class="border-b border-border px-5 sm:px-6 py-4">
        <h3 class="text-base font-semibold text-foreground flex items-center gap-2">
          <ChartLine class="w-4 h-4 text-gold" />
          Mis estadísticas
        </h3>
      </div>
      <CardContent class="p-5 sm:p-6">
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Skeleton v-for="i in 6" :key="i" class="h-24 rounded-xl" />
        </div>

        <EmptyState
          v-else-if="!stats"
          :icon="ChartLine"
          title="No hay estadísticas todavía"
          description="Una vez que empieces a pronosticar, tus estadísticas aparecerán acá"
        />

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div
            v-for="s in statCards"
            :key="s.key"
            class="rounded-xl border border-border p-4 transition-[border-color,box-shadow] duration-200 hover:border-gold/20"
          >
            <div class="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center mb-2.5">
              <component :is="s.icon" class="w-4 h-4 text-gold" />
            </div>
            <div class="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{{ statValue(s.key) }}</div>
            <div class="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              {{ s.label }}
              <span v-if="s.sub" class="text-gold/60">· {{ s.sub }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
