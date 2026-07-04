import { z } from 'zod'

export const createMatchSchema = z.object({
  phase: z.enum(['round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final']),
  round: z.string().optional(),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  homeTeamId: z.number().int().positive(),
  awayTeamId: z.number().int().positive(),
})

export const updateMatchSchema = z.object({
  homeScore: z.number().int().min(0).nullable().optional(),
  awayScore: z.number().int().min(0).nullable().optional(),
  homeTeamId: z.number().int().positive().nullable().optional(),
  awayTeamId: z.number().int().positive().nullable().optional(),
  status: z.enum(['scheduled', 'live', 'FT', 'HT', 'PEN']).optional(),
})
