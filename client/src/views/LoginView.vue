<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Trophy, Eye, EyeOff, LogIn, AlertTriangle } from '@lucide/vue'
import { Button, Card, CardContent, Input, Label } from '@/components/ui'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPw = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[70vh] animate-fade-in">
    <Card class="w-full max-w-sm">
      <CardContent class="p-8 space-y-6">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 flex items-center justify-center mx-auto ring-2 ring-gold/20">
            <Trophy class="w-7 h-7 text-gold" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">Iniciar sesión</h1>
          <p class="text-sm text-muted-foreground">Ingresá tus credenciales para continuar</p>
        </div>

        <Transition name="shake">
          <div v-if="error" class="text-sm text-destructive-foreground bg-destructive/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            {{ error }}
          </div>
        </Transition>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="tu@email.com" required />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="password">Contraseña</Label>
              <RouterLink to="/forgot-password" class="text-xs text-gold hover:text-gold-light transition">¿Olvidaste?</RouterLink>
            </div>
            <div class="relative">
              <Input id="password" v-model="password" :type="showPw ? 'text' : 'password'" placeholder="••••••••" required class="pr-10" />
              <button type="button" @click="showPw = !showPw" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5" tabindex="-1">
                <Eye v-if="!showPw" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button type="submit" variant="gold" size="lg" class="w-full" :disabled="loading">
            <LogIn class="w-4 h-4" />
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </Button>
        </form>

        <p class="text-sm text-muted-foreground text-center">
          ¿No tenés cuenta?
          <RouterLink to="/register" class="text-gold hover:text-gold-light transition font-medium">Registrate</RouterLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.shake-enter-active {
  animation: shake 0.3s ease-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}
</style>
