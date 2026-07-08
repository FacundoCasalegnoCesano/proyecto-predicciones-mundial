export interface TeamDTO {
  id: number
  name: string
  code: string
}

export interface MatchDTO {
  id: number
  phase: string
  round?: string
  date: string
  status: string
  homeTeam: TeamDTO | null
  awayTeam: TeamDTO | null
  homeScore: number | null
  awayScore: number | null
}

export interface PredictionDTO {
  id: number
  userId?: number
  user?: any
  matchId: number
  predictedHomeScore: number
  predictedAwayScore: number
  points: number
  match: MatchDTO
}

export function mapPredictionToDTO(p: any): PredictionDTO {
  return {
    id: p.id,
    userId: p.userId,
    user: p.user,
    matchId: p.matchId,
    predictedHomeScore: p.predictedHomeScore,
    predictedAwayScore: p.predictedAwayScore,
    points: p.points,
    match: mapMatchToDTO(p.match),
  }
}

export function mapMatchToDTO(match: any): MatchDTO {
  return {
    id: match.id,
    phase: match.phase,
    round: match.round,
    date: match.date,
    status: match.status,
    homeTeam: match.homeTeam ? { id: match.homeTeam.id, name: match.homeTeam.name, code: match.homeTeam.code } : null,
    awayTeam: match.awayTeam ? { id: match.awayTeam.id, name: match.awayTeam.name, code: match.awayTeam.code } : null,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  }
}
