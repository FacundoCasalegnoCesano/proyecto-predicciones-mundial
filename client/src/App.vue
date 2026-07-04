<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { connectSocket, disconnectSocket } from '@/services/socket'
import { Toaster } from 'vue-sonner'
import { Menu, X, Trophy, LogIn, UserPlus, LayoutDashboard, Swords, UserCog, LogOut } from '@lucide/vue'
import { cn } from '@/lib/utils'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

onMounted(() => {
  const socket = connectSocket()
  socket.on('notification', () => {})
})

onUnmounted(() => {
  const socket = connectSocket()
  socket.off('notification')
  disconnectSocket()
})

function navLinks() {
  const links: { to: string; label: string; icon?: any; auth?: boolean; admin?: boolean; guest?: boolean; divider?: boolean }[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, auth: true },
    { to: '/matches', label: 'Partidos', icon: Swords, auth: true },
    { to: '/standings', label: 'Posiciones', icon: Trophy },
    { to: '/profile', label: 'Perfil', icon: UserCog, auth: true },
    { to: '/admin', label: 'Admin', icon: UserCog, auth: true, admin: true },
    { divider: true, to: '_divider', label: '', auth: true },
    { to: '/login', label: 'Iniciar sesión', icon: LogIn, guest: true },
    { to: '/register', label: 'Registrarse', icon: UserPlus, guest: true },
  ]
  return links.filter((l) => {
    if (l.divider) return auth.token
    if (l.auth && !auth.token) return false
    if (l.admin && auth.user?.role !== 'ADMIN') return false
    if (l.guest && auth.token) return false
    return true
  })
}

function closeMenu() { menuOpen.value = false }
</script>

<template>
  <div class="min-h-screen bg-background">
    <Toaster position="bottom-right" rich-colors />
    <header class="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/80">
      <nav class="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2 sm:gap-6">
        <RouterLink to="/" class="font-bold text-sm sm:text-lg tracking-wide text-gold hover:text-gold-light transition shrink-0 flex items-center gap-2">
          <Trophy class="w-5 h-5" />
          <span class="hidden sm:inline">Mundial Predictions</span>
        </RouterLink>

        <button @click="menuOpen = !menuOpen" class="sm:hidden ml-auto text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg hover:bg-accent transition" aria-label="Menu">
          <Menu v-if="!menuOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>

        <div class="hidden sm:flex items-center gap-1 ml-auto">
          <template v-for="l in navLinks()" :key="l.to">
            <div v-if="l.divider" class="w-px h-5 bg-border mx-2" />
            <RouterLink
              v-else
              :to="l.to!"
              :class="cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition cursor-pointer',
                'text-muted-foreground hover:text-foreground hover:bg-accent'
              )"
            >
              <component :is="l.icon" v-if="l.icon" class="w-4 h-4" />
              {{ l.label }}
            </RouterLink>
          </template>
          <a
            v-if="auth.token"
            href="#"
            @click.prevent="auth.logout(); router.push('/login')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition cursor-pointer text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/20"
          >
            <LogOut class="w-4 h-4" />
            Salir
          </a>
        </div>
      </nav>

      <div
        v-if="menuOpen"
        class="sm:hidden border-t border-border px-4 py-3 flex flex-col gap-1 bg-card animate-fade-in"
      >
        <template v-for="l in navLinks()" :key="l.to">
          <div v-if="l.divider" class="w-full h-px bg-border my-1" />
          <RouterLink
            v-else
            :to="l.to!"
            @click="closeMenu"
            :class="cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition',
              'text-muted-foreground hover:text-foreground hover:bg-accent'
            )"
          >
            <component :is="l.icon" v-if="l.icon" class="w-4 h-4" />
            {{ l.label }}
          </RouterLink>
        </template>
        <a
          v-if="auth.token"
          href="#"
          @click.prevent="auth.logout(); router.push('/login')"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/20"
        >
          <LogOut class="w-4 h-4" />
          Salir
        </a>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.page-enter-active, .page-leave-active {
  transition: all 0.2s ease-out;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
