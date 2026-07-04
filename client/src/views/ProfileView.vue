<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { User, Save, KeyRound, UserCircle } from '@lucide/vue'
import { Button, Card, CardContent, Input, Label, Avatar } from '@/components/ui'

const auth = useAuthStore()
const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const username = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const profileLoading = ref(false)
const passwordLoading = ref(false)

onMounted(() => {
  auth.fetchProfile().then(() => {
    firstName.value = auth.user?.firstName || ''
    lastName.value = auth.user?.lastName || ''
    email.value = auth.user?.email || ''
    username.value = auth.user?.username || ''
  })
})

async function saveProfile() {
  profileLoading.value = true
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ firstName: firstName.value, lastName: lastName.value }),
    })
    if (res.ok) { toast.success('Perfil actualizado'); if (auth.user) { auth.user.firstName = firstName.value; auth.user.lastName = lastName.value } }
    else { const d = await res.json(); toast.error(d.error || 'Error') }
  } catch { toast.error('Error de conexión') }
  finally { profileLoading.value = false }
}

async function changePassword() {
  if (!currentPassword.value || !newPassword.value) return
  passwordLoading.value = true
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ currentPassword: currentPassword.value, newPassword: newPassword.value }),
    })
    if (res.ok) { toast.success('Contraseña cambiada'); currentPassword.value = ''; newPassword.value = '' }
    else { const d = await res.json(); toast.error(d.error || 'Error') }
  } catch { toast.error('Error de conexión') }
  finally { passwordLoading.value = false }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <div class="flex items-center gap-4">
      <Avatar :name="auth.user?.firstName || auth.user?.username || '?'" size="lg" />
      <div>
        <h1 class="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p class="text-sm text-muted-foreground">Editá tu información personal</p>
      </div>
    </div>

    <Card>
      <div class="border-b border-border bg-gradient-to-r from-gold/5 to-transparent px-6 py-4 flex items-center gap-2">
        <UserCircle class="w-5 h-5 text-gold" />
        <h3 class="font-semibold text-foreground">Información personal</h3>
      </div>
      <CardContent class="p-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="firstName">Nombre</Label>
            <Input id="firstName" v-model="firstName" type="text" />
          </div>
          <div class="space-y-2">
            <Label for="lastName">Apellido</Label>
            <Input id="lastName" v-model="lastName" type="text" />
          </div>
        </div>
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input id="email" :model-value="email" type="email" disabled class="opacity-60" />
        </div>
        <div class="space-y-2">
          <Label for="username">Usuario</Label>
          <Input id="username" :model-value="username" type="text" disabled class="opacity-60" />
        </div>
        <Button variant="gold" size="sm" :disabled="profileLoading" @click="saveProfile">
          <Save class="w-4 h-4" /> {{ profileLoading ? 'Guardando...' : 'Guardar cambios' }}
        </Button>
      </CardContent>
    </Card>

    <Card>
      <div class="border-b border-border bg-gradient-to-r from-gold/5 to-transparent px-6 py-4 flex items-center gap-2">
        <KeyRound class="w-5 h-5 text-gold" />
        <h3 class="font-semibold text-foreground">Cambiar contraseña</h3>
      </div>
      <CardContent class="p-6 space-y-4">
        <div class="space-y-2">
          <Label for="currentPassword">Contraseña actual</Label>
          <Input id="currentPassword" v-model="currentPassword" type="password" />
        </div>
        <div class="space-y-2">
          <Label for="newPassword">Nueva contraseña</Label>
          <Input id="newPassword" v-model="newPassword" type="password" minlength="8" />
        </div>
        <Button variant="gold" size="sm" :disabled="passwordLoading || !currentPassword || !newPassword" @click="changePassword">
          <KeyRound class="w-4 h-4" /> {{ passwordLoading ? 'Cambiando...' : 'Cambiar contraseña' }}
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
