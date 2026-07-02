import { prisma } from '../../config/prisma.js'

export async function listTeams() {
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } })
  return teams.map((t) => ({ id: t.id, name: t.name, code: t.code, groupName: t.groupName }))
}
