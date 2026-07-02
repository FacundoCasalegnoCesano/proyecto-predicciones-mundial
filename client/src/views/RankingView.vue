<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { connectSocket, disconnectSocket } from '@/services/socket'

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

async function fetchRanking() {
  const res = await fetch('/api/predictions/ranking')
  users.value = await res.json()
  loading.value = false
}

onMounted(() => {
  fetchRanking()
  const socket = connectSocket()
  socket.on('ranking_update', fetchRanking)
  socket.on('prediction_updated', fetchRanking)
})

onUnmounted(() => {
  const socket = connectSocket()
  socket.off('ranking_update', fetchRanking)
  socket.off('prediction_updated', fetchRanking)
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gold mb-6">Tabla de Posiciones</h1>

    <div v-if="loading" class="text-center py-12 text-gray-600">Cargando...</div>

    <div v-else class="bg-pitch-light border border-pitch-lighter rounded-xl overflow-hidden">
      <div class="px-5 py-3 border-b border-pitch-lighter flex items-center text-xs text-gray-500 uppercase tracking-wider font-medium">
        <span class="w-10">#</span>
        <span class="flex-1">Usuario</span>
        <span class="w-20 text-right">Puntos</span>
      </div>

      <RouterLink
        v-for="u in users" :key="u.id"
        :to="`/user/${u.id}/predictions`"
        class="px-5 py-3.5 border-b border-pitch-lighter last:border-0 flex items-center hover:bg-pitch/50 transition cursor-pointer"
      >
        <span class="w-10 text-sm font-bold" :class="u.rank === 1 ? 'text-gold' : u.rank === 2 ? 'text-gray-300' : u.rank === 3 ? 'text-amber-600' : 'text-gray-500'">
          {{ u.rank }}
        </span>
        <div class="flex-1 flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">
            {{ (u.firstName || u.username).charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-sm text-gray-200 font-medium">{{ u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : u.username }}</p>
            <p class="text-xs text-gray-500">@{{ u.username }}</p>
          </div>
        </div>
        <span class="w-20 text-right text-sm font-bold text-gold">{{ u.pointsEarned }}</span>
      </RouterLink>

      <div v-if="users.length === 0" class="text-center py-12 text-gray-600">
        No hay usuarios registrados
      </div>
    </div>
  </div>
</template>
