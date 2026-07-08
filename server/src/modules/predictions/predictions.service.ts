import { prisma } from '../../config/prisma.js'
import { createNotification } from '../notifications/notifications.service.js'
import { mapPredictionToDTO } from './mappers/prediction.mapper.js'

export async function upsertPrediction(userId: number, matchId: number, homeScore: number, awayScore: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  })
  if (!match) throw new Error('Match not found')
  if (match.status !== 'scheduled') throw new Error('Match already started or finished')

  const result = await prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    update: { predictedHomeScore: homeScore, predictedAwayScore: awayScore },
    create: { userId, matchId, predictedHomeScore: homeScore, predictedAwayScore: awayScore },
  })

  const homeName = match.homeTeam?.name ?? 'Equipo local'
  const awayName = match.awayTeam?.name ?? 'Equipo visitante'
  await createNotification(userId, 'prediction_saved', `Pronóstico guardado: ${homeName} ${homeScore}-${awayScore} ${awayName}`)

  return result
}

export async function getMyPredictions(userId: number) {
  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: { match: { include: { homeTeam: true, awayTeam: true } } },
    orderBy: { match: { date: 'asc' } },
  })

  return predictions.map(mapPredictionToDTO)
}

function calculatePoints(predictedHome: number, predictedAway: number, actualHome: number, actualAway: number): number {
  if (predictedHome === actualHome && predictedAway === actualAway) return 6  // exact score
  const predDiff = predictedHome - predictedAway
  const actualDiff = actualHome - actualAway
  if (Math.sign(predDiff) === Math.sign(actualDiff) || (predDiff === 0 && actualDiff === 0)) return 3  // correct winner/draw
  return 0
}

export async function calculatePointsForMatch(matchId: number) {
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match || match.status !== 'FT' || match.homeScore === null || match.awayScore === null) return 0

  const predictions = await prisma.prediction.findMany({ where: { matchId } })
  let updated = 0

  for (const pred of predictions) {
    const newPoints = calculatePoints(pred.predictedHomeScore, pred.predictedAwayScore, match.homeScore, match.awayScore)
    const oldPoints = pred.points

    if (newPoints !== oldPoints) {
      await prisma.prediction.update({
        where: { id: pred.id },
        data: { points: newPoints },
      })

      const diff = newPoints - oldPoints
      await prisma.user.update({
        where: { id: pred.userId },
        data: { pointsEarned: { increment: diff } },
      })

      await _updateUserStats(pred.userId)
      updated++
    }
  }

  return updated
}

async function _updateUserStats(userId: number) {
  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: { match: true },
    orderBy: { match: { date: 'asc' } },
  })

  const total = predictions.length
  let exactas = 0
  let correctas = 0
  let currentStreak = 0
  let maxStreak = 0

  for (const p of predictions) {
    if (p.points === 6) {
      exactas++
      currentStreak++
    } else if (p.points === 3) {
      correctas++
      currentStreak++
    } else {
      if (currentStreak > maxStreak) maxStreak = currentStreak
      currentStreak = 0
    }
  }

  if (currentStreak > maxStreak) maxStreak = currentStreak

  const avg = total > 0 ? Math.round((predictions.reduce((sum, p) => sum + p.points, 0) / total) * 100) / 100 : 0

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalPredictions: total,
      exactPredictions: exactas,
      correctWinnerPredictions: correctas,
      currentStreak,
      maxStreak,
      avgPoints: avg,
    },
  })
}

export async function calculateAllPoints(adminUserId?: number) {
  const finished = await prisma.match.findMany({
    where: { status: 'FT', homeScore: { not: null }, awayScore: { not: null } },
  })

  let totalUpdated = 0

  for (const match of finished) {
    const updated = await calculatePointsForMatch(match.id)
    totalUpdated += updated
  }

  if (adminUserId) {
    await createNotification(adminUserId, 'points_recalculated', `Puntos recalculados: ${totalUpdated} predicciones actualizadas`)
  }

  return { updatedPredictions: totalUpdated }
}

export async function getRanking() {
  const users = await prisma.user.findMany({
    orderBy: { pointsEarned: 'desc' },
    select: { id: true, username: true, firstName: true, lastName: true, pointsEarned: true },
  })
  return users.map((u, i) => ({ rank: i + 1, ...u }))
}

export async function getUserPredictions(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, firstName: true, lastName: true, pointsEarned: true },
  })
  if (!user) throw new Error('User not found')

  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: { match: { include: { homeTeam: true, awayTeam: true } } },
    orderBy: { match: { date: 'asc' } },
  })

  return {
    user,
    predictions: predictions.map(mapPredictionToDTO),
  }
}

export async function getAllPredictions(skip = 0, take = 100) {
  const predictions = await prisma.prediction.findMany({
    skip,
    take,
    include: {
      user: { select: { id: true, username: true, firstName: true, lastName: true } },
      match: {
        include: { homeTeam: true, awayTeam: true },
      },
    },
    orderBy: [{ match: { date: 'desc' } }, { user: { username: 'asc' } }],
  })

  const total = await prisma.prediction.count()

  return {
    predictions: predictions.map(mapPredictionToDTO),
    total,
    skip,
    take,
  }
}

export async function getUserStats(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalPredictions: true,
      exactPredictions: true,
      correctWinnerPredictions: true,
      currentStreak: true,
      maxStreak: true,
      avgPoints: true,
    },
  })

  return user ?? { totalPredictions: 0, exactPredictions: 0, correctWinnerPredictions: 0, currentStreak: 0, maxStreak: 0, avgPoints: 0 }
}
