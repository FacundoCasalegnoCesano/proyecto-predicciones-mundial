<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, ArrowLeft, KeyRound, Send, AlertTriangle } from '@lucide/vue'
import { Button, Card, CardContent, Input, Label } from '@/components/ui'

const router = useRouter()
const email = ref('')
const sent = ref(false)
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })
    if (res.ok) sent.value = true
    else { const d = await res.json(); error.value = d.error || 'Error al enviar' }
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
            <KeyRound class="w-7 h-7 text-gold" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">Recuperar contraseña</h1>
          <p class="text-sm text-muted-foreground">Te enviamos un link para restablecerla</p>
        </div>

        <Transition name="shake">
          <div v-if="error" class="text-sm text-destructive-foreground bg-destructive/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            {{ error }}
          </div>
        </Transition>

        <template v-if="sent">
          <div class="text-center space-y-4 py-4 animate-scale-in">
            <div class="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <Send class="w-8 h-8 text-success" />
            </div>
            <p class="text-sm text-muted-foreground">Si el email está registrado, vas a recibir un link para restablecer tu contraseña.</p>
          </div>
          <Button variant="gold" size="lg" class="w-full" @click="router.push('/login')">
            <ArrowLeft class="w-4 h-4" /> Volver al inicio
          </Button>
        </template>

        <template v-else>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="email" type="email" placeholder="tu@email.com" required />
            </div>
            <Button type="submit" variant="gold" size="lg" class="w-full" :disabled="loading">
              <Mail class="w-4 h-4" /> {{ loading ? 'Enviando...' : 'Enviar link' }}
            </Button>
          </form>
          <p class="text-sm text-muted-foreground text-center">
            <RouterLink to="/login" class="text-gold hover:text-gold-light transition">Volver</RouterLink>
          </p>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
