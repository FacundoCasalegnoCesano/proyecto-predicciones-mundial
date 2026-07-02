import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

type TeamInput = { name: string; code: string; group: string }

const teamDefs: TeamInput[] = [
  // Group A
  { name: 'México', code: 'mx', group: 'A' },
  { name: 'South Africa', code: 'za', group: 'A' },
  { name: 'South Korea', code: 'kr', group: 'A' },
  { name: 'Czech Republic', code: 'cz', group: 'A' },
  // Group B
  { name: 'Canada', code: 'ca', group: 'B' },
  { name: 'Bosnia and Herzegovina', code: 'ba', group: 'B' },
  { name: 'Qatar', code: 'qa', group: 'B' },
  { name: 'Switzerland', code: 'ch', group: 'B' },
  // Group C
  { name: 'Brazil', code: 'br', group: 'C' },
  { name: 'Morocco', code: 'ma', group: 'C' },
  { name: 'Haiti', code: 'ht', group: 'C' },
  { name: 'Scotland', code: 'gb-sct', group: 'C' },
  // Group D
  { name: 'USA', code: 'us', group: 'D' },
  { name: 'Paraguay', code: 'py', group: 'D' },
  { name: 'Australia', code: 'au', group: 'D' },
  { name: 'Turkey', code: 'tr', group: 'D' },
  // Group E
  { name: 'Germany', code: 'de', group: 'E' },
  { name: 'Curaçao', code: 'cw', group: 'E' },
  { name: 'Ivory Coast', code: 'ci', group: 'E' },
  { name: 'Ecuador', code: 'ec', group: 'E' },
  // Group F
  { name: 'Netherlands', code: 'nl', group: 'F' },
  { name: 'Japan', code: 'jp', group: 'F' },
  { name: 'Sweden', code: 'se', group: 'F' },
  { name: 'Tunisia', code: 'tn', group: 'F' },
  // Group G
  { name: 'Belgium', code: 'be', group: 'G' },
  { name: 'Egypt', code: 'eg', group: 'G' },
  { name: 'Iran', code: 'ir', group: 'G' },
  { name: 'New Zealand', code: 'nz', group: 'G' },
  // Group H
  { name: 'Spain', code: 'es', group: 'H' },
  { name: 'Cape Verde', code: 'cv', group: 'H' },
  { name: 'Saudi Arabia', code: 'sa', group: 'H' },
  { name: 'Uruguay', code: 'uy', group: 'H' },
  // Group I
  { name: 'France', code: 'fr', group: 'I' },
  { name: 'Senegal', code: 'sn', group: 'I' },
  { name: 'Iraq', code: 'iq', group: 'I' },
  { name: 'Norway', code: 'no', group: 'I' },
  // Group J
  { name: 'Argentina', code: 'ar', group: 'J' },
  { name: 'Algeria', code: 'dz', group: 'J' },
  { name: 'Austria', code: 'at', group: 'J' },
  { name: 'Jordan', code: 'jo', group: 'J' },
  // Group K
  { name: 'Portugal', code: 'pt', group: 'K' },
  { name: 'DR Congo', code: 'cd', group: 'K' },
  { name: 'Uzbekistan', code: 'uz', group: 'K' },
  { name: 'Colombia', code: 'co', group: 'K' },
  // Group L
  { name: 'England', code: 'gb-eng', group: 'L' },
  { name: 'Croatia', code: 'hr', group: 'L' },
  { name: 'Ghana', code: 'gh', group: 'L' },
  { name: 'Panama', code: 'pa', group: 'L' },
]

type MatchInput = { day: number; hour: number; home: string; away: string; homeScore?: number; awayScore?: number; penHome?: number; penAway?: number }

const groupMatches: MatchInput[] = [
  // Group A - jueves 11 junio
  { day: 0, hour: 13, home: 'México', away: 'South Africa', homeScore: 2, awayScore: 0 },
  { day: 0, hour: 16, home: 'South Korea', away: 'Czech Republic', homeScore: 2, awayScore: 1 },
  // Group B - viernes 12 junio
  { day: 1, hour: 13, home: 'Canada', away: 'Bosnia and Herzegovina', homeScore: 1, awayScore: 1 },
  // Group D - viernes 12 junio
  { day: 1, hour: 19, home: 'USA', away: 'Paraguay', homeScore: 4, awayScore: 1 },
  // Group B - sábado 13 junio
  { day: 2, hour: 13, home: 'Qatar', away: 'Switzerland', homeScore: 1, awayScore: 1 },
  // Group C - sábado 13 junio
  { day: 2, hour: 16, home: 'Brazil', away: 'Morocco', homeScore: 1, awayScore: 1 },
  { day: 2, hour: 19, home: 'Haiti', away: 'Scotland', homeScore: 0, awayScore: 1 },
  // Group D - domingo 14 junio
  { day: 3, hour: 13, home: 'Australia', away: 'Turkey', homeScore: 2, awayScore: 0 },
  // Group E - domingo 14 junio
  { day: 3, hour: 16, home: 'Germany', away: 'Curaçao', homeScore: 7, awayScore: 1 },
  // Group F - domingo 14 junio
  { day: 3, hour: 19, home: 'Netherlands', away: 'Japan', homeScore: 2, awayScore: 2 },
  // Group E
  { day: 4, hour: 13, home: 'Ivory Coast', away: 'Ecuador', homeScore: 1, awayScore: 0 },
  // Group F
  { day: 4, hour: 16, home: 'Sweden', away: 'Tunisia', homeScore: 5, awayScore: 1 },
  // Group H - lunes 15 junio
  { day: 4, hour: 19, home: 'Spain', away: 'Cape Verde', homeScore: 0, awayScore: 0 },
  // Group G - lunes 15 junio
  { day: 4, hour: 22, home: 'Belgium', away: 'Egypt', homeScore: 1, awayScore: 1 },
  // Group H
  { day: 5, hour: 13, home: 'Saudi Arabia', away: 'Uruguay', homeScore: 1, awayScore: 1 },
  // Group G
  { day: 5, hour: 16, home: 'Iran', away: 'New Zealand', homeScore: 2, awayScore: 2 },
  // Group I - martes 16 junio
  { day: 5, hour: 19, home: 'France', away: 'Senegal', homeScore: 3, awayScore: 1 },
  { day: 5, hour: 22, home: 'Iraq', away: 'Norway', homeScore: 1, awayScore: 4 },
  // Group J
  { day: 6, hour: 13, home: 'Argentina', away: 'Algeria', homeScore: 3, awayScore: 0 },
  // Group J - miércoles 17 junio
  { day: 6, hour: 16, home: 'Austria', away: 'Jordan', homeScore: 3, awayScore: 1 },
  // Group K
  { day: 6, hour: 19, home: 'Portugal', away: 'DR Congo', homeScore: 1, awayScore: 1 },
  // Group L
  { day: 6, hour: 22, home: 'England', away: 'Croatia', homeScore: 4, awayScore: 2 },
  { day: 7, hour: 13, home: 'Ghana', away: 'Panama', homeScore: 1, awayScore: 0 },
  // Group K
  { day: 7, hour: 16, home: 'Uzbekistan', away: 'Colombia', homeScore: 1, awayScore: 3 },
  // Group A - jueves 18 junio
  { day: 7, hour: 19, home: 'Czech Republic', away: 'South Africa', homeScore: 1, awayScore: 1 },
  // Group B
  { day: 7, hour: 22, home: 'Switzerland', away: 'Bosnia and Herzegovina', homeScore: 4, awayScore: 1 },
  { day: 8, hour: 13, home: 'Canada', away: 'Qatar', homeScore: 6, awayScore: 0 },
  { day: 8, hour: 16, home: 'México', away: 'South Korea', homeScore: 1, awayScore: 0 },
  // Group D - viernes 19 junio
  { day: 8, hour: 19, home: 'USA', away: 'Australia', homeScore: 2, awayScore: 0 },
  // Group C
  { day: 8, hour: 22, home: 'Scotland', away: 'Morocco', homeScore: 0, awayScore: 1 },
  { day: 9, hour: 13, home: 'Brazil', away: 'Haiti', homeScore: 3, awayScore: 0 },
  // Group D - sábado 20 junio
  { day: 9, hour: 16, home: 'Turkey', away: 'Paraguay', homeScore: 0, awayScore: 1 },
  // Group F
  { day: 9, hour: 19, home: 'Netherlands', away: 'Sweden', homeScore: 5, awayScore: 1 },
  // Group E
  { day: 9, hour: 22, home: 'Germany', away: 'Ivory Coast', homeScore: 2, awayScore: 1 },
  { day: 10, hour: 13, home: 'Ecuador', away: 'Curaçao', homeScore: 0, awayScore: 0 },
  // Group F - domingo 21 junio
  { day: 10, hour: 16, home: 'Tunisia', away: 'Japan', homeScore: 0, awayScore: 4 },
  // Group H
  { day: 10, hour: 19, home: 'Spain', away: 'Saudi Arabia', homeScore: 4, awayScore: 0 },
  // Group G
  { day: 10, hour: 22, home: 'Belgium', away: 'Iran', homeScore: 0, awayScore: 0 },
  { day: 11, hour: 13, home: 'Uruguay', away: 'Cape Verde', homeScore: 2, awayScore: 2 },
  { day: 11, hour: 16, home: 'New Zealand', away: 'Egypt', homeScore: 1, awayScore: 3 },
  // Group J - lunes 22 junio
  { day: 11, hour: 19, home: 'Argentina', away: 'Austria', homeScore: 2, awayScore: 0 },
  // Group I
  { day: 11, hour: 22, home: 'France', away: 'Iraq', homeScore: 3, awayScore: 0 },
  { day: 12, hour: 13, home: 'Norway', away: 'Senegal', homeScore: 3, awayScore: 2 },
  // Group J - martes 23 junio
  { day: 12, hour: 16, home: 'Jordan', away: 'Algeria', homeScore: 1, awayScore: 2 },
  // Group K
  { day: 12, hour: 19, home: 'Portugal', away: 'Uzbekistan', homeScore: 5, awayScore: 0 },
  // Group L
  { day: 12, hour: 22, home: 'England', away: 'Ghana', homeScore: 0, awayScore: 0 },
  { day: 13, hour: 13, home: 'Panama', away: 'Croatia', homeScore: 0, awayScore: 1 },
  // Group K
  { day: 13, hour: 16, home: 'Colombia', away: 'DR Congo', homeScore: 1, awayScore: 0 },
  // Group B - miércoles 24 junio
  { day: 13, hour: 19, home: 'Switzerland', away: 'Canada', homeScore: 2, awayScore: 1 },
  { day: 13, hour: 22, home: 'Bosnia and Herzegovina', away: 'Qatar', homeScore: 3, awayScore: 1 },
  // Group C
  { day: 14, hour: 13, home: 'Scotland', away: 'Brazil', homeScore: 0, awayScore: 3 },
  { day: 14, hour: 16, home: 'Morocco', away: 'Haiti', homeScore: 4, awayScore: 2 },
  // Group A
  { day: 14, hour: 19, home: 'Czech Republic', away: 'México', homeScore: 0, awayScore: 3 },
  { day: 14, hour: 22, home: 'South Africa', away: 'South Korea', homeScore: 1, awayScore: 0 },
  // Group E - jueves 25 junio
  { day: 15, hour: 13, home: 'Curaçao', away: 'Ivory Coast', homeScore: 0, awayScore: 2 },
  { day: 15, hour: 16, home: 'Ecuador', away: 'Germany', homeScore: 2, awayScore: 1 },
  // Group F
  { day: 15, hour: 19, home: 'Japan', away: 'Sweden', homeScore: 1, awayScore: 1 },
  { day: 15, hour: 22, home: 'Tunisia', away: 'Netherlands', homeScore: 1, awayScore: 3 },
  // Group D
  { day: 16, hour: 13, home: 'Turkey', away: 'USA', homeScore: 3, awayScore: 2 },
  { day: 16, hour: 16, home: 'Paraguay', away: 'Australia', homeScore: 0, awayScore: 0 },
  // Group I - viernes 26 junio
  { day: 16, hour: 19, home: 'Norway', away: 'France', homeScore: 1, awayScore: 4 },
  { day: 16, hour: 22, home: 'Senegal', away: 'Iraq', homeScore: 5, awayScore: 0 },
  // Group H
  { day: 17, hour: 13, home: 'Cape Verde', away: 'Saudi Arabia', homeScore: 0, awayScore: 0 },
  { day: 17, hour: 16, home: 'Uruguay', away: 'Spain', homeScore: 0, awayScore: 1 },
  // Group G - sábado 27 junio
  { day: 17, hour: 19, home: 'Egypt', away: 'Iran', homeScore: 1, awayScore: 1 },
  { day: 17, hour: 22, home: 'New Zealand', away: 'Belgium', homeScore: 1, awayScore: 5 },
  // Group L
  { day: 18, hour: 13, home: 'Panama', away: 'England', homeScore: 0, awayScore: 2 },
  { day: 18, hour: 16, home: 'Croatia', away: 'Ghana', homeScore: 2, awayScore: 1 },
  // Group K
  { day: 18, hour: 19, home: 'Colombia', away: 'Portugal', homeScore: 0, awayScore: 0 },
  { day: 18, hour: 22, home: 'DR Congo', away: 'Uzbekistan', homeScore: 3, awayScore: 1 },
  // Group J
  { day: 19, hour: 13, home: 'Algeria', away: 'Austria', homeScore: 3, awayScore: 3 },
  { day: 19, hour: 16, home: 'Jordan', away: 'Argentina', homeScore: 1, awayScore: 3 },
]

function matchDate(base: Date, dayOffset: number, hour: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, 0, 0, 0)
  return d
}

async function main() {
  await prisma.match.deleteMany()
  await prisma.team.deleteMany()

  const teamMap = new Map<string, number>()

  for (const t of teamDefs) {
    const team = await prisma.team.create({
      data: {
        name: t.name,
        code: t.code,
        groupName: t.group,
        apiId: teamMap.size + 1,
        flag: null,
      },
    })
    teamMap.set(t.name, team.id)
  }
  console.log(`Created ${teamMap.size} teams`)

  const startDate = new Date('2026-06-11')

  let apiCounter = 0

  // Group matches
  for (const m of groupMatches) {
    apiCounter++
    const homeId = teamMap.get(m.home)
    const awayId = teamMap.get(m.away)
    if (!homeId || !awayId) {
      console.warn(`Team not found: ${m.home} vs ${m.away}`)
      continue
    }
    await prisma.match.create({
      data: {
        apiId: apiCounter,
        phase: 'group',
        round: `Group Stage`,
        date: matchDate(startDate, m.day, m.hour),
        status: 'FT',
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeScore: m.homeScore ?? null,
        awayScore: m.awayScore ?? null,
      },
    })
  }
  console.log(`Created ${groupMatches.length} group matches`)

  // Round of 32
  const r32: MatchInput[] = [
    // domingo 28 junio
    { day: 17, hour: 22, home: 'South Africa', away: 'Canada', homeScore: 0, awayScore: 1 },
    // lunes 29 junio
    { day: 18, hour: 22, home: 'Brazil', away: 'Japan', homeScore: 2, awayScore: 1 },
    { day: 19, hour: 19, home: 'Germany', away: 'Paraguay', homeScore: 1, awayScore: 1, penHome: 3, penAway: 4 },
    { day: 19, hour: 22, home: 'Netherlands', away: 'Morocco', homeScore: 1, awayScore: 1, penHome: 2, penAway: 3 },
    // martes 30 junio
    { day: 20, hour: 13, home: 'Ivory Coast', away: 'Norway', homeScore: 1, awayScore: 2 },
    { day: 20, hour: 16, home: 'France', away: 'Sweden', homeScore: 3, awayScore: 0 },
    { day: 20, hour: 19, home: 'México', away: 'Ecuador', homeScore: 2, awayScore: 0 },
    // miércoles 01 julio
    { day: 20, hour: 22, home: 'England', away: 'DR Congo', homeScore: 2, awayScore: 1 },
    { day: 21, hour: 13, home: 'Belgium', away: 'Senegal', homeScore: 3, awayScore: 2 },
    { day: 21, hour: 16, home: 'USA', away: 'Bosnia and Herzegovina', homeScore: 2, awayScore: 0 },
    // jueves 02 julio - SCHEDULED (no scores yet)
    { day: 21, hour: 19, home: 'Spain', away: 'Austria' },
    { day: 21, hour: 22, home: 'Portugal', away: 'Croatia' },
    // viernes 03 julio - SCHEDULED
    { day: 22, hour: 13, home: 'Switzerland', away: 'Algeria' },
    { day: 22, hour: 16, home: 'Australia', away: 'Egypt' },
    { day: 22, hour: 19, home: 'Argentina', away: 'Cape Verde' },
    { day: 22, hour: 22, home: 'Colombia', away: 'Ghana' },
  ]

  for (const m of r32) {
    apiCounter++
    const homeId = teamMap.get(m.home)
    const awayId = teamMap.get(m.away)
    if (!homeId || !awayId) {
      console.warn(`Team not found: ${m.home} vs ${m.away}`)
      continue
    }
    const hasScore = m.homeScore !== undefined && m.awayScore !== undefined
    await prisma.match.create({
      data: {
        apiId: apiCounter,
        phase: 'round_of_32',
        round: 'Round of 32',
        date: matchDate(startDate, m.day, m.hour),
        status: hasScore ? 'FT' : 'scheduled',
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeScore: m.homeScore ?? null,
        awayScore: m.awayScore ?? null,
      },
    })
  }
  console.log(`Created ${r32.length} round_of_32 matches`)

  // Round of 16 (scheduled, some with known teams)
  const r16: MatchInput[] = [
    // sábado 04 julio
    { day: 23, hour: 14, home: 'Canada', away: 'Morocco' },
    { day: 23, hour: 18, home: 'France', away: 'Paraguay' },
    // domingo 05 julio
    { day: 24, hour: 17, home: 'Brazil', away: 'Norway' },
    { day: 24, hour: 21, home: 'México', away: 'England' },
    // lunes 06 julio
    { day: 25, hour: 16, home: 'W83', away: 'W84' },  // TBD
    { day: 25, hour: 21, home: 'USA', away: 'Belgium' },
    // martes 07 julio
    { day: 26, hour: 13, home: 'W86', away: 'W88' },  // TBD
    { day: 26, hour: 17, home: 'W85', away: 'W87' },  // TBD
  ]

  for (const m of r16) {
    apiCounter++
    await prisma.match.create({
      data: {
        apiId: apiCounter,
        phase: 'round_of_16',
        round: 'Round of 16',
        date: matchDate(startDate, m.day, m.hour),
        status: 'scheduled',
        homeTeamId: m.home.startsWith('W') ? null : (teamMap.get(m.home) ?? null),
        awayTeamId: m.away.startsWith('W') ? null : (teamMap.get(m.away) ?? null),
        homeScore: null,
        awayScore: null,
      },
    })
  }
  console.log(`Created ${r16.length} round_of_16 matches`)

  // Quarter finals (scheduled, TBD teams)
  const qf = [
    { day: 28, hour: 17, phase: 'quarter_final', round: 'Quarter-final' },
    { day: 29, hour: 16, phase: 'quarter_final', round: 'Quarter-final' },
    { day: 30, hour: 18, phase: 'quarter_final', round: 'Quarter-final' },
    { day: 30, hour: 22, phase: 'quarter_final', round: 'Quarter-final' },
  ]
  for (const m of qf) {
    apiCounter++
    await prisma.match.create({
      data: {
        apiId: apiCounter,
        phase: m.phase,
        round: m.round,
        date: matchDate(startDate, m.day, m.hour),
        status: 'scheduled',
      },
    })
  }
  console.log(`Created ${qf.length} quarter-final matches`)

  // Semifinals
  const sf = [
    { day: 33, hour: 16, phase: 'semi_final', round: 'Semi-final' },
    { day: 34, hour: 16, phase: 'semi_final', round: 'Semi-final' },
  ]
  for (const m of sf) {
    apiCounter++
    await prisma.match.create({
      data: {
        apiId: apiCounter,
        phase: m.phase,
        round: m.round,
        date: matchDate(startDate, m.day, m.hour),
        status: 'scheduled',
      },
    })
  }
  console.log(`Created ${sf.length} semi-final matches`)

  // Third place
  await prisma.match.create({
    data: {
      apiId: ++apiCounter,
      phase: 'third_place',
      round: 'Third place',
      date: matchDate(startDate, 37, 18),
      status: 'scheduled',
    },
  })

  // Final
  await prisma.match.create({
    data: {
      apiId: ++apiCounter,
      phase: 'final',
      round: 'Final',
      date: matchDate(startDate, 38, 16),
      status: 'scheduled',
    },
  })

  console.log('Seed complete!')

  // Admin user
  const existing = await prisma.user.findUnique({ where: { email: 'facu@test.com' } })
  if (!existing) {
    const hashed = await bcrypt.hash('123456', 10)
    await prisma.user.create({
      data: { username: 'facu', email: 'facu@test.com', password: hashed, firstName: 'Facundo', role: 'ADMIN' },
    })
    console.log('Admin user created')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
