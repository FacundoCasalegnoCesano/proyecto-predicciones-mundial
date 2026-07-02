<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { connectSocket, disconnectSocket } from '@/services/socket'

const auth = useAuthStore()

onMounted(() => {
  connectSocket()
})
onUnmounted(() => {
  disconnectSocket()
})
</script>

<template>
  <div class="min-h-screen bg-pitch">
    <header class="bg-pitch-light border-b border-pitch-lighter">
      <nav class="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        <RouterLink to="/" class="font-bold text-lg text-gold tracking-wide">⚽ Mundial Predictions</RouterLink>
        <div class="ml-auto flex items-center gap-4">
          <RouterLink v-if="auth.token" to="/dashboard" class="text-gray-400 hover:text-gold transition text-sm">Dashboard</RouterLink>
          <RouterLink v-if="auth.token" to="/matches" class="text-gray-400 hover:text-gold transition text-sm">Partidos</RouterLink>
          <RouterLink to="/standings" class="text-gray-400 hover:text-gold transition text-sm">Posiciones</RouterLink>
          <RouterLink v-if="auth.token" to="/profile" class="text-gray-400 hover:text-gold transition text-sm">Perfil</RouterLink>
          <RouterLink v-if="auth.user?.role === 'ADMIN'" to="/admin" class="text-gray-400 hover:text-gold transition text-sm">Admin</RouterLink>
          <RouterLink v-if="!auth.token" to="/login" class="text-gray-400 hover:text-gold transition text-sm">Iniciar sesión</RouterLink>
          <RouterLink v-if="!auth.token" to="/register" class="text-gray-400 hover:text-gold transition text-sm">Registrarse</RouterLink>
          <span v-if="auth.token" class="text-gray-600 text-sm">|</span>
          <a v-if="auth.token" href="#" @click.prevent="auth.logout(); $router.push('/login')" class="text-gray-500 hover:text-red-400 transition text-sm">Salir</a>
        </div>
      </nav>
    </header>
    <main class="max-w-5xl mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
