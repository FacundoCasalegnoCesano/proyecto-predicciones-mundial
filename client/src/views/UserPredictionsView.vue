<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
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

interface UserPrediction {
  id: number
  matchId: number
  predictedHomeScore: number
  predictedAwayScore: number
  points: number
  match: Match
}

interface UserInfo {
  id: number
  username: string
  firstName: string | null
  lastName: string | null
  pointsEarned: number
}

const user = ref<UserInfo | null>(null)
const predictions = ref<UserPrediction[]>([])
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

const filtered = computed(() => predictions.value.filter((p) => p.match.phase === activePhase.value))

const grouped = computed(() => {
  const groups: Record<string, UserPrediction[]> = {}
  for (const p of filtered.value) {
    if (p.match.status === 'scheduled') {
      const key = 'upcoming'
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    } else {
      const key = p.match.round || 'resultados'
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
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

onMounted(async () => {
  if (!auth.token) { router.push('/login'); return }
  loading.value = true
  const userId = route.params['userId']
  const res = await fetch(`/api/predictions/user/${userId}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  if (res.ok) {
    const data = await res.json()
    user.value = data.user
    predictions.value = data.predictions
  }
  loading.value = false
})
</script>

<template>
  <div>
    <div v-if="user" class="flex items-center gap-3 mb-6">
      <RouterLink to="/standings" class="text-sm text-gray-400 hover:text-gold transition">← Posiciones</RouterLink>
      <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-sm font-bold text-gold">
        {{ (user.firstName || user.username).charAt(0).toUpperCase() }}
      </div>
      <div>
        <h1 class="text-xl font-bold text-gold">{{ user.firstName ? `${user.firstName} ${user.lastName ?? ''}` : user.username }}</h1>
        <p class="text-xs text-gray-500">@{{ user.username }} · {{ user.pointsEarned }} pts</p>
      </div>
    </div>

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
        Sin pronósticos en esta fase
      </div>

      <div v-for="(groupPredictions, groupKey) in grouped" :key="groupKey" class="mb-8">
        <h2 v-if="groupKey === 'upcoming'" class="text-sm font-medium text-gold-light mb-3 uppercase tracking-wider">Próximos</h2>
        <h2 v-else class="text-sm font-medium text-gold-light mb-3 uppercase tracking-wider">{{ groupKey }}</h2>

        <div class="grid gap-3">
          <div
            v-for="p in groupPredictions"
            :key="p.id"
            class="bg-pitch-light border border-pitch-lighter rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-3 w-[25%] justify-end">
              <span class="text-sm text-gray-200 font-medium truncate">{{ p.match.homeTeam?.name ?? 'Pendiente' }}</span>
              <span v-if="p.match.homeTeam?.code" :class="'fi fi-' + p.match.homeTeam.code + ' text-lg leading-none'"></span>
            </div>

            <div class="flex items-center gap-3 w-[40%] justify-center">
              <!-- Scheduled -->
              <template v-if="p.match.status === 'scheduled'">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gold">{{ p.predictedHomeScore }}</span>
                  <span class="text-gray-600 text-xs">-</span>
                  <span class="text-sm font-bold text-gold">{{ p.predictedAwayScore }}</span>
                </div>
                <div class="ml-2 text-xs text-gray-500">{{ formatDate(p.match.date) }} {{ formatTime(p.match.date) }}</div>
              </template>

              <!-- Finished -->
              <template v-else>
                <div class="flex items-center gap-3">
                  <div class="text-center">
                    <div class="flex items-center gap-2">
                      <span class="text-xl font-bold text-gray-200 min-w-[1.5rem] text-right">{{ p.match.homeScore }}</span>
                      <span class="text-gray-600 text-sm">-</span>
                      <span class="text-xl font-bold text-gray-200 min-w-[1.5rem]">{{ p.match.awayScore }}</span>
                    </div>
                  </div>
                  <div class="border-l border-pitch-lighter pl-3 ml-1">
                    <div class="text-[10px] text-gray-500 uppercase">Pronosticó</div>
                    <div class="text-sm font-bold mt-0.5" :class="p.points > 0 ? 'text-grass' : 'text-red-400'">
                      {{ p.predictedHomeScore }} - {{ p.predictedAwayScore }}
                      <span class="ml-1.5 text-xs">({{ p.points }} pts)</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div class="flex items-center gap-3 w-[25%]">
              <span v-if="p.match.awayTeam?.code" :class="'fi fi-' + p.match.awayTeam.code + ' text-lg leading-none'"></span>
              <span class="text-sm text-gray-200 font-medium truncate">{{ p.match.awayTeam?.name ?? 'Pendiente' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
