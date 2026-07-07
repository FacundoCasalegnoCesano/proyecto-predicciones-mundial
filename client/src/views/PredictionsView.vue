<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { connectSocket } from '@/services/socket'
import { toast } from 'vue-sonner'
import { PHASES } from '@/constants'
import PhaseTabs from '@/components/PhaseTabs.vue'
import MatchCard from '@/components/MatchCard.vue'
import type { MatchInfo, UserPrediction } from '@/components/MatchCard.vue'
import { Skeleton, EmptyState } from '@/components/ui'

const auth = useAuthStore()

const matches = ref<MatchInfo[]>([])
const predictionsMap = ref<Record<number, UserPrediction>>({})
const predInputs = ref<Record<number, { home: number | undefined; away: number | undefined }>>({})
const saving = ref<Set<number>>(new Set())
const loading = ref(true)
const activePhase = ref('group')

const filtered = computed(() => matches.value.filter((m) => m.phase === activePhase.value))

const grouped = computed(() => {
  const groups: Record<string, MatchInfo[]> = {}
  for (const m of filtered.value) {
    const key = m.status === 'scheduled' ? 'upcoming' : (m.round || 'resultados')
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  }
  return groups
})

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
    const data = await res.json()
    const map: Record<number, UserPrediction> = {}
    const inputs: Record<number, { home: number | undefined; away: number | undefined }> = {}
    for (const p of data) {
      map[p.matchId] = p
      const match = matches.value.find((m) => m.id === p.matchId)
      if (match && match.status === 'scheduled') {
        inputs[p.matchId] = { home: p.predictedHomeScore, away: p.predictedAwayScore }
      }
    }
    predictionsMap.value = map
    predInputs.value = inputs
  }
}

async function savePrediction(matchId: number) {
  const input = predInputs.value[matchId]
  if (!input || input.home === undefined || input.away === undefined) return
  saving.value.add(matchId)
  const res = await fetch('/api/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({ matchId, homeScore: input.home, awayScore: input.away }),
  })
  if (res.ok) {
    const updated = await res.json()
    predictionsMap.value[matchId] = {
      predictedHomeScore: updated.predictedHomeScore,
      predictedAwayScore: updated.predictedAwayScore,
      points: updated.points,
    }
    toast.success('Pronóstico guardado')
  } else {
    toast.error('Error al guardar el pronóstico')
  }
  saving.value.delete(matchId)
}

function updatePrediction(matchId: number, home: number, away: number) {
  predInputs.value[matchId] = { home, away }
}

function prediction(matchId: number) {
  return predictionsMap.value[matchId]
}

async function loadAll() {
  await fetchMatches()
  await fetchPredictions()
}

onMounted(async () => {
  loading.value = true
  await loadAll()
  loading.value = false
  const socket = connectSocket()
  socket.on('prediction_updated', loadAll)
})

onUnmounted(() => {
  const socket = connectSocket()
  socket.off('prediction_updated', loadAll)
})
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-foreground">{{ auth.token ? 'Mis Pronósticos' : 'Partidos' }}</h1>
      <p class="text-sm text-muted-foreground mt-1">{{ auth.token ? 'Tus predicciones y puntuación' : 'Resultados y próximos encuentros' }}</p>
    </div>

    <div class="mb-6">
      <PhaseTabs :phases="PHASES" :active="activePhase" @select="activePhase = $event" />
    </div>

    <div v-if="loading" class="space-y-3">
      <Skeleton v-for="i in 5" :key="i" class="h-[72px] rounded-xl" />
    </div>

    <template v-else>
      <div v-if="Object.keys(grouped).length === 0">
        <EmptyState title="No hay partidos en esta fase" description="No hay partidos programados para esta fase del torneo" />
      </div>

      <div v-for="(groupMatches, groupKey) in grouped" :key="groupKey" class="mb-8">
        <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-border">
          {{ groupKey === 'upcoming' ? 'Próximos' : groupKey }}
        </h2>

        <div class="grid gap-3">
          <MatchCard
            v-for="m in groupMatches"
            :key="m.id"
            :match="m"
            :prediction-value="m.status === 'scheduled' && auth.token ? predInputs[m.id] : undefined"
            :user-prediction="auth.token ? (prediction(m.id) || null) : null"
            :saving="saving.has(m.id)"
            :show-prediction-input="m.status === 'scheduled' && !!m.homeTeam && !!m.awayTeam && !!auth.token"
            @save="savePrediction"
            @update-prediction="updatePrediction"
          />
        </div>
      </div>
    </template>
  </div>
</template>
