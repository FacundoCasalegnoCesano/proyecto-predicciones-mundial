<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PHASES } from '@/constants'
import PhaseTabs from '@/components/PhaseTabs.vue'
import MatchCard from '@/components/MatchCard.vue'
import type { MatchInfo, UserPrediction } from '@/components/MatchCard.vue'
import { Avatar } from '@/components/ui'
import { ArrowLeft } from '@lucide/vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

interface UserInfo {
  id: number
  username: string
  firstName: string | null
  lastName: string | null
  pointsEarned: number
}

const user = ref<UserInfo | null>(null)
const predictions = ref<(UserPrediction & { match: MatchInfo })[]>([])
const loading = ref(true)
const activePhase = ref('group')

const filtered = computed(() => predictions.value.filter((p) => p.match.phase === activePhase.value))

const grouped = computed(() => {
  const groups: Record<string, (UserPrediction & { match: MatchInfo })[]> = {}
  for (const p of filtered.value) {
    const key = p.match.status === 'scheduled' ? 'upcoming' : (p.match.round || 'resultados')
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }
  return groups
})

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

function displayName(u: UserInfo) {
  return u.firstName ? `${u.firstName} ${u.lastName ?? ''}`.trim() : u.username
}
</script>

<template>
  <div class="animate-fade-in">
    <div v-if="user" class="flex items-center gap-4 mb-6">
      <RouterLink to="/standings" class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition p-1.5 rounded-lg hover:bg-accent">
        <ArrowLeft class="w-4 h-4" />
      </RouterLink>
      <Avatar :name="user.firstName || user.username" size="lg" />
      <div>
        <h1 class="text-xl font-bold text-foreground">{{ displayName(user) }}</h1>
        <p class="text-sm text-muted-foreground">@{{ user.username }} · {{ user.pointsEarned }} pts</p>
      </div>
    </div>

    <div class="mb-6">
      <PhaseTabs :phases="PHASES" :active="activePhase" @select="activePhase = $event" />
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-muted animate-pulse" />
    </div>

    <template v-else>
      <div v-if="Object.keys(grouped).length === 0" class="text-center py-16 text-muted-foreground">
        Sin pronósticos en esta fase
      </div>

      <div v-for="(groupPredictions, groupKey) in grouped" :key="groupKey" class="mb-8">
        <h2 class="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
          <span class="w-1 h-4 rounded-full bg-gold" />
          {{ groupKey === 'upcoming' ? 'Próximos' : groupKey }}
        </h2>
        <div class="grid gap-3">
          <MatchCard
            v-for="p in groupPredictions"
            :key="p.id"
            :match="p.match"
            :user-prediction="p"
            :show-prediction-input="false"
            prediction-label="Pronosticó"
          />
        </div>
      </div>
    </template>
  </div>
</template>
