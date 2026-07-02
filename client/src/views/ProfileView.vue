<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const username = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const error = ref('')
const success = ref('')

onMounted(() => {
  if (!auth.token) { router.push('/login'); return }
  auth.fetchProfile().then(() => {
    firstName.value = auth.user?.firstName || ''
    lastName.value = auth.user?.lastName || ''
    email.value = auth.user?.email || ''
    username.value = auth.user?.username || ''
  })
})

async function saveProfile() {
  error.value = ''
  success.value = ''
  try {
    await auth.updateProfile({ firstName: firstName.value, lastName: lastName.value, email: email.value, username: username.value })
    success.value = 'Perfil actualizado'
  } catch (e: any) {
    error.value = e.message
  }
}

async function savePassword() {
  error.value = ''
  success.value = ''
  if (!currentPassword.value || !newPassword.value) { error.value = 'Completá ambos campos'; return }
  try {
    await auth.changePassword(currentPassword.value, newPassword.value)
    success.value = 'Contraseña cambiada'
    currentPassword.value = ''
    newPassword.value = ''
  } catch (e: any) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto space-y-8">
    <h1 class="text-2xl font-bold text-gold">Mi perfil</h1>

    <p v-if="error" class="text-sm text-red-400 bg-red-900/30 rounded-lg px-3 py-2">{{ error }}</p>
    <p v-if="success" class="text-sm text-green-400 bg-green-900/30 rounded-lg px-3 py-2">{{ success }}</p>

    <form @submit.prevent="saveProfile" class="bg-pitch-light rounded-xl border border-pitch-lighter p-6 space-y-4">
      <h2 class="text-lg font-semibold text-gray-200">Información personal</h2>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-sm text-gray-400">Nombre</label>
          <input v-model="firstName" class="w-full px-3 py-2 bg-pitch border border-pitch-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold" />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-400">Apellido</label>
          <input v-model="lastName" class="w-full px-3 py-2 bg-pitch border border-pitch-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold" />
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-sm text-gray-400">Usuario</label>
        <input v-model="username" class="w-full px-3 py-2 bg-pitch border border-pitch-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold" />
      </div>

      <div class="space-y-1">
        <label class="text-sm text-gray-400">Email</label>
        <input v-model="email" type="email" class="w-full px-3 py-2 bg-pitch border border-pitch-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold" />
      </div>

      <button type="submit" class="w-full py-2 bg-gold hover:bg-gold-light text-pitch font-bold rounded-lg transition cursor-pointer">Guardar cambios</button>
    </form>

    <form @submit.prevent="savePassword" class="bg-pitch-light rounded-xl border border-pitch-lighter p-6 space-y-4">
      <h2 class="text-lg font-semibold text-gray-200">Cambiar contraseña</h2>

      <div class="space-y-1">
        <label class="text-sm text-gray-400">Contraseña actual</label>
        <input v-model="currentPassword" type="password" class="w-full px-3 py-2 bg-pitch border border-pitch-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold" />
      </div>

      <div class="space-y-1">
        <label class="text-sm text-gray-400">Nueva contraseña</label>
        <input v-model="newPassword" type="password" minlength="6" class="w-full px-3 py-2 bg-pitch border border-pitch-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold" />
      </div>

      <button type="submit" class="w-full py-2 bg-pitch-lighter hover:bg-pitch-lighter/80 text-gray-200 rounded-lg transition cursor-pointer">Cambiar contraseña</button>
    </form>
  </div>
</template>
