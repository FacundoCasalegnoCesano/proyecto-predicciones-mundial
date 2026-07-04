<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value }),
  })
  if (res.ok) {
    sent.value = true
  } else {
    const data = await res.json()
    error.value = data.error || 'Error al enviar el email'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12">
    <h1 class="text-2xl font-bold text-gold mb-6 text-center">Recuperar contraseña</h1>

    <div v-if="sent" class="bg-pitch-light border border-pitch-lighter rounded-xl p-6 text-center">
      <p class="text-gray-300">Si existe una cuenta con ese email, recibirás un link de recuperación.</p>
      <RouterLink to="/login" class="inline-block mt-4 text-sm text-gold hover:underline">Volver al login</RouterLink>
    </div>

    <form v-else @submit.prevent="submit" class="bg-pitch-light border border-pitch-lighter rounded-xl p-6 space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">Email</label>
        <input
          v-model="email"
          type="email"
          required
          placeholder="tu@email.com"
          class="w-full bg-pitch border border-pitch-lighter rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

      <button
        type="submit"
        class="w-full py-2.5 rounded-lg bg-gold text-pitch font-semibold text-sm hover:bg-gold-light transition cursor-pointer"
      >
        Enviar link
      </button>

      <p class="text-center text-sm text-gray-500">
        <RouterLink to="/login" class="text-gold hover:underline">Volver al login</RouterLink>
      </p>
    </form>
  </div>
</template>
