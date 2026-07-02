<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { connectSocket } from '@/services/socket'

const auth = useAuthStore()

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

const matches = ref<Match[]>([])
const predictions = ref<Record<number, { home: number; away: number }>>({})
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

async function fetchMatches() {
  loading.value = true
  const res = await fetch('/api/matches')
  matches.value = await res.json()
  loading.value = false
}

async function fetchPredictions() {
  if (!auth.token) return
  const res = await fetch('/api/predictions/mine', {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  if (res.ok) {
    const data = await res.json()
    for (const p of data) {
      predictions.value[p.matchId] = { home: p.predictedHomeScore, away: p.predictedAwayScore }
    }
  }
}

async function savePrediction(matchId: number) {
  const p = predictions.value[matchId]
  if (!p || p.home === undefined || p.away === undefined) return
  saving.value.add(matchId)
  await fetch('/api/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({ matchId, homeScore: p.home, awayScore: p.away }),
  })
  saving.value.delete(matchId)
}

function initPred(matchId: number) {
  if (!predictions.value[matchId]) {
    predictions.value[matchId] = { home: undefined as any, away: undefined as any }
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

const onPredictionUpdate = () => { fetchMatches(); fetchPredictions() }

onMounted(() => {
  fetchMatches()
  fetchPredictions()
  const socket = connectSocket()
  socket.on('prediction_updated', onPredictionUpdate)
})

onUnmounted(() => {
  const socket = connectSocket()
  socket.off('prediction_updated', onPredictionUpdate)
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gold mb-6">Partidos</h1>

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
            <div class="flex items-center gap-3 w-[28%] justify-end">
              <span class="text-sm text-gray-200 font-medium truncate">{{ m.homeTeam?.name ?? 'Pendiente' }}</span>
              <span v-if="m.homeTeam?.code" :class="'fi fi-' + m.homeTeam.code + ' text-lg leading-none'"></span>
            </div>

            <div class="flex items-center gap-2 w-[34%] justify-center">
              <template v-if="m.status === 'scheduled' && m.homeTeam && m.awayTeam">
                <template v-if="auth.token">
                  <div class="flex items-center gap-1">
                    <input
                      :value="predictions[m.id]?.home ?? ''"
                      @input="initPred(m.id); predictions[m.id].home = Number(($event.target as HTMLInputElement).value)"
                      type="number" min="0" max="20"
                      placeholder="?"
                      class="w-10 text-center bg-pitch border border-pitch-lighter rounded-lg px-1 py-1 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <span class="text-gray-600 text-xs">-</span>
                    <input
                      :value="predictions[m.id]?.away ?? ''"
                      @input="initPred(m.id); predictions[m.id].away = Number(($event.target as HTMLInputElement).value)"
                      type="number" min="0" max="20"
                      placeholder="?"
                      class="w-10 text-center bg-pitch border border-pitch-lighter rounded-lg px-1 py-1 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                  <button
                    @click="savePrediction(m.id)"
                    :disabled="saving.has(m.id) || predictions[m.id]?.home === undefined || predictions[m.id]?.away === undefined"
                    class="ml-2 text-xs px-2 py-1 rounded-lg bg-gold text-pitch font-semibold hover:bg-gold-light transition disabled:opacity-40 cursor-pointer"
                  >
                    {{ saving.has(m.id) ? '...' : (predictions[m.id]?.home !== undefined ? 'Guardar' : 'Pronosticar') }}
                  </button>
                </template>
                <div v-else class="text-center">
                  <div class="text-xs text-gray-400">{{ formatDate(m.date) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(m.date) }}</div>
                </div>
              </template>
              <template v-else-if="m.status === 'scheduled'">
                <div class="text-center">
                  <div class="text-xs text-gray-400">{{ formatDate(m.date) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(m.date) }}</div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center gap-3">
                  <span class="text-xl font-bold text-gray-200 min-w-[1.5rem] text-right">{{ m.homeScore }}</span>
                  <span class="text-gray-600 text-sm">-</span>
                  <span class="text-xl font-bold text-gray-200 min-w-[1.5rem]">{{ m.awayScore }}</span>
                </div>
              </template>
            </div>

            <div class="flex items-center gap-3 w-[28%]">
              <span v-if="m.awayTeam?.code" :class="'fi fi-' + m.awayTeam.code + ' text-lg leading-none'"></span>
              <span class="text-sm text-gray-200 font-medium truncate">{{ m.awayTeam?.name ?? 'Pendiente' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
