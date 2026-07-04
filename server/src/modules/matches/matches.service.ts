import { prisma } from '../../config/prisma.js'
import { calculatePointsForMatch } from '../predictions/predictions.service.js'
import { createNotification } from '../notifications/notifications.service.js'
import { getIO } from '../../config/socket.js'

function mapMatch(m: any) {
  return {
    id: m.id,
    phase: m.phase,
    round: m.round,
    date: m.date,
    status: m.status,
    homeTeam: m.homeTeam ? { id: m.homeTeam.id, name: m.homeTeam.name, code: m.homeTeam.code } : null,
    awayTeam: m.awayTeam ? { id: m.awayTeam.id, name: m.awayTeam.name, code: m.awayTeam.code } : null,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
  }
}

export async function listMatches(phase?: string) {
  const where: any = {}
  if (phase && phase !== 'all') where.phase = phase

  const matches = await prisma.match.findMany({
    where,
    include: { homeTeam: true, awayTeam: true },
    orderBy: { date: 'asc' },
  })

  return matches.map(mapMatch)
}

export async function createMatch(data: {
  phase: string
  round?: string
  date: string
  homeTeamId: number
  awayTeamId: number
  adminUserId: number
}) {
  const maxApiId = await prisma.match.findFirst({ orderBy: { apiId: 'desc' }, select: { apiId: true } })
  const match = await prisma.match.create({
    data: {
      apiId: (maxApiId?.apiId ?? 0) + 1,
      phase: data.phase,
      round: data.round ?? data.phase.replace(/_/g, ' '),
      date: new Date(data.date),
      status: 'scheduled',
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
    },
    include: { homeTeam: true, awayTeam: true },
  })

  const homeName = match.homeTeam?.name ?? 'Local'
  const awayName = match.awayTeam?.name ?? 'Visitante'
  await createNotification(data.adminUserId, 'match_created', `Partido creado: ${homeName} vs ${awayName}`)

  return mapMatch(match)
}

export async function updateMatch(id: number, data: { homeScore?: number | null; awayScore?: number | null; status?: string; homeTeamId?: number; awayTeamId?: number }, adminUserId?: number) {
  const oldMatch = await prisma.match.findUnique({ where: { id } })

  const match = await prisma.match.update({
    where: { id },
    data: {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      ...(data.status && { status: data.status }),
      ...(data.homeTeamId !== undefined && { homeTeamId: data.homeTeamId }),
      ...(data.awayTeamId !== undefined && { awayTeamId: data.awayTeamId }),
    },
    include: { homeTeam: true, awayTeam: true },
  })

  const becameFt = match.status === 'FT' && match.homeScore !== null && match.awayScore !== null
  const scoreChanged = oldMatch?.homeScore !== match.homeScore || oldMatch?.awayScore !== match.awayScore

  if (becameFt || (match.status === 'FT' && scoreChanged)) {
    await calculatePointsForMatch(match.id)

    const homeName = match.homeTeam?.name ?? 'Local'
    const awayName = match.awayTeam?.name ?? 'Visitante'
    const predictionUsers = await prisma.prediction.findMany({
      where: { matchId: match.id },
      select: { userId: true },
      distinct: ['userId'],
    })

    for (const pu of predictionUsers) {
      await createNotification(pu.userId, 'match_updated', `Resultado actualizado: ${homeName} ${match.homeScore}-${match.awayScore} ${awayName}`)
    }

    if (adminUserId) {
      await createNotification(adminUserId, 'match_updated', `Resultado actualizado: ${homeName} ${match.homeScore}-${match.awayScore} ${awayName}`)
    }

    getIO().emit('ranking_update')
  }

  return mapMatch(match)
}
