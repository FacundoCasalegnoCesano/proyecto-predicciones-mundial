<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { connectSocket, disconnectSocket } from '@/services/socket'
import { Toaster } from 'vue-sonner'
import { Menu, X, Trophy, LogIn, UserPlus, LayoutDashboard, Swords, UserCog, LogOut, Shield } from '@lucide/vue'
import { cn } from '@/lib/utils'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)

interface NavLink {
  to: string
  label: string
  icon?: any
  divider?: boolean
  show: () => boolean
}

const links = computed<NavLink[]>(() => [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: () => !!auth.token },
  { to: '/predictions', label: 'Partidos', icon: Swords, show: () => true },
  { to: '/standings', label: 'Posiciones', icon: Trophy, show: () => true },
  { to: '/profile', label: 'Perfil', icon: UserCog, show: () => !!auth.token },
  { to: '/admin', label: 'Admin', icon: Shield, show: () => auth.user?.role === 'ADMIN' },
  { to: '', label: '', icon: undefined, divider: true, show: () => !!auth.token },
  { to: '/login', label: 'Iniciar sesión', icon: LogIn, show: () => !auth.token },
  { to: '/register', label: 'Registrarse', icon: UserPlus, show: () => !auth.token },
])

const visibleLinks = computed(() => links.value.filter(l => l.show()))

onMounted(() => {
  const socket = connectSocket()
  socket.on('notification', () => {})
})

onUnmounted(() => {
  const socket = connectSocket()
  socket.off('notification')
  disconnectSocket()
})

function closeMenu() { menuOpen.value = false }

function isActive(to: string) {
  if (!to) return false
  if (to === '/dashboard') return route.path === '/'
  if (to === '/predictions') return route.path === '/predictions' || route.path === '/matches'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <Toaster position="bottom-right" rich-colors closeButton theme="dark" />
    <header class="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/80">
      <nav class="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
        <RouterLink to="/" class="font-semibold text-sm sm:text-base tracking-wide text-gold hover:text-gold-light transition shrink-0 flex items-center gap-2">
          <Trophy class="w-5 h-5" />
          <span class="hidden sm:inline">Prode Mundial 2026</span>
        </RouterLink>

        <button
          @click="menuOpen = !menuOpen"
          class="sm:hidden ml-auto text-muted-foreground hover:text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-accent transition"
          aria-label="Menú de navegación"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
        >
          <Menu v-if="!menuOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>

        <div class="hidden sm:flex items-center gap-0.5 ml-auto">
          <template v-for="l in visibleLinks" :key="l.to || '_divider'">
            <div v-if="l.divider" class="w-px h-5 bg-border mx-1.5" />
            <RouterLink
              v-else
              :to="l.to"
              :class="cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition cursor-pointer',
                isActive(l.to)
                  ? 'text-gold bg-gold/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition cursor-pointer text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/15 ml-1"
          >
            <LogOut class="w-4 h-4" />
            <span class="hidden lg:inline">Salir</span>
          </a>
        </div>
      </nav>

      <Transition name="mobile-menu">
        <div
          v-if="menuOpen"
          id="mobile-menu"
          role="navigation"
          aria-label="Menú principal"
          class="sm:hidden border-t border-border overflow-hidden"
        >
          <div class="px-4 py-3 flex flex-col gap-1 bg-card">
            <template v-for="l in visibleLinks" :key="l.to || '_divider'">
              <div v-if="l.divider" class="w-full h-px bg-border my-1" />
              <RouterLink
                v-else
                :to="l.to"
                @click="closeMenu"
                :class="cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition',
                  isActive(l.to)
                    ? 'text-gold bg-gold/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )"
              >
                <component :is="l.icon" v-if="l.icon" class="w-4 h-4" />
                {{ l.label }}
              </RouterLink>
            </template>
            <a
              v-if="auth.token"
              href="#"
              @click.prevent="auth.logout(); router.push('/login'); menuOpen = false"
              class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/15"
            >
              <LogOut class="w-4 h-4" />
              Cerrar sesión
            </a>
          </div>
        </div>
      </Transition>
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
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
