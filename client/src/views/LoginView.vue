<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

async function handleSubmit() {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[70vh]">
    <form @submit.prevent="handleSubmit" class="w-full max-w-sm bg-pitch-light rounded-xl border border-pitch-lighter p-8 space-y-5">
      <div class="text-center">
        <div class="text-4xl mb-2">🏆</div>
        <h1 class="text-2xl font-bold text-gold">Iniciar sesión</h1>
      </div>

      <p v-if="error" class="text-sm text-red-400 bg-red-900/30 rounded-lg px-3 py-2">{{ error }}</p>

      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-400">Email</label>
        <input v-model="email" type="email" required class="w-full px-3 py-2.5 bg-pitch border border-pitch-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent" />
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-400">Contraseña</label>
        <input v-model="password" type="password" required class="w-full px-3 py-2.5 bg-pitch border border-pitch-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent" />
        <div class="text-right">
          <router-link to="/forgot-password" class="text-xs text-gray-500 hover:text-gold transition">Olvidé mi contraseña</router-link>
        </div>
      </div>

      <button type="submit" class="w-full py-2.5 bg-gold hover:bg-gold-light text-pitch font-bold rounded-lg transition cursor-pointer">Ingresar</button>

      <p class="text-sm text-gray-500 text-center">
        ¿No tenés cuenta?
        <router-link to="/register" class="text-gold hover:text-gold-light transition">Registrate</router-link>
      </p>
    </form>
  </div>
</template>
