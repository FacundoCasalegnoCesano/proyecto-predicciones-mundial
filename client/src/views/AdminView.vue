<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Search, Shield, Swords, ChartLine } from '@lucide/vue'
import { Button, Card, CardContent, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui'

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
  if (res.status === 403) { router.push('/dashboard'); return }
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
  <div class="animate-fade-in">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Panel Admin</h1>
        <p class="text-sm text-muted-foreground mt-1">Gestión de usuarios del sistema</p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink to="/admin/predictions">
          <Button variant="outline" size="sm"><ChartLine class="w-4 h-4" /> Pronósticos</Button>
        </RouterLink>
        <RouterLink to="/admin/matches">
          <Button variant="outline" size="sm"><Swords class="w-4 h-4" /> Partidos</Button>
        </RouterLink>
      </div>
    </div>

    <Card>
      <div class="border-b border-border px-4 sm:px-6 py-3 flex items-center gap-3">
        <div class="relative flex-1 max-w-xs">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="search"
            @input="fetchUsers"
            placeholder="Buscar usuario..."
            class="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <CardContent class="p-0">
        <div v-if="loading" class="p-8 text-center text-muted-foreground animate-pulse">Cargando usuarios...</div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead class="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="u in users" :key="u.id">
              <TableCell class="text-muted-foreground">{{ u.id }}</TableCell>
              <TableCell class="font-medium text-foreground">{{ u.username }}</TableCell>
              <TableCell class="text-muted-foreground">{{ u.email }}</TableCell>
              <TableCell class="text-muted-foreground">{{ u.firstName || '' }} {{ u.lastName || '' }}</TableCell>
              <TableCell>
                <Badge :variant="u.role === 'ADMIN' ? 'gold' : 'secondary'">{{ u.role }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  :variant="u.role === 'ADMIN' ? 'destructive' : 'outline'"
                  size="sm"
                  @click="toggleRole(u.id, u.role)"
                >
                  <Shield class="w-3 h-3" />
                  {{ u.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin' }}
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="users.length === 0">
              <TableCell colspan="6" class="text-center py-8 text-muted-foreground">No hay usuarios</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
