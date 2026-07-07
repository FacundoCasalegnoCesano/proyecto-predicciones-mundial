<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { Plus, Save, RefreshCw, Check, Swords } from '@lucide/vue'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { connectSocket } from '@/services/socket'

const auth = useAuthStore()

interface Team { id: number; name: string; code: string | null }
interface Match {
  id: number; phase: string; round: string | null; date: string; status: string
  homeTeam: Team | null; awayTeam: Team | null
  homeScore: number | null; awayScore: number | null
  homeTeamId: number | null; awayTeamId: number | null
}

const teams = ref<Team[]>([])
const matches = ref<Match[]>([])
const loading = ref(true)
const saving = ref<Set<number>>(new Set())
const activePhase = ref('group')
const showForm = ref(false)

const phases = [
  { key: 'group', label: 'Fase de Grupos' },
  { key: 'round_of_32', label: '32avos' },
  { key: 'round_of_16', label: 'Octavos' },
  { key: 'quarter_final', label: 'Cuartos' },
  { key: 'semi_final', label: 'Semis' },
  { key: 'third_place', label: '3er Puesto' },
  { key: 'final', label: 'Final' },
]

const newMatch = ref({ date: '', homeTeamId: 0, awayTeamId: 0 })

const filtered = computed(() => matches.value.filter((m) => m.phase === activePhase.value))

async function fetchData() {
  loading.value = true
  const [mRes, tRes] = await Promise.all([
    fetch('/api/matches'),
    fetch('/api/teams'),
  ])
  matches.value = await mRes.json()
  teams.value = await tRes.json()
  loading.value = false
}

async function saveScore(m: Match) {
  if (m.homeScore === null || m.awayScore === null) return
  saving.value.add(m.id)
  const res = await fetch(`/api/matches/${m.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({ homeScore: m.homeScore, awayScore: m.awayScore, status: 'FT' }),
  })
  if (res.ok) toast.success('Resultado guardado')
  else toast.error('Error al guardar')
  saving.value.delete(m.id)
}

async function assignTeams(m: Match) {
  if (!m.homeTeam || !m.awayTeam) return
  saving.value.add(m.id)
  const res = await fetch(`/api/matches/${m.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({
      homeTeamId: (m.homeTeam as Team).id,
      awayTeamId: (m.awayTeam as Team).id,
    }),
  })
  if (res.ok) toast.success('Equipos asignados')
  else toast.error('Error al asignar')
  saving.value.delete(m.id)
}

async function createMatch() {
  const body = { date: newMatch.value.date, phase: activePhase.value, homeTeamId: newMatch.value.homeTeamId, awayTeamId: newMatch.value.awayTeamId }
  const res = await fetch('/api/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify(body),
  })
  if (res.ok) { toast.success('Partido creado'); showForm.value = false; newMatch.value = { date: '', homeTeamId: 0, awayTeamId: 0 }; fetchData() }
  else toast.error('Error al crear')
}

function onPhaseChange(key: string) { activePhase.value = key; showForm.value = false }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

onMounted(fetchData)
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Admin Partidos</h1>
        <p class="text-sm text-muted-foreground mt-1">Gestioná los partidos del Mundial</p>
      </div>
      <RouterLink to="/admin"><Button variant="outline" size="sm"><Swords class="w-4 h-4" /> Usuarios</Button></RouterLink>
    </div>

    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="p in phases" :key="p.key"
        @click="onPhaseChange(p.key)"
        :class="activePhase === p.key ? 'bg-gold text-pitch font-semibold ring-2 ring-gold/30' : 'bg-card text-muted-foreground hover:text-foreground border border-border'"
        class="px-4 py-2 rounded-lg text-sm transition-[color,background-color,border-color] duration-200 cursor-pointer"
      >
        {{ p.label }}
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-muted animate-pulse" />
    </div>

    <template v-else>
      <div v-if="activePhase !== 'group'" class="mb-4">
        <Button :variant="showForm ? 'destructive' : 'gold'" size="sm" @click="showForm = !showForm">
          <Plus class="w-4 h-4" /> {{ showForm ? 'Cancelar' : 'Nuevo partido' }}
        </Button>

        <Transition name="slide">
          <Card v-if="showForm" class="mt-4">
            <CardContent class="p-5 flex flex-wrap gap-4 items-end">
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">Fecha y hora</label>
                <input v-model="newMatch.date" type="datetime-local" class="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">Local</label>
                <select v-model.number="newMatch.homeTeamId" class="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[180px]">
                  <option :value="0" disabled>Seleccionar equipo</option>
                  <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">Visitante</label>
                <select v-model.number="newMatch.awayTeamId" class="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[180px]">
                  <option :value="0" disabled>Seleccionar equipo</option>
                  <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
              <Button @click="createMatch" :disabled="!newMatch.date || !newMatch.homeTeamId || !newMatch.awayTeamId || newMatch.homeTeamId === newMatch.awayTeamId">
                <Check class="w-4 h-4" /> Crear partido
              </Button>
            </CardContent>
          </Card>
        </Transition>
      </div>

      <div v-if="filtered.length === 0 && activePhase !== 'group'" class="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        No hay partidos en esta fase. Crea uno nuevo.
      </div>

      <div v-else class="space-y-2">
        <Card v-for="m in filtered" :key="m.id" class="transition-[border-color,box-shadow] duration-200 hover:border-gold/20">
          <div class="px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-center gap-3">
            <div class="flex items-center gap-3 w-full sm:w-[28%] justify-center sm:justify-end">
              <template v-if="m.homeTeam">
                <span class="text-sm text-foreground font-medium truncate">{{ m.homeTeam.name }}</span>
                <span v-if="m.homeTeam.code" :class="'fi fi-' + m.homeTeam.code + ' text-lg leading-none'"></span>
              </template>
              <select v-else v-model="m.homeTeam" class="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]">
                <option :value="null" disabled>Local...</option>
                <option v-for="t in teams" :key="t.id" :value="t">{{ t.name }}</option>
              </select>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-[34%] justify-center">
              <template v-if="!m.homeTeam || !m.awayTeam">
                <Button size="sm" variant="gold" @click="assignTeams(m)" :disabled="saving.has(m.id) || !m.homeTeam || !m.awayTeam">
                  {{ saving.has(m.id) ? '...' : 'Asignar equipos' }}
                </Button>
              </template>
              <template v-else>
                <div class="text-xs text-muted-foreground mr-2">{{ formatDate(m.date) }}</div>
                <div class="flex items-center gap-2">
                  <input v-model.number="m.homeScore" type="number" min="0" max="20" class="w-12 text-center h-9 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <span class="text-muted-foreground">-</span>
                  <input v-model.number="m.awayScore" type="number" min="0" max="20" class="w-12 text-center h-9 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <Button size="sm" variant="gold" @click="saveScore(m)" :disabled="saving.has(m.id) || m.homeScore === null || m.awayScore === null">
                  <Save v-if="!saving.has(m.id)" class="w-3 h-3" />
                  {{ saving.has(m.id) ? '...' : 'Guardar' }}
                </Button>
              </template>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-[28%] justify-center sm:justify-start">
              <template v-if="m.awayTeam">
                <span v-if="m.awayTeam.code" :class="'fi fi-' + m.awayTeam.code + ' text-lg leading-none'"></span>
                <span class="text-sm text-foreground font-medium truncate">{{ m.awayTeam.name }}</span>
              </template>
              <select v-else v-model="m.awayTeam" class="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]">
                <option :value="null" disabled>Visitante...</option>
                <option v-for="t in teams" :key="t.id" :value="t">{{ t.name }}</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease-out;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
