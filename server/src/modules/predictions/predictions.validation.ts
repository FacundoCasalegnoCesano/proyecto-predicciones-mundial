import { z } from 'zod'

export const upsertPredictionSchema = z.object({
  matchId: z.number().int().positive(),
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
})

export const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
})
