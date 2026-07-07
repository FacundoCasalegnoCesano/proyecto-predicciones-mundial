<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Search, Shield, Swords, ChartLine } from '@lucide/vue'
import { Button, Card, CardContent, Badge, Input, Skeleton, EmptyState, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui'

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

watch(search, () => {
  fetchUsers()
})
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
          <Input
            v-model="search"
            placeholder="Buscar usuario..."
            class="!pl-9 !h-9"
          />
        </div>
      </div>
      <CardContent class="p-0">
        <div v-if="loading" class="space-y-2 p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
        </div>

        <Table v-else-if="users.length > 0">
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
          </TableBody>
        </Table>
        <div v-else-if="!loading" class="py-8">
          <EmptyState title="No hay usuarios" description="No se encontraron usuarios con ese criterio de búsqueda" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
