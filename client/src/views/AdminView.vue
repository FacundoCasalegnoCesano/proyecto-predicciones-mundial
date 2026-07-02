<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const users = ref<any[]>([])
const search = ref('')
const loading = ref(true)

async function fetchUsers() {
  loading.value = true
  const q = search.value ? `?search=${encodeURIComponent(search.value)}` : ''
  const res = await fetch(`/api/admin/users${q}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  if (res.status === 403) {
    router.push('/dashboard')
    return
  }
  users.value = await res.json()
  loading.value = false
}

async function toggleRole(userId: number, currentRole: string) {
  const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({ role: newRole }),
  })
  if (res.ok) {
    const updated = await res.json()
    const idx = users.value.findIndex((u) => u.id === userId)
    if (idx !== -1) users.value[idx] = updated
    if (userId === auth.user?.id) auth.user.role = newRole
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gold">Usuarios</h1>
      <RouterLink to="/admin/matches" class="text-sm text-gray-400 hover:text-gold border border-pitch-lighter px-3 py-1.5 rounded-lg transition">Gestionar Partidos</RouterLink>
      <input v-model="search" @input="fetchUsers" placeholder="Buscar..." class="bg-pitch border border-pitch-lighter rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 w-64 focus:outline-none focus:ring-2 focus:ring-gold" />
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-600">Cargando...</div>

    <div v-else class="bg-pitch-light rounded-xl border border-pitch-lighter overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-pitch-lighter text-gray-500 text-left">
            <th class="px-4 py-3 font-medium">ID</th>
            <th class="px-4 py-3 font-medium">Usuario</th>
            <th class="px-4 py-3 font-medium">Email</th>
            <th class="px-4 py-3 font-medium">Nombre</th>
            <th class="px-4 py-3 font-medium">Rol</th>
            <th class="px-4 py-3 font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b border-pitch-lighter last:border-0 hover:bg-pitch/50">
            <td class="px-4 py-3 text-gray-400">{{ u.id }}</td>
            <td class="px-4 py-3 text-gray-200 font-medium">{{ u.username }}</td>
            <td class="px-4 py-3 text-gray-400">{{ u.email }}</td>
            <td class="px-4 py-3 text-gray-400">{{ u.firstName || '' }} {{ u.lastName || '' }}</td>
            <td class="px-4 py-3">
              <span :class="u.role === 'ADMIN' ? 'bg-gold/20 text-gold' : 'bg-grass/20 text-grass'" class="px-2 py-0.5 rounded-md text-xs font-medium">{{ u.role }}</span>
            </td>
            <td class="px-4 py-3">
              <button @click="toggleRole(u.id, u.role)" class="text-xs px-3 py-1 rounded-lg border border-pitch-lighter text-gray-400 hover:text-gold hover:border-gold transition cursor-pointer">
                {{ u.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin' }}
              </button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-600">No hay usuarios</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
