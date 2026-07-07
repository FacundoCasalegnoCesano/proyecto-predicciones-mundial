<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Lock, ShieldCheck, ArrowLeft, Save, AlertTriangle } from '@lucide/vue'
import { Button, Card, CardContent, Input, Label } from '@/components/ui'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const done = ref(false)
const token = ref('')

onMounted(() => {
  token.value = (route.query['token'] as string) || ''
  if (!token.value) error.value = 'Token inválido o expirado'
})

async function handleSubmit() {
  error.value = ''
  if (password.value !== confirmPassword.value) { error.value = 'Las contraseñas no coinciden'; return }
  if (password.value.length < 6) { error.value = 'Mínimo 6 caracteres'; return }
  loading.value = true
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, password: password.value }),
    })
    if (res.ok) { done.value = true; toast.success('Contraseña actualizada') }
    else { const d = await res.json(); error.value = d.error || 'Error' }
  } catch { error.value = 'Error de conexión' }
  finally { loading.value = false }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[70vh] animate-fade-in">
    <Card class="w-full max-w-sm">
      <CardContent class="p-8 space-y-6">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 flex items-center justify-center mx-auto ring-2 ring-gold/20">
            <ShieldCheck class="w-7 h-7 text-gold" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">Nueva contraseña</h1>
        </div>

        <Transition name="shake">
          <div v-if="error" class="text-sm text-destructive-foreground bg-destructive/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            {{ error }}
          </div>
        </Transition>

        <template v-if="done">
          <div class="text-center space-y-4 py-4 animate-scale-in">
            <div class="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <ShieldCheck class="w-8 h-8 text-success" />
            </div>
            <p class="text-sm text-muted-foreground">Contraseña actualizada correctamente.</p>
          </div>
          <Button variant="gold" size="lg" class="w-full" @click="router.push('/login')">
            <ArrowLeft class="w-4 h-4" /> Iniciar sesión
          </Button>
        </template>

        <template v-else-if="token">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="password">Nueva contraseña</Label>
              <Input id="password" v-model="password" type="password" placeholder="••••••••" required minlength="8" />
            </div>
            <div class="space-y-2">
              <Label for="confirm">Confirmar contraseña</Label>
              <Input id="confirm" v-model="confirmPassword" type="password" placeholder="••••••••" required minlength="8" />
            </div>
            <Button type="submit" variant="gold" size="lg" class="w-full" :disabled="loading">
              <Save class="w-4 h-4" /> {{ loading ? 'Guardando...' : 'Restablecer' }}
            </Button>
          </form>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
