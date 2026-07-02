<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

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

function flagUrl(code: string | null) {
  if (!code) return ''
  return `https://flagcdn.com/w40/${code.toLowerCase().replace('gb-', 'gb-')}.png`
}

async function fetchMatches() {
  loading.value = true
  const res = await fetch('/api/matches')
  matches.value = await res.json()
  loading.value = false
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

onMounted(fetchMatches)
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
            <div class="flex items-center gap-3 w-[30%] justify-end">
              <span class="text-sm text-gray-200 font-medium truncate">{{ m.homeTeam?.name ?? 'Pendiente' }}</span>
              <img v-if="m.homeTeam?.code" :src="flagUrl(m.homeTeam.code)" class="w-5 h-auto rounded-sm" :alt="m.homeTeam?.name ?? ''" />
            </div>

            <div class="flex items-center gap-4 w-[30%] justify-center">
              <template v-if="m.status === 'scheduled'">
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

            <div class="flex items-center gap-3 w-[30%]">
              <img v-if="m.awayTeam?.code" :src="flagUrl(m.awayTeam.code)" class="w-5 h-auto rounded-sm" :alt="m.awayTeam?.name ?? ''" />
              <span class="text-sm text-gray-200 font-medium truncate">{{ m.awayTeam?.name ?? 'Pendiente' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
