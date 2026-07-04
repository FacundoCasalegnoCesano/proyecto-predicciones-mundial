<script setup lang="ts">
import { ChevronRight, Clock } from '@lucide/vue'
import { Card } from '@/components/ui'

export interface TeamInfo {
  id: number
  name: string
  code: string | null
}

export interface MatchInfo {
  id: number
  phase: string
  round: string | null
  date: string
  status: string
  homeTeam: TeamInfo | null
  awayTeam: TeamInfo | null
  homeScore: number | null
  awayScore: number | null
}

export interface UserPrediction {
  predictedHomeScore: number
  predictedAwayScore: number
  points: number
  id?: number
  matchId?: number
}

const props = defineProps<{
  match: MatchInfo
  predictionValue?: { home: number | undefined; away: number | undefined }
  userPrediction?: UserPrediction | null
  saving?: boolean
  showPredictionInput?: boolean
  predictionLabel?: string
}>()

const emit = defineEmits<{
  save: [matchId: number]
  updatePrediction: [matchId: number, home: number, away: number]
}>()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

function onHomeInput(e: Event, matchId: number) {
  emit('updatePrediction', matchId, Number((e.target as HTMLInputElement).value), props.predictionValue?.away ?? ('' as any))
}

function onAwayInput(e: Event, matchId: number) {
  emit('updatePrediction', matchId, props.predictionValue?.home ?? ('' as any), Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <Card class="group transition-all duration-200 hover:border-gold/30 hover:shadow-sm hover:shadow-gold/5 animate-slide-up">
    <div class="px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row items-center gap-3">
      <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-[28%] justify-center sm:justify-end min-w-0 order-1 sm:order-none">
        <span class="text-xs sm:text-sm text-foreground font-medium truncate max-w-[120px] sm:max-w-none">{{ match.homeTeam?.name ?? 'Pendiente' }}</span>
        <span v-if="match.homeTeam?.code" :class="'fi fi-' + match.homeTeam.code + ' text-base sm:text-lg leading-none shrink-0'"></span>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-[34%] justify-center shrink-0 order-3 sm:order-none mt-1 sm:mt-0">
        <template v-if="match.status === 'scheduled' && match.homeTeam && match.awayTeam && showPredictionInput">
          <div class="flex items-center gap-1">
            <input
              :value="predictionValue?.home ?? ''"
              @input="onHomeInput($event, match.id)"
              type="number" min="0" max="20" placeholder="?"
              class="w-9 sm:w-10 text-center bg-background border border-border rounded-lg px-1 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            <span class="text-muted-foreground text-xs">-</span>
            <input
              :value="predictionValue?.away ?? ''"
              @input="onAwayInput($event, match.id)"
              type="number" min="0" max="20" placeholder="?"
              class="w-9 sm:w-10 text-center bg-background border border-border rounded-lg px-1 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
          </div>
          <button
            @click="emit('save', match.id)"
            :disabled="saving || predictionValue?.home === undefined || predictionValue?.away === undefined"
            class="ml-1 sm:ml-2 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg bg-gold text-pitch font-semibold hover:bg-gold-light transition-all duration-200 disabled:opacity-40 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            {{ saving ? '...' : (userPrediction ? 'Actualizar' : 'Pronosticar') }}
          </button>
        </template>

        <template v-else-if="match.status === 'scheduled'">
          <div v-if="userPrediction" class="flex items-center gap-2">
            <span class="text-sm font-bold text-gold">{{ userPrediction.predictedHomeScore }}</span>
            <span class="text-muted-foreground text-xs">-</span>
            <span class="text-sm font-bold text-gold">{{ userPrediction.predictedAwayScore }}</span>
            <div class="ml-2 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock class="w-3 h-3" />
              <span>{{ formatDate(match.date) }} {{ formatTime(match.date) }}</span>
            </div>
          </div>
          <div v-else class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock class="w-3.5 h-3.5" />
            <span>{{ formatDate(match.date) }}</span>
            <span>{{ formatTime(match.date) }}</span>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-lg sm:text-2xl font-bold text-foreground min-w-[1.2rem] sm:min-w-[1.5rem] text-right tabular-nums">{{ match.homeScore }}</span>
            <span class="text-muted-foreground text-xs sm:text-sm font-medium">-</span>
            <span class="text-lg sm:text-2xl font-bold text-foreground min-w-[1.2rem] sm:min-w-[1.5rem] tabular-nums">{{ match.awayScore }}</span>
          </div>
          <div v-if="userPrediction" class="border-l border-border pl-2 sm:pl-3 ml-1 sm:ml-1">
            <div class="text-[8px] sm:text-[10px] text-muted-foreground uppercase leading-tight">{{ predictionLabel || 'Tu pronóstico' }}</div>
            <div class="text-xs sm:text-sm font-bold mt-0.5 flex items-center gap-1" :class="userPrediction.points > 0 ? 'text-grass' : 'text-destructive-foreground'">
              <ChevronRight v-if="userPrediction.points > 0" class="w-3 h-3" />
              {{ userPrediction.predictedHomeScore }} - {{ userPrediction.predictedAwayScore }}
              <span class="ml-0.5 text-[10px] sm:text-xs opacity-70">({{ userPrediction.points }} pts)</span>
            </div>
          </div>
        </template>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-[28%] justify-center sm:justify-start min-w-0 order-2 sm:order-none">
        <span v-if="match.awayTeam?.code" :class="'fi fi-' + match.awayTeam.code + ' text-base sm:text-lg leading-none shrink-0'"></span>
        <span class="text-xs sm:text-sm text-foreground font-medium truncate max-w-[120px] sm:max-w-none">{{ match.awayTeam?.name ?? 'Pendiente' }}</span>
      </div>
    </div>
  </Card>
</template>
