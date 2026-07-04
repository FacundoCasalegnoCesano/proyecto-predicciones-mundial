<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { Search, RefreshCw, ChartLine, Swords } from '@lucide/vue'
import { Button, Card, Badge } from '@/components/ui'

const auth = useAuthStore()
const loading = ref(true)
const predictions = ref<any[]>([])
const search = ref('')
const phaseFilter = ref('all')

const PHASES = [
  { key: 'all', label: 'Todas' },
  { key: 'group', label: 'Grupos' },
  { key: 'round_of_32', label: '32avos' },
  { key: 'round_of_16', label: 'Octavos' },
  { key: 'quarter_final', label: 'Cuartos' },
  { key: 'semi_final', label: 'Semis' },
  { key: 'third_place', label: '3er Puesto' },
  { key: 'final', label: 'Final' },
]

const filtered = computed(() => {
  return predictions.value.filter((p) => {
    const matchPhase = (p.match?.phase || '').toLowerCase()
    const userMatch = `${p.user?.firstName || ''} ${p.user?.lastName || ''} ${p.user?.username || ''}`.toLowerCase()
    const q = search.value.toLowerCase()
    const matchSearch = q === '' || userMatch.includes(q)
    const matchPhaseFilter = phaseFilter.value === 'all' || matchPhase === phaseFilter.value
    return matchSearch && matchPhaseFilter
  })
})

async function fetchPredictions() {
  loading.value = true
  const res = await fetch('/api/predictions/admin/all', {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  if (res.ok) predictions.value = await res.json()
  loading.value = false
}

async function recalculate() {
  const res = await fetch('/api/predictions/calculate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  if (res.ok) { toast.success('Puntos recalculados'); fetchPredictions() }
  else toast.error('Error al recalcular')
}

function phaseLabel(phase: string) {
  return PHASES.find((p) => p.key === phase)?.label || phase
}

onMounted(fetchPredictions)
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Admin Pronósticos</h1>
        <p class="text-sm text-muted-foreground mt-1">Revisá todos los pronósticos del sistema</p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink to="/admin"><Button variant="outline" size="sm"><Swords class="w-4 h-4" /> Usuarios</Button></RouterLink>
        <Button variant="gold" size="sm" @click="recalculate"><RefreshCw class="w-4 h-4" /> Recalcular puntos</Button>
      </div>
    </div>

    <Card class="mb-6">
      <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="relative flex-1 max-w-xs w-full">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input v-model="search" placeholder="Buscar usuario..." class="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in PHASES" :key="p.key"
            @click="phaseFilter = p.key"
            :class="phaseFilter === p.key ? 'bg-gold text-pitch font-semibold' : 'bg-card text-muted-foreground hover:text-foreground border border-border'"
            class="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer"
          >
            {{ p.label }}
          </button>
        </div>
        <span class="text-xs text-muted-foreground whitespace-nowrap">{{ filtered.length }} resultados</span>
      </div>
    </Card>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-12 rounded-xl bg-muted animate-pulse" />
    </div>

    <Card v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-muted-foreground text-left">
              <th class="py-3 px-4 font-medium">Usuario</th>
              <th class="py-3 px-4 font-medium">Partido</th>
              <th class="py-3 px-4 text-center font-medium">Pronóstico</th>
              <th class="py-3 px-4 text-center font-medium">Resultado</th>
              <th class="py-3 px-4 text-center font-medium">Pts</th>
              <th class="py-3 px-4 text-center font-medium">Fase</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id" class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td class="py-3 px-4">
                <span class="text-foreground font-medium">{{ p.user.firstName ? `${p.user.firstName} ${p.user.lastName ?? ''}` : p.user.username }}</span>
                <span class="text-muted-foreground text-xs ml-1">@{{ p.user.username }}</span>
              </td>
              <td class="py-3 px-4 text-foreground">
                <span v-if="p.match?.homeTeam" class="text-foreground">{{ p.match.homeTeam.name }}</span>
                <span v-else class="text-muted-foreground">TBD</span>
                <span class="text-muted-foreground mx-1">vs</span>
                <span v-if="p.match?.awayTeam" class="text-foreground">{{ p.match.awayTeam.name }}</span>
                <span v-else class="text-muted-foreground">TBD</span>
              </td>
              <td class="py-3 px-4 text-center text-foreground tabular-nums">{{ p.predictedHomeScore }} - {{ p.predictedAwayScore }}</td>
              <td class="py-3 px-4 text-center">
                <template v-if="p.match?.status === 'FT'">
                  <span class="text-foreground tabular-nums">{{ p.match.homeScore }} - {{ p.match.awayScore }}</span>
                </template>
                <span v-else class="text-muted-foreground">-</span>
              </td>
              <td class="py-3 px-4 text-center">
                <Badge :variant="p.points > 0 ? 'grass' : 'outline'">{{ p.points }}</Badge>
              </td>
              <td class="py-3 px-4 text-center text-muted-foreground text-xs">{{ phaseLabel(p.match?.phase) }}</td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="text-center py-12 text-muted-foreground">No hay pronósticos</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>
