<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirm = ref('')
const done = ref(false)
const error = ref('')

const token = route.query['token'] as string

async function submit() {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password: password.value }),
  })
  if (res.ok) {
    done.value = true
  } else {
    const data = await res.json()
    error.value = data.error || 'Error al restablecer la contraseña'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12">
    <h1 class="text-2xl font-bold text-gold mb-6 text-center">Nueva contraseña</h1>

    <div v-if="!token" class="bg-pitch-light border border-pitch-lighter rounded-xl p-6 text-center">
      <p class="text-red-400">Link inválido o expirado.</p>
      <RouterLink to="/forgot-password" class="inline-block mt-4 text-sm text-gold hover:underline">Solicitar nuevo link</RouterLink>
    </div>

    <div v-else-if="done" class="bg-pitch-light border border-pitch-lighter rounded-xl p-6 text-center">
      <p class="text-gray-300">Contraseña actualizada correctamente.</p>
      <RouterLink to="/login" class="inline-block mt-4 text-sm text-gold hover:underline">Iniciar sesión</RouterLink>
    </div>

    <form v-else @submit.prevent="submit" class="bg-pitch-light border border-pitch-lighter rounded-xl p-6 space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">Nueva contraseña</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          placeholder="Mínimo 6 caracteres"
          class="w-full bg-pitch border border-pitch-lighter rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-1">Confirmar contraseña</label>
        <input
          v-model="confirm"
          type="password"
          required
          placeholder="Repetí la contraseña"
          class="w-full bg-pitch border border-pitch-lighter rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

      <button
        type="submit"
        class="w-full py-2.5 rounded-lg bg-gold text-pitch font-semibold text-sm hover:bg-gold-light transition cursor-pointer"
      >
        Restablecer contraseña
      </button>
    </form>
  </div>
</template>
