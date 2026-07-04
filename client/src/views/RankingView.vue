<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { connectSocket, disconnectSocket } from '@/services/socket'
import { Trophy, Medal, Award, RefreshCw } from '@lucide/vue'
import { Card, CardContent, Avatar, Badge } from '@/components/ui'

interface RankingUser {
  rank: number
  id: number
  username: string
  firstName: string | null
  lastName: string | null
  pointsEarned: number
}

const users = ref<RankingUser[]>([])
const loading = ref(true)
const lastUpdate = ref('')

async function fetchRanking() {
  const res = await fetch('/api/predictions/ranking')
  users.value = await res.json()
  lastUpdate.value = new Date().toLocaleTimeString()
  loading.value = false
}

function visible() {
  if (document.visibilityState === 'visible') fetchRanking()
}

onMounted(() => {
  fetchRanking()
  const socket = connectSocket()
  socket.on('ranking_update', fetchRanking)
  socket.on('prediction_updated', fetchRanking)
  document.addEventListener('visibilitychange', visible)
})

onUnmounted(() => {
  const socket = connectSocket()
  socket.off('ranking_update', fetchRanking)
  socket.off('prediction_updated', fetchRanking)
  document.removeEventListener('visibilitychange', visible)
})

function displayName(u: RankingUser) {
  return u.firstName ? `${u.firstName} ${u.lastName ?? ''}`.trim() : u.username
}

function rankIcon(rank: number) {
  if (rank === 1) return Trophy
  if (rank === 2) return Medal
  if (rank === 3) return Award
  return null
}

function rankColor(rank: number) {
  if (rank === 1) return 'text-gold'
  if (rank === 2) return 'text-slate-300'
  if (rank === 3) return 'text-amber-600'
  return 'text-muted-foreground'
}

function rankBadge(rank: number) {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'secondary'
  if (rank === 3) return 'outline'
  return undefined
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Tabla de Posiciones</h1>
        <p class="text-sm text-muted-foreground mt-1">Ranking por puntos acumulados</p>
      </div>
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <RefreshCw class="w-3 h-3" />
        <span v-if="lastUpdate">{{ lastUpdate }}</span>
      </div>
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="space-y-3 p-4">
          <div v-for="i in 5" :key="i" class="h-14 rounded-xl bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>

        <template v-else>
          <div class="hidden sm:flex items-center px-6 py-3 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-medium">
            <span class="w-12">#</span>
            <span class="flex-1">Usuario</span>
            <span class="w-24 text-right">Puntos</span>
          </div>

          <RouterLink
            v-for="u in users"
            :key="u.id"
            :to="`/user/${u.id}/predictions`"
            class="flex items-center px-4 sm:px-6 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-[background-color] duration-200 group"
          >
            <span class="w-8 sm:w-12 flex items-center gap-1">
              <component :is="rankIcon(u.rank)" v-if="rankIcon(u.rank)" :class="rankColor(u.rank) + ' w-4 h-4 sm:w-5 sm:h-5'" />
              <span v-else class="text-sm font-bold text-muted-foreground">{{ u.rank }}</span>
            </span>
            <div class="flex-1 flex items-center gap-3">
              <Avatar :name="u.firstName || u.username" size="sm" />
              <div>
                <p class="text-sm text-foreground font-medium group-hover:text-gold transition-colors">{{ displayName(u) }}</p>
                <p class="text-xs text-muted-foreground">@{{ u.username }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold tabular-nums" :class="rankColor(u.rank)">{{ u.pointsEarned }}</span>
              <Badge v-if="rankBadge(u.rank)" :variant="rankBadge(u.rank) as any" class="text-[10px]">pts</Badge>
            </div>
          </RouterLink>

          <div v-if="users.length === 0" class="text-center py-12 text-muted-foreground">
            No hay usuarios registrados
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
