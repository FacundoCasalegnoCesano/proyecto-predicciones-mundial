<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

interface Team {
  id: number
  name: string
  code: string | null
}

interface Match {
  id: number
  phase: string
  round: string | null
  date: string
  status: string
  homeTeam: Team | null
  awayTeam: Team | null
  homeScore: number | null
  awayScore: number | null
}

interface PredictionData {
  matchId: number
  predictedHomeScore: number
  predictedAwayScore: number
  points: number
}

const matches = ref<Match[]>([])
const predictionsMap = ref<Record<number, PredictionData>>({})
const predInputs = ref<Record<number, { home: number; away: number }>>({})
const saving = ref<Set<number>>(new Set())
const loading = ref(true)
const activePhase = ref('group')

const phases = [
  { key: 'group', label: 'Fase de Grupos' },
  { key: 'round_of_32', label: '32avos' },
  { key: 'round_of_16', label: 'Octavos' },
  { key: 'quarter_final', label: 'Cuartos' },
  { key: 'semi_final', label: 'Semis' },
  { key: 'third_place', label: '3er Puesto' },
  { key: 'final', label: 'Final' },
]

const filtered = computed(() => matches.value.filter((m) => m.phase === activePhase.value))

const grouped = computed(() => {
  const groups: Record<string, Match[]> = {}
  for (const m of filtered.value) {
    if (m.status === 'scheduled') {
      const key = 'upcoming'
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    } else {
      const key = m.round || 'resultados'
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    }
  }
  return groups
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

async function fetchMatches() {
  const res = await fetch('/api/matches')
  matches.value = await res.json()
}

async function fetchPredictions() {
  if (!auth.token) return
  const res = await fetch('/api/predictions/mine', {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  if (res.ok) {
    const data: PredictionData[] = await res.json()
    for (const p of data) {
      predictionsMap.value[p.matchId] = p
    }
    for (const p of data) {
      const match = matches.value.find((m) => m.id === p.matchId)
      if (match && match.status === 'scheduled') {
        predInputs.value[p.matchId] = { home: p.predictedHomeScore, away: p.predictedAwayScore }
      }
    }
  }
}

async function savePrediction(matchId: number) {
  const p = predInputs.value[matchId]
  if (!p || p.home === undefined || p.away === undefined) return
  saving.value.add(matchId)
  const res = await fetch('/api/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({ matchId, homeScore: p.home, awayScore: p.away }),
  })
  if (res.ok) {
    const updated = await res.json()
    predictionsMap.value[matchId] = {
      matchId,
      predictedHomeScore: updated.predictedHomeScore,
      predictedAwayScore: updated.predictedAwayScore,
      points: updated.points,
    }
  }
  saving.value.delete(matchId)
}

function initPred(matchId: number) {
  if (!predInputs.value[matchId]) {
    predInputs.value[matchId] = { home: undefined as any, away: undefined as any }
  }
}

function prediction(matchId: number) {
  return predictionsMap.value[matchId]
}

onMounted(async () => {
  if (!auth.token) { router.push('/login'); return }
  loading.value = true
  await fetchMatches()
  await fetchPredictions()
  loading.value = false
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gold mb-6">Mis Pronósticos</h1>

    <div class="flex flex-wrap gap-2 mb-8">
      <button
        v-for="p in phases"
        :key="p.key"
        @click="activePhase = p.key"
        :class="activePhase === p.key ? 'bg-gold text-pitch font-semibold' : 'bg-pitch-light text-gray-400 hover:text-gold border border-pitch-lighter'"
        class="px-4 py-2 rounded-lg text-sm transition cursor-pointer"
      >
        {{ p.label }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-600">Cargando...</div>

    <template v-else>
      <div v-if="Object.keys(grouped).length === 0" class="text-center py-12 text-gray-600">
        No hay partidos en esta fase
      </div>

      <div v-for="(groupMatches, groupKey) in grouped" :key="groupKey" class="mb-8">
        <h2 v-if="groupKey === 'upcoming'" class="text-sm font-medium text-gold-light mb-3 uppercase tracking-wider">Próximos</h2>
        <h2 v-else class="text-sm font-medium text-gold-light mb-3 uppercase tracking-wider">{{ groupKey }}</h2>

        <div class="grid gap-3">
          <div
            v-for="m in groupMatches"
            :key="m.id"
            class="bg-pitch-light border border-pitch-lighter rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-3 w-[25%] justify-end">
              <span class="text-sm text-gray-200 font-medium truncate">{{ m.homeTeam?.name ?? 'Pendiente' }}</span>
              <span v-if="m.homeTeam?.code" :class="'fi fi-' + m.homeTeam.code + ' text-lg leading-none'"></span>
            </div>

            <div class="flex items-center gap-3 w-[40%] justify-center">
              <!-- Scheduled with both teams known -->
              <template v-if="m.status === 'scheduled' && m.homeTeam && m.awayTeam">
                <div class="flex items-center gap-1">
                  <input
                    :value="predInputs[m.id]?.home ?? ''"
                    @input="initPred(m.id); predInputs[m.id].home = Number(($event.target as HTMLInputElement).value)"
                    type="number" min="0" max="20"
                    placeholder="?"
                    class="w-10 text-center bg-pitch border border-pitch-lighter rounded-lg px-1 py-1 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <span class="text-gray-600 text-xs">-</span>
                  <input
                    :value="predInputs[m.id]?.away ?? ''"
                    @input="initPred(m.id); predInputs[m.id].away = Number(($event.target as HTMLInputElement).value)"
                    type="number" min="0" max="20"
                    placeholder="?"
                    class="w-10 text-center bg-pitch border border-pitch-lighter rounded-lg px-1 py-1 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <button
                  @click="savePrediction(m.id)"
                  :disabled="saving.has(m.id) || predInputs[m.id]?.home === undefined || predInputs[m.id]?.away === undefined"
                  class="ml-2 text-xs px-2 py-1 rounded-lg bg-gold text-pitch font-semibold hover:bg-gold-light transition disabled:opacity-40 cursor-pointer"
                >
                  {{ saving.has(m.id) ? '...' : (prediction(m.id) ? 'Actualizar' : 'Pronosticar') }}
                </button>
                <div class="ml-2 text-xs text-gray-500">{{ formatDate(m.date) }} {{ formatTime(m.date) }}</div>
              </template>

              <!-- Scheduled with TBD teams -->
              <template v-else-if="m.status === 'scheduled'">
                <div class="text-xs text-gray-500">{{ formatDate(m.date) }} {{ formatTime(m.date) }}</div>
              </template>

              <!-- Finished match -->
              <template v-else>
                <div class="flex items-center gap-3">
                  <div class="text-center">
                    <div class="flex items-center gap-2">
                      <span class="text-xl font-bold text-gray-200 min-w-[1.5rem] text-right">{{ m.homeScore }}</span>
                      <span class="text-gray-600 text-sm">-</span>
                      <span class="text-xl font-bold text-gray-200 min-w-[1.5rem]">{{ m.awayScore }}</span>
                    </div>
                  </div>
                  <div v-if="prediction(m.id)" class="border-l border-pitch-lighter pl-3 ml-1">
                    <div class="text-[10px] text-gray-500 uppercase">Tu pronóstico</div>
                    <div class="text-sm font-bold mt-0.5" :class="prediction(m.id).points > 0 ? 'text-grass' : 'text-red-400'">
                      {{ prediction(m.id).predictedHomeScore }} - {{ prediction(m.id).predictedAwayScore }}
                      <span class="ml-1.5 text-xs">({{ prediction(m.id).points }} pts)</span>
                    </div>
                  </div>
                  <div v-else class="border-l border-pitch-lighter pl-3 ml-1">
                    <div class="text-[10px] text-gray-500 uppercase">Pronóstico</div>
                    <div class="text-xs text-gray-500 mt-0.5">Sin pronóstico</div>
                  </div>
                </div>
              </template>
            </div>

            <div class="flex items-center gap-3 w-[25%]">
              <span v-if="m.awayTeam?.code" :class="'fi fi-' + m.awayTeam.code + ' text-lg leading-none'"></span>
              <span class="text-sm text-gray-200 font-medium truncate">{{ m.awayTeam?.name ?? 'Pendiente' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
