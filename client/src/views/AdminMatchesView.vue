<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

interface Team {
  id: number
  name: string
  code: string | null
  groupName: string | null
}

interface Match {
  id: number
  phase: string
  round: string | null
  date: string
  status: string
  homeTeam: { id: number; name: string; code: string | null } | null
  awayTeam: { id: number; name: string; code: string | null } | null
  homeScore: number | null
  awayScore: number | null
}

const matches = ref<Match[]>([])
const teams = ref<Team[]>([])
const loading = ref(true)
const saving = ref<Set<number>>(new Set())
const activePhase = ref('group')
const showForm = ref(false)

// New match form
const newMatch = ref({ date: '', homeTeamId: 0, awayTeamId: 0 })

const phases = [
  { key: 'group', label: 'Fase de Grupos' },
  { key: 'round_of_32', label: '32avos' },
  { key: 'round_of_16', label: 'Octavos' },
  { key: 'quarter_final', label: 'Cuartos' },
  { key: 'semi_final', label: 'Semis' },
  { key: 'third_place', label: '3er Puesto' },
  { key: 'final', label: 'Final' },
]

async function fetchMatches() {
  loading.value = true
  const res = await fetch(`/api/matches?phase=${activePhase.value}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  if (res.status === 403) { router.push('/dashboard'); return }
  matches.value = await res.json()
  loading.value = false
}

async function fetchTeams() {
  const res = await fetch('/api/teams')
  teams.value = await res.json()
}

async function assignTeams(m: Match) {
  if (!m.homeTeam || !m.awayTeam) return
  saving.value.add(m.id)
  const body: any = { homeTeamId: m.homeTeam.id, awayTeamId: m.awayTeam.id }
  const res = await fetch(`/api/matches/${m.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify(body),
  })
  if (res.ok) {
    const updated = await res.json()
    const idx = matches.value.findIndex((x) => x.id === m.id)
    if (idx !== -1) matches.value[idx] = updated
  }
  saving.value.delete(m.id)
}

async function saveScore(m: Match) {
  if (m.homeScore === null || m.awayScore === null) return
  saving.value.add(m.id)
  const res = await fetch(`/api/matches/${m.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({ homeScore: m.homeScore, awayScore: m.awayScore, status: 'FT' }),
  })
  if (res.ok) {
    const updated = await res.json()
    const idx = matches.value.findIndex((x) => x.id === m.id)
    if (idx !== -1) matches.value[idx] = updated
  }
  saving.value.delete(m.id)
}

async function createMatch() {
  const m = newMatch.value
  if (!m.date || !m.homeTeamId || !m.awayTeamId) return
  if (m.homeTeamId === m.awayTeamId) return

  const res = await fetch(`/api/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({
      phase: activePhase.value,
      date: new Date(m.date).toISOString(),
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
    }),
  })

  if (res.ok) {
    newMatch.value = { date: '', homeTeamId: 0, awayTeamId: 0 }
    showForm.value = false
    await fetchMatches()
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function onPhaseChange(key: string) {
  activePhase.value = key
  showForm.value = false
  fetchMatches()
}

onMounted(() => { fetchTeams(); fetchMatches() })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gold">Admin - Partidos</h1>
      <RouterLink to="/admin" class="text-sm text-gray-400 hover:text-gold transition">← Usuarios</RouterLink>
    </div>

    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="p in phases"
        :key="p.key"
        @click="onPhaseChange(p.key)"
        :class="activePhase === p.key ? 'bg-gold text-pitch font-semibold' : 'bg-pitch-light text-gray-400 hover:text-gold border border-pitch-lighter'"
        class="px-4 py-2 rounded-lg text-sm transition cursor-pointer"
      >
        {{ p.label }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-600">Cargando...</div>

    <template v-else>
      <!-- Boton crear partido (solo fases de eliminacion) -->
      <div v-if="activePhase !== 'group'" class="mb-4">
        <button
          @click="showForm = !showForm"
          class="px-4 py-2 rounded-lg bg-gold text-pitch font-semibold text-sm hover:bg-gold-light transition cursor-pointer"
        >
          {{ showForm ? 'Cancelar' : '+ Nuevo partido' }}
        </button>

        <div v-if="showForm" class="mt-4 bg-pitch-light border border-pitch-lighter rounded-xl p-5 flex flex-wrap gap-4 items-end">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Fecha y hora</label>
            <input v-model="newMatch.date" type="datetime-local" class="bg-pitch border border-pitch-lighter rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Local</label>
            <select v-model.number="newMatch.homeTeamId" class="bg-pitch border border-pitch-lighter rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold min-w-[180px]">
              <option :value="0" disabled>Seleccionar equipo</option>
              <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Visitante</label>
            <select v-model.number="newMatch.awayTeamId" class="bg-pitch border border-pitch-lighter rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold min-w-[180px]">
              <option :value="0" disabled>Seleccionar equipo</option>
              <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <button
            @click="createMatch"
            :disabled="!newMatch.date || !newMatch.homeTeamId || !newMatch.awayTeamId || newMatch.homeTeamId === newMatch.awayTeamId"
            class="px-5 py-2 rounded-lg bg-grass text-white font-semibold text-sm hover:brightness-110 transition disabled:opacity-40 cursor-pointer"
          >
            Crear partido
          </button>
        </div>
      </div>

      <!-- Lista de partidos -->
      <div v-if="matches.length === 0 && activePhase !== 'group'" class="text-center py-12 text-gray-600 border border-dashed border-pitch-lighter rounded-xl">
        No hay partidos en esta fase. Crea uno nuevo con el botón de arriba.
      </div>

      <div v-else class="space-y-2">
        <div v-for="m in matches" :key="m.id" class="bg-pitch-light border border-pitch-lighter rounded-xl px-5 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 w-[28%] justify-end">
              <template v-if="m.homeTeam">
                <span class="text-sm text-gray-200 font-medium truncate">{{ m.homeTeam.name }}</span>
                <span v-if="m.homeTeam.code" :class="'fi fi-' + m.homeTeam.code + ' text-lg leading-none'"></span>
              </template>
              <template v-else>
                <select v-model="m.homeTeam" class="bg-pitch border border-pitch-lighter rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold min-w-[150px]">
                  <option :value="null" disabled>Local...</option>
                  <option v-for="t in teams" :key="t.id" :value="t">{{ t.name }}</option>
                </select>
              </template>
            </div>

            <div class="flex items-center gap-2 w-[34%] justify-center">
              <template v-if="!m.homeTeam || !m.awayTeam">
                <button
                  @click="assignTeams(m)"
                  :disabled="saving.has(m.id) || !m.homeTeam || !m.awayTeam"
                  class="text-xs px-3 py-1.5 rounded-lg bg-gold text-pitch font-semibold hover:bg-gold-light transition disabled:opacity-40 cursor-pointer"
                >
                  {{ saving.has(m.id) ? '...' : 'Asignar equipos' }}
                </button>
              </template>
              <template v-else>
                <div class="text-xs text-gray-400 mr-2">{{ formatDate(m.date) }}</div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="m.homeScore"
                    type="number" min="0" max="20"
                    class="w-12 text-center bg-pitch border border-pitch-lighter rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <span class="text-gray-600">-</span>
                  <input
                    v-model.number="m.awayScore"
                    type="number" min="0" max="20"
                    class="w-12 text-center bg-pitch border border-pitch-lighter rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <button
                  @click="saveScore(m)"
                  :disabled="saving.has(m.id) || m.homeScore === null || m.awayScore === null"
                  class="ml-2 text-xs px-3 py-1.5 rounded-lg bg-gold text-pitch font-semibold hover:bg-gold-light transition disabled:opacity-40 cursor-pointer"
                >
                  {{ saving.has(m.id) ? '...' : 'Guardar' }}
                </button>
              </template>
            </div>

            <div class="flex items-center gap-3 w-[28%]">
              <template v-if="m.awayTeam">
                <span v-if="m.awayTeam.code" :class="'fi fi-' + m.awayTeam.code + ' text-lg leading-none'"></span>
                <span class="text-sm text-gray-200 font-medium truncate">{{ m.awayTeam.name }}</span>
              </template>
              <template v-else>
                <select v-model="m.awayTeam" class="bg-pitch border border-pitch-lighter rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold min-w-[150px]">
                  <option :value="null" disabled>Visitante...</option>
                  <option v-for="t in teams" :key="t.id" :value="t">{{ t.name }}</option>
                </select>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
