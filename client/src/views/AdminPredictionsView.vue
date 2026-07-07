<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { Search, RefreshCw, Swords } from '@lucide/vue'
import { Button, Card, Badge, Skeleton, EmptyState, Input, Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui'

const router = useRouter()
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
        <Button variant="outline" size="sm" @click="router.push('/admin')"><Swords class="w-4 h-4" /> Usuarios</Button>
        <Button variant="gold" size="sm" @click="recalculate"><RefreshCw class="w-4 h-4" /> Recalcular puntos</Button>
      </div>
    </div>

    <Card class="mb-6">
      <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="relative flex-1 max-w-xs w-full">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="search" placeholder="Buscar usuario..." class="!pl-9 !h-9" />
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in PHASES" :key="p.key"
            @click="phaseFilter = p.key"
            :class="phaseFilter === p.key ? 'bg-gold text-pitch font-semibold' : 'bg-card text-muted-foreground hover:text-foreground border border-border'"
            class="px-3 py-1.5 rounded-lg text-xs transition duration-200 cursor-pointer"
          >
            {{ p.label }}
          </button>
        </div>
        <span class="text-xs text-muted-foreground whitespace-nowrap">{{ filtered.length }} resultados</span>
      </div>
    </Card>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 6" :key="i" class="h-12 rounded-lg" />
    </div>

    <div v-else-if="filtered.length === 0">
      <EmptyState title="No hay pronósticos" description="Ningún usuario ha hecho pronósticos todavía" />
    </div>

    <Card v-else>
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Partido</TableHead>
              <TableHead class="text-center">Pronóstico</TableHead>
              <TableHead class="text-center">Resultado</TableHead>
              <TableHead class="text-center">Pts</TableHead>
              <TableHead class="text-center">Fase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="p in filtered" :key="p.id" class="hover:bg-muted/30">
              <TableCell>
                <span class="text-foreground font-medium">{{ p.user.firstName ? `${p.user.firstName} ${p.user.lastName ?? ''}` : p.user.username }}</span>
                <span class="text-muted-foreground text-xs ml-1">@{{ p.user.username }}</span>
              </TableCell>
              <TableCell>
                <span v-if="p.match?.homeTeam" class="text-foreground">{{ p.match.homeTeam.name }}</span>
                <span v-else class="text-muted-foreground">TBD</span>
                <span class="text-muted-foreground mx-1">vs</span>
                <span v-if="p.match?.awayTeam" class="text-foreground">{{ p.match.awayTeam.name }}</span>
                <span v-else class="text-muted-foreground">TBD</span>
              </TableCell>
              <TableCell class="text-center tabular-nums">{{ p.predictedHomeScore }} - {{ p.predictedAwayScore }}</TableCell>
              <TableCell class="text-center">
                <template v-if="p.match?.status === 'FT'">
                  <span class="tabular-nums">{{ p.match.homeScore }} - {{ p.match.awayScore }}</span>
                </template>
                <span v-else class="text-muted-foreground">-</span>
              </TableCell>
              <TableCell class="text-center">
                <Badge :variant="p.points > 0 ? 'grass' : 'outline'">{{ p.points }}</Badge>
              </TableCell>
              <TableCell class="text-center text-muted-foreground text-xs">{{ phaseLabel(p.match?.phase) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>
