<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

interface Prediction {
  id: number
  userId: number
  matchId: number
  predictedHomeScore: number
  predictedAwayScore: number
  points: number
  user: { id: number; username: string; firstName: string | null; lastName: string | null }
  match: {
    id: number
    phase: string
    date: string
    status: string
    homeTeam: { id: number; name: string; code: string | null } | null
    awayTeam: { id: number; name: string; code: string | null } | null
    homeScore: number | null
    awayScore: number | null
  }
}

const predictions = ref<Prediction[]>([])
const loading = ref(true)
const search = ref('')
const activePhase = ref('')
const recalcLoading = ref(false)

const phases = [
  { key: '', label: 'Todas' },
  { key: 'group', label: 'Fase Grupos' },
  { key: 'round_of_32', label: '32avos' },
  { key: 'round_of_16', label: 'Octavos' },
  { key: 'quarter_final', label: 'Cuartos' },
  { key: 'semi_final', label: 'Semis' },
  { key: 'third_place', label: '3er Puesto' },
  { key: 'final', label: 'Final' },
]

function phaseLabel(key: string) {
  const map: Record<string, string> = {
    group: 'F. Grupos', round_of_32: '32avos', round_of_16: 'Octavos',
    quarter_final: 'Cuartos', semi_final: 'Semis', third_place: '3er Puesto', final: 'Final',
  }
  return map[key] ?? key
}

async function fetchPredictions() {
  loading.value = true
  const res = await fetch('/api/predictions/admin/all', {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  if (res.status === 403) { router.push('/dashboard'); return }
  predictions.value = await res.json()
  loading.value = false
}

async function recalculate() {
  recalcLoading.value = true
  await fetch('/api/predictions/calculate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  recalcLoading.value = false
  await fetchPredictions()
}

const filtered = () => {
  let list = predictions.value
  if (activePhase.value) {
    list = list.filter((p) => p.match.phase === activePhase.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.user.username.toLowerCase().includes(q) ||
        p.user.firstName?.toLowerCase().includes(q) ||
        p.user.lastName?.toLowerCase().includes(q)
    )
  }
  return list
}

onMounted(fetchPredictions)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gold">Admin - Pronósticos</h1>
      <div class="flex items-center gap-3">
        <button
          @click="recalculate"
          :disabled="recalcLoading"
          class="px-4 py-2 rounded-lg bg-gold text-pitch font-semibold text-sm hover:bg-gold-light transition disabled:opacity-40 cursor-pointer"
        >
          {{ recalcLoading ? 'Recalculando...' : 'Recalcular puntos' }}
        </button>
        <RouterLink to="/admin" class="text-sm text-gray-400 hover:text-gold transition">← Usuarios</RouterLink>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in phases"
          :key="p.key"
          @click="activePhase = p.key"
          :class="activePhase === p.key ? 'bg-gold text-pitch font-semibold' : 'bg-pitch-light text-gray-400 hover:text-gold border border-pitch-lighter'"
          class="px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
        >
          {{ p.label }}
        </button>
      </div>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar usuario..."
        class="ml-auto bg-pitch border border-pitch-lighter rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold w-48"
      />
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-600">Cargando...</div>

    <div v-else-if="filtered().length === 0" class="text-center py-12 text-gray-600 border border-dashed border-pitch-lighter rounded-xl">
      No hay pronósticos
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-xs text-gray-500 uppercase tracking-wider">
          <tr class="border-b border-pitch-lighter">
            <th class="text-left py-3 px-3">Usuario</th>
            <th class="text-left py-3 px-3">Partido</th>
            <th class="text-center py-3 px-3">Pronóstico</th>
            <th class="text-center py-3 px-3">Resultado</th>
            <th class="text-center py-3 px-3">Pts</th>
            <th class="text-center py-3 px-3">Fase</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered()" :key="p.id" class="border-b border-pitch-lighter hover:bg-pitch/40">
            <td class="py-3 px-3 text-gray-200 font-medium">
              {{ p.user.firstName ? `${p.user.firstName} ${p.user.lastName ?? ''}` : p.user.username }}
              <span class="text-gray-500 text-xs">@{{ p.user.username }}</span>
            </td>
            <td class="py-3 px-3">
              <span v-if="p.match.homeTeam" class="text-gray-200">{{ p.match.homeTeam.name }}</span>
              <span v-else class="text-gray-500">TBD</span>
              <span class="text-gray-600 mx-1">vs</span>
              <span v-if="p.match.awayTeam" class="text-gray-200">{{ p.match.awayTeam.name }}</span>
              <span v-else class="text-gray-500">TBD</span>
            </td>
            <td class="py-3 px-3 text-center text-gray-200">{{ p.predictedHomeScore }} - {{ p.predictedAwayScore }}</td>
            <td class="py-3 px-3 text-center">
              <template v-if="p.match.status === 'FT'">
                <span class="text-gray-200">{{ p.match.homeScore }} - {{ p.match.awayScore }}</span>
              </template>
              <span v-else class="text-gray-500">-</span>
            </td>
            <td class="py-3 px-3 text-center">
              <span :class="p.points > 0 ? 'text-grass' : 'text-gray-500'">{{ p.points }}</span>
            </td>
            <td class="py-3 px-3 text-center text-gray-500 text-xs">{{ phaseLabel(p.match.phase) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
